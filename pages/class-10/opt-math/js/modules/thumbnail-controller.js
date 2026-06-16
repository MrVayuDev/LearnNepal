/**
 * Thumbnail Controller — Sidebar Thumbnail Panel
 *
 * Generates and manages low-resolution thumbnails of PDF pages
 * for the sidebar navigation. Implements lazy loading and intersection
 * observation so we only render thumbnails that are visible.
 */

export class ThumbnailController {
  /**
   * @param {import('./pdf-engine.js').SecurePDFEngine} engine
   * @param {object} elements
   */
  constructor(engine, elements) {
    this.engine = engine;
    this.container = elements.container; // DOM element to hold thumbnails
    
    this.thumbnails = new Map(); // pageIndex -> HTMLElement
    this.isOpen = false;
    this.isActive = false;

    this._observer = null;
    this._activePageIndex = 0;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Initialize and build thumbnails for the loaded document.
   */
  async buildThumbnails() {
    this.container.innerHTML = '';
    this.thumbnails.clear();
    
    if (!this.engine.pdfDocument || this.engine.totalPages === 0) return;

    this._setupObserver();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.engine.totalPages; i++) {
      const dims = this.engine.pageDimensions.get(i);
      if (!dims) continue;

      const ratio = dims.height / dims.width;
      const thumbWidth = 140; // Fixed thumbnail width
      const thumbHeight = thumbWidth * ratio;

      const thumbWrapper = document.createElement('div');
      thumbWrapper.className = 'pdf-thumbnail-wrapper';
      thumbWrapper.dataset.pageIndex = i;
      thumbWrapper.setAttribute('role', 'button');
      thumbWrapper.setAttribute('aria-label', `Go to page ${i + 1}`);
      thumbWrapper.tabIndex = 0;

      // Handle clicking thumbnail
      thumbWrapper.addEventListener('click', () => {
        this.engine.goToPage(i + 1);
      });
      thumbWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.engine.goToPage(i + 1);
        }
      });

      const canvasContainer = document.createElement('div');
      canvasContainer.className = 'pdf-thumbnail-canvas-container';
      canvasContainer.style.width = `${thumbWidth}px`;
      canvasContainer.style.height = `${thumbHeight}px`;

      const label = document.createElement('span');
      label.className = 'pdf-thumbnail-label';
      label.textContent = i + 1;

      thumbWrapper.appendChild(canvasContainer);
      thumbWrapper.appendChild(label);
      
      this.thumbnails.set(i, thumbWrapper);
      fragment.appendChild(thumbWrapper);
      
      this._observer.observe(thumbWrapper);
    }

    this.container.appendChild(fragment);
    this.updateActivePage(this.engine.getCurrentPage());
  }

  /**
   * Update the active thumbnail styling based on current page
   * @param {number} pageNum - 1-indexed page number
   */
  updateActivePage(pageNum) {
    const pageIndex = pageNum - 1;
    if (pageIndex === this._activePageIndex) return;
    
    // Remove old active
    const oldActive = this.thumbnails.get(this._activePageIndex);
    if (oldActive) oldActive.classList.remove('is-active');

    // Set new active
    const newActive = this.thumbnails.get(pageIndex);
    if (newActive) {
      newActive.classList.add('is-active');
      
      // Auto-scroll the thumbnail sidebar if needed and if sidebar is open
      if (this.isOpen) {
        newActive.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    this._activePageIndex = pageIndex;
  }

  open() {
    this.isOpen = true;
    this.container.classList.add('active');
    // Scroll active into view when opened
    const active = this.thumbnails.get(this._activePageIndex);
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('active');
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this.container.innerHTML = '';
    this.thumbnails.clear();
  }

  // ── Private ─────────────────────────────────────────────────

  _setupObserver() {
    if (this._observer) this._observer.disconnect();

    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.dataset.pageIndex, 10);
            this._renderThumbnail(pageIndex);
            // Stop observing once rendered
            this._observer.unobserve(entry.target);
          }
        });
      },
      {
        root: this.container,
        rootMargin: '100px 0px', // Preload buffer
        threshold: 0.1
      }
    );
  }

  async _renderThumbnail(pageIndex) {
    if (!this.engine.pdfDocument) return;

    const wrapper = this.thumbnails.get(pageIndex);
    if (!wrapper) return;

    const canvasContainer = wrapper.querySelector('.pdf-thumbnail-canvas-container');
    if (!canvasContainer || canvasContainer.querySelector('canvas')) return; // Already rendered

    try {
      const page = await this.engine.pdfDocument.getPage(pageIndex + 1);
      
      // Calculate scale to fit our 140px width
      const baseViewport = page.getViewport({ scale: 1.0 });
      const targetWidth = 140;
      const scale = targetWidth / baseViewport.width;
      
      const viewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      canvasContainer.appendChild(canvas);

      // Low quality render for performance
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: 'display' // Could use 'print' if 'display' is too slow for many thumbs, but 'display' is usually fine
      }).promise;
      
      wrapper.classList.add('is-rendered');

    } catch (err) {
      console.warn(`[ThumbnailController] Failed to render thumbnail for page ${pageIndex + 1}`, err);
    }
  }
}
