/**
 * Secure PDF Canvas Rendering Engine
 * 
 * Renders PDF documents page-by-page to <canvas> elements via PDF.js,
 * preventing text-layer extraction and direct asset download.
 * 
 * Supports zoom in/out/fit-to-width operations.
 */
export class SecurePDFEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pdfDocument = null;
    this.loadingTask = null;
    this.currentScale = 1.5;
    this.baseScale = 1.5;
    this.minScale = 0.5;
    this.maxScale = 4.0;
    this.currentFileName = null;
    this.onRenderComplete = null;
  }

  getCurrentScale() {
    return this.currentScale / this.baseScale;
  }

  zoomIn() {
    const newScale = Math.min(this.currentScale + 0.25, this.maxScale);
    if (newScale !== this.currentScale) {
      this.currentScale = newScale;
      if (this.currentFileName) this._rerender();
    }
  }

  zoomOut() {
    const newScale = Math.max(this.currentScale - 0.25, this.minScale);
    if (newScale !== this.currentScale) {
      this.currentScale = newScale;
      if (this.currentFileName) this._rerender();
    }
  }

  fitToWidth() {
    this.currentScale = this.baseScale;
    if (this.currentFileName) this._rerender();
  }

  async _rerender() {
    if (!this.pdfDocument) return;

    // Save scroll position
    const scrollTop = this.container.scrollTop;

    this.container.innerHTML = '';

    const totalPages = this.pdfDocument.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await this.pdfDocument.getPage(pageNum);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: this.currentScale });

      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.className = 'pdf-page-canvas';
      canvas.style.height = 'auto';

      // Intelligent responsive sizing
      const containerWidth = this.container.clientWidth - 48;
      if (viewport.width > containerWidth) {
        const scaleRatio = this.currentScale / this.baseScale;
        if (scaleRatio > 1.0) {
          canvas.style.width = `${viewport.width}px`;
          canvas.style.maxWidth = 'none';
        } else {
          canvas.style.width = '100%';
          canvas.style.maxWidth = '100%';
        }
      } else {
        canvas.style.width = `${viewport.width}px`;
        canvas.style.maxWidth = 'none';
      }

      ctx.scale(dpr, dpr);
      this.container.appendChild(canvas);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: 'display'
      }).promise;
    }

    // Restore scroll position
    this.container.scrollTop = scrollTop;

    if (this.onRenderComplete) this.onRenderComplete();
  }

  /**
   * Renders all pages of a PDF to canvas elements inside the container.
   * @param {string} fileName - The PDF filename inside assets/secure-pdfs/
   */
  async renderDocument(fileName) {
    // Cancel any in-progress loading task
    if (this.loadingTask) {
      try { this.loadingTask.destroy(); } catch (_) { /* ignore */ }
      this.loadingTask = null;
    }

    // Destroy any previously loaded PDF document
    if (this.pdfDocument) {
      try { await this.pdfDocument.destroy(); } catch (_) { /* ignore */ }
      this.pdfDocument = null;
    }

    this.currentFileName = fileName;
    this.currentScale = this.baseScale; // Reset zoom on new document

    // Show loading state
    this.container.innerHTML = `
      <div class="viewer-loading">
        <div class="viewer-loading-spinner"></div>
        <span>Loading document…</span>
      </div>
    `;
    this.container.scrollTop = 0;

    const secureUrl = `assets/secure-pdfs/${fileName}`;

    try {
      // Fetch with the secure token header
      const response = await fetch(secureUrl, {
        headers: { 'X-Secure-Stream-Token': 'true' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const dataBlob = await response.blob();
      const objectUrl = URL.createObjectURL(dataBlob);

      // Load the PDF via PDF.js
      this.loadingTask = pdfjsLib.getDocument(objectUrl);
      this.pdfDocument = await this.loadingTask.promise;

      // Clear the container for rendered pages
      this.container.innerHTML = '';

      const totalPages = this.pdfDocument.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await this.pdfDocument.getPage(pageNum);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High-DPI scaling for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: this.currentScale });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.className = 'pdf-page-canvas';
        canvas.style.height = 'auto';

        // Intelligent responsive sizing
        const containerWidth = this.container.clientWidth - 48;
        if (viewport.width > containerWidth) {
          const scaleRatio = this.currentScale / this.baseScale;
          if (scaleRatio > 1.0) {
            canvas.style.width = `${viewport.width}px`;
            canvas.style.maxWidth = 'none';
          } else {
            canvas.style.width = '100%';
            canvas.style.maxWidth = '100%';
          }
        } else {
          canvas.style.width = `${viewport.width}px`;
          canvas.style.maxWidth = 'none';
        }

        ctx.scale(dpr, dpr);

        this.container.appendChild(canvas);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          intent: 'display'
        }).promise;
      }

      // Revoke the blob URL to free memory
      URL.revokeObjectURL(objectUrl);

      if (this.onRenderComplete) this.onRenderComplete();

    } catch (err) {
      this.container.innerHTML = `
        <div class="viewer-error">
          <h3>Document Unavailable</h3>
          <p>The requested exercise PDF could not be loaded. Please ensure the file exists in the secure vault directory.</p>
          <p style="margin-top: 12px; font-size: 0.75rem; color: var(--text-tertiary);">${err.message}</p>
        </div>
      `;
      console.error('[SecurePDFEngine]', err);
    }
  }
}
