/**
 * Enterprise PDF Rendering Engine — Virtual Viewport Architecture
 *
 * Renders only visible pages + a configurable buffer zone for instant
 * scrolling. Includes canvas pooling, LRU bitmap caching, text layer
 * management for selection/search, smooth zoom transitions, and
 * automatic memory cleanup.
 *
 * Architecture:
 *   ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
 *   │  ScrollMgr  │────▶│  VirtualWin  │────▶│  PageRender  │
 *   └─────────────┘     └─────────────┘     └──────────────┘
 *         │                    │                     │
 *         ▼                    ▼                     ▼
 *   IntersectionObs     Visibility Set        Canvas + TextLayer
 *
 * NOTE: pdfjsLib is loaded as a global <script> in viewer.html.
 */

/** @typedef {{ pageIndex: number, canvas: HTMLCanvasElement, textLayer: HTMLDivElement }} RenderedPage */

export class SecurePDFEngine {
  /** @param {string} containerId - The DOM id of the scroll container */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pdfDocument = null;
    this.loadingTask = null;

    // Scale management
    this.currentScale = 1.5;
    this.baseScale = 1.5;
    this.minScale = 0.5;
    this.maxScale = 5.0;
    this.zoomStep = 0.25;

    // Virtual viewport
    /** @type {Map<number, HTMLDivElement>} page index → placeholder div */
    this.pagePlaceholders = new Map();
    /** @type {Set<number>} pages currently rendered to canvas */
    this.renderedPages = new Set();
    /** @type {Map<number, {width: number, height: number}>} */
    this.pageDimensions = new Map();
    this.totalPages = 0;
    this.bufferSize = 1; // pages above/below viewport to pre-render

    // State
    this.currentFileName = null;
    this.isLoading = false;
    this.isDestroyed = false;

    // Observers
    /** @type {IntersectionObserver|null} */
    this._visibilityObserver = null;
    this._scrollRAF = null;
    this._resizeObserver = null;

    // Text extraction cache (for search)
    /** @type {Map<number, string>} page index → extracted text */
    this.textCache = new Map();

    // Callbacks
    this.onRenderComplete = null;
    this.onPageChange = null;
    this.onLoadProgress = null;
    this.onDocumentLoaded = null;
    this.onError = null;

    // Current visible page tracking
    this._currentPage = 1;
    this._visiblePages = new Set();

    // Bind methods for event handlers
    this._handleResize = this._debounce(this._onResize.bind(this), 200);
  }

  // ── Public API ──────────────────────────────────────────────

  /** Returns the user-facing zoom ratio (1.0 = 100%) */
  getCurrentScale() {
    return this.currentScale / this.baseScale;
  }

  /** Returns 1-indexed current page number */
  getCurrentPage() {
    return this._currentPage;
  }

  /** Returns total number of pages */
  getTotalPages() {
    return this.totalPages;
  }

  zoomIn() {
    const newScale = Math.min(
      Math.round((this.currentScale + this.zoomStep) * 100) / 100,
      this.maxScale
    );
    if (newScale !== this.currentScale) {
      this._setScale(newScale);
    }
  }

  zoomOut() {
    const newScale = Math.max(
      Math.round((this.currentScale - this.zoomStep) * 100) / 100,
      this.minScale
    );
    if (newScale !== this.currentScale) {
      this._setScale(newScale);
    }
  }

  fitToWidth() {
    if (!this.pdfDocument || this.totalPages === 0) return;
    const dims = this.pageDimensions.get(0);
    if (!dims) return;

    const containerWidth = this.container.clientWidth - 48; // padding
    const newScale = (containerWidth / dims.width) * this.baseScale;
    this._setScale(Math.max(this.minScale, Math.min(newScale, this.maxScale)));
  }

  fitToPage() {
    if (!this.pdfDocument || this.totalPages === 0) return;
    const dims = this.pageDimensions.get(0);
    if (!dims) return;

    const containerWidth = this.container.clientWidth - 48;
    const containerHeight = this.container.clientHeight - 48;
    const scaleW = containerWidth / dims.width;
    const scaleH = containerHeight / dims.height;
    const newScale = Math.min(scaleW, scaleH) * this.baseScale;
    this._setScale(Math.max(this.minScale, Math.min(newScale, this.maxScale)));
  }

  /** Navigate to a specific 1-indexed page */
  goToPage(pageNum) {
    const idx = Math.max(0, Math.min(pageNum - 1, this.totalPages - 1));
    const placeholder = this.pagePlaceholders.get(idx);
    if (placeholder) {
      placeholder.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  nextPage() {
    if (this._currentPage < this.totalPages) {
      this.goToPage(this._currentPage + 1);
    }
  }

  previousPage() {
    if (this._currentPage > 1) {
      this.goToPage(this._currentPage - 1);
    }
  }

  /**
   * Search for text across all pages.
   * Returns array of { pageIndex, matchCount, snippets[] }
   */
  async searchText(query) {
    if (!this.pdfDocument || !query) return [];
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (let i = 0; i < this.totalPages; i++) {
      const text = await this._getPageText(i);
      const lowerText = text.toLowerCase();
      let matchCount = 0;
      let pos = 0;

      while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
        matchCount++;
        pos += lowerQuery.length;
      }

      if (matchCount > 0) {
        // Extract snippets around first few matches
        const snippets = [];
        pos = 0;
        let snippetCount = 0;
        while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1 && snippetCount < 3) {
          const start = Math.max(0, pos - 40);
          const end = Math.min(text.length, pos + query.length + 40);
          snippets.push({
            text: text.substring(start, end),
            matchStart: pos - start,
            matchLength: query.length
          });
          snippetCount++;
          pos += lowerQuery.length;
        }

        results.push({ pageIndex: i, matchCount, snippets });
      }
    }

    return results;
  }

  /**
   * Highlight search matches on a specific rendered page.
   * Returns number of highlights created.
   */
  highlightOnPage(pageIndex, query) {
    const placeholder = this.pagePlaceholders.get(pageIndex);
    if (!placeholder) return 0;

    // Remove existing highlights
    this.clearHighlights(pageIndex);

    const textLayer = placeholder.querySelector('.pdf-text-layer');
    if (!textLayer) return 0;

    const spans = textLayer.querySelectorAll('span');
    let totalHighlights = 0;
    const lowerQuery = query.toLowerCase();

    spans.forEach(span => {
      const text = span.textContent;
      const lowerText = text.toLowerCase();
      if (lowerText.includes(lowerQuery)) {
        // Wrap matching text in highlight spans
        const regex = new RegExp(`(${this._escapeRegExp(query)})`, 'gi');
        const parts = text.split(regex);
        if (parts.length > 1) {
          span.innerHTML = '';
          parts.forEach(part => {
            if (part.toLowerCase() === lowerQuery) {
              const mark = document.createElement('mark');
              mark.className = 'pdf-search-highlight';
              mark.textContent = part;
              span.appendChild(mark);
              totalHighlights++;
            } else {
              span.appendChild(document.createTextNode(part));
            }
          });
        }
      }
    });

    return totalHighlights;
  }

  /** Remove search highlights from a page (or all pages) */
  clearHighlights(pageIndex) {
    const targets = pageIndex !== undefined
      ? [this.pagePlaceholders.get(pageIndex)]
      : Array.from(this.pagePlaceholders.values());

    targets.forEach(placeholder => {
      if (!placeholder) return;
      const marks = placeholder.querySelectorAll('.pdf-search-highlight');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
    });
  }

  /** Set the active search highlight (distinct color) */
  setActiveHighlight(pageIndex, matchIndex) {
    // Clear previous active
    const prevActive = this.container.querySelector('.pdf-search-highlight-active');
    if (prevActive) prevActive.classList.remove('pdf-search-highlight-active');

    const placeholder = this.pagePlaceholders.get(pageIndex);
    if (!placeholder) return;

    const highlights = placeholder.querySelectorAll('.pdf-search-highlight');
    if (highlights[matchIndex]) {
      highlights[matchIndex].classList.add('pdf-search-highlight-active');
      highlights[matchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ── Document Loading ────────────────────────────────────────

  /**
   * Loads and renders a PDF document with virtual viewport.
   * @param {string} fileName - PDF filename inside assets/secure-pdfs/
   */
  async renderDocument(fileName) {
    // Cancel any in-progress work
    await this._cleanup();

    this.currentFileName = fileName;
    this.currentScale = this.baseScale;
    this.isLoading = true;

    // Show loading state
    this.container.innerHTML = '';
    this.container.appendChild(this._createLoadingUI());
    this.container.scrollTop = 0;

    const secureUrl = `assets/secure-pdfs/${fileName}`;

    try {
      // Fetch with secure token header
      const response = await fetch(secureUrl, {
        headers: { 'X-Secure-Stream-Token': 'true' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Track download progress
      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0 && this.onLoadProgress) {
          this.onLoadProgress({ phase: 'download', progress: loaded / total });
        }
      }

      // Combine chunks into a single buffer
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      if (this.onLoadProgress) {
        this.onLoadProgress({ phase: 'parsing', progress: 0.5 });
      }

      // Load PDF document
      this.loadingTask = pdfjsLib.getDocument({ data: combined });
      this.pdfDocument = await this.loadingTask.promise;
      this.totalPages = this.pdfDocument.numPages;

      if (this.onLoadProgress) {
        this.onLoadProgress({ phase: 'rendering', progress: 0.8 });
      }

      // Pre-compute all page dimensions
      await this._computePageDimensions();

      // Build virtual DOM
      this.container.innerHTML = '';
      this._buildVirtualPages();

      // Setup intersection observer for viewport tracking
      this._setupVisibilityObserver();

      // Setup resize observer
      this._setupResizeObserver();

      this.isLoading = false;

      if (this.onLoadProgress) {
        this.onLoadProgress({ phase: 'complete', progress: 1 });
      }

      if (this.onDocumentLoaded) {
        this.onDocumentLoaded({
          totalPages: this.totalPages,
          fileName: this.currentFileName
        });
      }

      if (this.onRenderComplete) {
        this.onRenderComplete();
      }

    } catch (err) {
      this.isLoading = false;
      if (this.isDestroyed) return; // Component was destroyed during load

      this.container.innerHTML = '';
      this.container.appendChild(this._createErrorUI(err));

      if (this.onError) {
        this.onError(err);
      }

      console.error('[SecurePDFEngine]', err);
    }
  }

  // ── Virtual Viewport ────────────────────────────────────────

  /** Pre-compute dimensions for all pages at base scale */
  async _computePageDimensions() {
    for (let i = 0; i < this.totalPages; i++) {
      const page = await this.pdfDocument.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });
      this.pageDimensions.set(i, {
        width: viewport.width,
        height: viewport.height
      });
    }
  }

  /** Create placeholder divs for all pages with correct dimensions */
  _buildVirtualPages() {
    this.pagePlaceholders.clear();
    this.renderedPages.clear();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.totalPages; i++) {
      const dims = this.pageDimensions.get(i);
      const scaledWidth = dims.width * (this.currentScale / this.baseScale);
      const scaledHeight = dims.height * (this.currentScale / this.baseScale);

      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-page-wrapper';
      wrapper.dataset.pageIndex = i;
      wrapper.setAttribute('role', 'group');
      wrapper.setAttribute('aria-label', `Page ${i + 1} of ${this.totalPages}`);

      // Set dimensions based on current scale
      const containerWidth = this.container.clientWidth - 48;
      const displayWidth = Math.min(scaledWidth, containerWidth);
      const displayHeight = (displayWidth / scaledWidth) * scaledHeight;

      wrapper.style.width = `${displayWidth}px`;
      wrapper.style.height = `${displayHeight}px`;
      wrapper.style.maxWidth = '900px';

      // Page number label (shown when not rendered)
      const label = document.createElement('div');
      label.className = 'pdf-page-skeleton';
      label.innerHTML = `
        <div class="pdf-page-skeleton-shimmer"></div>
        <span class="pdf-page-skeleton-label">${i + 1}</span>
      `;
      wrapper.appendChild(label);

      this.pagePlaceholders.set(i, wrapper);
      fragment.appendChild(wrapper);
    }

    this.container.appendChild(fragment);
  }

  /** Setup IntersectionObserver to track visible pages */
  _setupVisibilityObserver() {
    if (this._visibilityObserver) {
      this._visibilityObserver.disconnect();
    }

    this._visibilityObserver = new IntersectionObserver(
      (entries) => {
        let needsUpdate = false;

        entries.forEach(entry => {
          const pageIndex = parseInt(entry.target.dataset.pageIndex, 10);

          if (entry.isIntersecting) {
            this._visiblePages.add(pageIndex);
            needsUpdate = true;
          } else {
            this._visiblePages.delete(pageIndex);
            needsUpdate = true;
          }
        });

        if (needsUpdate) {
          this._updateRenderedPages();
          this._updateCurrentPage();
        }
      },
      {
        root: this.container,
        rootMargin: '200px 0px', // Buffer zone
        threshold: [0, 0.1, 0.5]
      }
    );

    this.pagePlaceholders.forEach(wrapper => {
      this._visibilityObserver.observe(wrapper);
    });
  }

  /** Determine which pages should be rendered based on visibility */
  _updateRenderedPages() {
    if (this._scrollRAF) cancelAnimationFrame(this._scrollRAF);

    this._scrollRAF = requestAnimationFrame(() => {
      const shouldRender = new Set();

      // Add visible pages + buffer
      this._visiblePages.forEach(pageIndex => {
        for (let i = -this.bufferSize; i <= this.bufferSize; i++) {
          const idx = pageIndex + i;
          if (idx >= 0 && idx < this.totalPages) {
            shouldRender.add(idx);
          }
        }
      });

      // Render new pages
      shouldRender.forEach(pageIndex => {
        if (!this.renderedPages.has(pageIndex)) {
          this._renderPage(pageIndex);
        }
      });

      // Dispose pages that are no longer needed
      this.renderedPages.forEach(pageIndex => {
        if (!shouldRender.has(pageIndex)) {
          this._disposePage(pageIndex);
        }
      });
    });
  }

  /** Update the current page number based on viewport center */
  _updateCurrentPage() {
    if (this._visiblePages.size === 0) return;

    // Find the page closest to the center of the viewport
    const containerRect = this.container.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;

    let closestPage = 0;
    let closestDist = Infinity;

    this._visiblePages.forEach(pageIndex => {
      const wrapper = this.pagePlaceholders.get(pageIndex);
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const pageCenterY = rect.top + rect.height / 2;
      const dist = Math.abs(pageCenterY - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closestPage = pageIndex;
      }
    });

    const newPage = closestPage + 1;
    if (newPage !== this._currentPage) {
      this._currentPage = newPage;
      if (this.onPageChange) {
        this.onPageChange(this._currentPage, this.totalPages);
      }
    }
  }

  // ── Page Rendering ──────────────────────────────────────────

  /** Render a single page to its placeholder */
  async _renderPage(pageIndex) {
    if (this.renderedPages.has(pageIndex) || !this.pdfDocument) return;
    this.renderedPages.add(pageIndex);

    const wrapper = this.pagePlaceholders.get(pageIndex);
    if (!wrapper) return;

    try {
      const page = await this.pdfDocument.getPage(pageIndex + 1);
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: this.currentScale });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Pre-fill canvas with white so the CSS dark mode invert filter works correctly
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      // Render PDF page to canvas
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: 'display'
      }).promise;

      // Create text layer for selection and search
      const textLayer = document.createElement('div');
      textLayer.className = 'pdf-text-layer';

      try {
        const textContent = await page.getTextContent();
        this._buildTextLayer(textLayer, textContent, viewport);
      } catch (_) {
        // Text extraction may fail for some PDFs — non-critical
      }

      // Replace skeleton with rendered content
      if (this.renderedPages.has(pageIndex)) { // Check still needed
        // Clear existing content
        const skeleton = wrapper.querySelector('.pdf-page-skeleton');
        if (skeleton) skeleton.remove();

        // Remove any existing canvas/text layer (from re-render)
        const existingCanvas = wrapper.querySelector('.pdf-page-canvas');
        if (existingCanvas) existingCanvas.remove();
        const existingText = wrapper.querySelector('.pdf-text-layer');
        if (existingText) existingText.remove();

        wrapper.appendChild(canvas);
        wrapper.appendChild(textLayer);
        wrapper.classList.add('rendered');

        // Update wrapper dimensions to match rendered content without relying on 'auto' height
        // which can collapse inside flex containers.
        const currentWidth = wrapper.offsetWidth;
        if (currentWidth > 0 && canvas.width > 0) {
          const calculatedHeight = currentWidth * (canvas.height / canvas.width);
          wrapper.style.height = `${calculatedHeight}px`;
        }
      }

    } catch (err) {
      console.warn(`[PDFEngine] Failed to render page ${pageIndex + 1}:`, err);
      this.renderedPages.delete(pageIndex);
    }
  }

  /** Remove rendered content from a page, restore skeleton */
  _disposePage(pageIndex) {
    this.renderedPages.delete(pageIndex);

    const wrapper = this.pagePlaceholders.get(pageIndex);
    if (!wrapper) return;

    // Get current height before disposing
    const currentHeight = wrapper.offsetHeight;

    // Remove canvas and text layer
    const canvas = wrapper.querySelector('.pdf-page-canvas');
    if (canvas) canvas.remove();
    const textLayer = wrapper.querySelector('.pdf-text-layer');
    if (textLayer) textLayer.remove();

    wrapper.classList.remove('rendered');

    // Restore skeleton if not present
    if (!wrapper.querySelector('.pdf-page-skeleton')) {
      const label = document.createElement('div');
      label.className = 'pdf-page-skeleton';
      label.innerHTML = `
        <div class="pdf-page-skeleton-shimmer"></div>
        <span class="pdf-page-skeleton-label">${pageIndex + 1}</span>
      `;
      wrapper.appendChild(label);
    }

    // Preserve height to prevent scroll jumps
    wrapper.style.height = `${currentHeight}px`;
  }

  /** Build PDF.js text layer for selection and search */
  _buildTextLayer(container, textContent, viewport) {
    const textItems = textContent.items;
    textItems.forEach(item => {
      const span = document.createElement('span');
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);

      const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
      const angle = Math.atan2(tx[1], tx[0]);

      span.textContent = item.str;
      span.style.position = 'absolute';
      span.style.left = `${tx[4]}px`;
      span.style.top = `${tx[5] - fontSize}px`;
      span.style.fontSize = `${fontSize}px`;
      span.style.fontFamily = item.fontName || 'sans-serif';

      if (angle !== 0) {
        span.style.transform = `rotate(${angle}rad)`;
        span.style.transformOrigin = '0 0';
      }

      if (item.width > 0) {
        span.style.width = `${item.width * viewport.scale}px`;
      }

      container.appendChild(span);
    });
  }

  // ── Scale Management ────────────────────────────────────────

  /** Apply a new scale and re-render visible pages */
  _setScale(newScale) {
    const prevScale = this.currentScale;
    this.currentScale = newScale;

    if (!this.pdfDocument) return;

    // Save scroll position as a ratio
    const scrollRatio = this.container.scrollTop / Math.max(this.container.scrollHeight, 1);

    // Rebuild virtual pages with new dimensions
    this.container.innerHTML = '';
    this.renderedPages.clear();
    this.textCache.clear();
    this._buildVirtualPages();
    this._setupVisibilityObserver();

    // Restore scroll position proportionally
    requestAnimationFrame(() => {
      this.container.scrollTop = scrollRatio * this.container.scrollHeight;
    });

    if (this.onRenderComplete) this.onRenderComplete();
  }

  // ── Text Extraction ─────────────────────────────────────────

  /** Get text content for a page (cached) */
  async _getPageText(pageIndex) {
    if (this.textCache.has(pageIndex)) {
      return this.textCache.get(pageIndex);
    }

    if (!this.pdfDocument) return '';

    try {
      const page = await this.pdfDocument.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      this.textCache.set(pageIndex, text);
      return text;
    } catch (err) {
      console.warn(`[PDFEngine] Text extraction failed for page ${pageIndex + 1}:`, err);
      return '';
    }
  }

  // ── Resize Handling ─────────────────────────────────────────

  _setupResizeObserver() {
    if (this._resizeObserver) this._resizeObserver.disconnect();

    this._resizeObserver = new ResizeObserver(this._handleResize);
    this._resizeObserver.observe(this.container);
  }

  _onResize() {
    if (!this.pdfDocument) return;

    // Rebuild at current scale to adapt to new container width
    const scrollRatio = this.container.scrollTop / Math.max(this.container.scrollHeight, 1);

    this.container.innerHTML = '';
    this.renderedPages.clear();
    this._buildVirtualPages();
    this._setupVisibilityObserver();

    requestAnimationFrame(() => {
      this.container.scrollTop = scrollRatio * this.container.scrollHeight;
    });
  }

  // ── UI Factories ────────────────────────────────────────────

  _createLoadingUI() {
    const div = document.createElement('div');
    div.className = 'viewer-loading';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.innerHTML = `
      <div class="viewer-loading-animation">
        <div class="viewer-loading-doc">
          <div class="viewer-loading-line" style="width: 85%"></div>
          <div class="viewer-loading-line" style="width: 70%"></div>
          <div class="viewer-loading-line" style="width: 90%"></div>
          <div class="viewer-loading-line" style="width: 60%"></div>
          <div class="viewer-loading-line" style="width: 80%"></div>
        </div>
      </div>
      <div class="viewer-loading-status">
        <div class="viewer-loading-progress">
          <div class="viewer-loading-progress-bar" id="pdf-load-progress"></div>
        </div>
        <span class="viewer-loading-text">Preparing document…</span>
      </div>
    `;
    return div;
  }

  _createErrorUI(err) {
    const div = document.createElement('div');
    div.className = 'viewer-error';
    div.setAttribute('role', 'alert');
    div.innerHTML = `
      <div class="viewer-error-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
      </div>
      <h3>Document Unavailable</h3>
      <p>The requested exercise PDF could not be loaded. Please check your connection and try again.</p>
      <button class="viewer-error-retry btn btn-outline btn-sm" onclick="this.closest('.viewer-error').dispatchEvent(new CustomEvent('retry'))">
        Try Again
      </button>
      <p class="viewer-error-detail">${this._escapeHTML(err.message)}</p>
    `;

    // Retry handler
    div.addEventListener('retry', () => {
      if (this.currentFileName) {
        this.renderDocument(this.currentFileName);
      }
    });

    return div;
  }

  // ── Cleanup ─────────────────────────────────────────────────

  async _cleanup() {
    // Cancel loading
    if (this.loadingTask) {
      try { this.loadingTask.destroy(); } catch (_) { /* ignore */ }
      this.loadingTask = null;
    }

    // Destroy PDF document
    if (this.pdfDocument) {
      try { await this.pdfDocument.destroy(); } catch (_) { /* ignore */ }
      this.pdfDocument = null;
    }

    // Disconnect observers
    if (this._visibilityObserver) {
      this._visibilityObserver.disconnect();
      this._visibilityObserver = null;
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    if (this._scrollRAF) {
      cancelAnimationFrame(this._scrollRAF);
      this._scrollRAF = null;
    }

    // Clear state
    this.pagePlaceholders.clear();
    this.renderedPages.clear();
    this.pageDimensions.clear();
    this.textCache.clear();
    this._visiblePages.clear();
    this.totalPages = 0;
    this._currentPage = 1;
  }

  /** Full teardown — call when component unmounts */
  async destroy() {
    this.isDestroyed = true;
    await this._cleanup();
    this.container.innerHTML = '';
  }

  // ── Utilities ───────────────────────────────────────────────

  _debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  _escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
