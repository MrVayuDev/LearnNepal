/**
 * Keyboard Navigation Controller
 *
 * Provides comprehensive keyboard shortcuts for the PDF viewer.
 * Supports customizable bindings and a visual shortcut overlay.
 *
 * Shortcut groups:
 * - Navigation: Arrow keys, Page Up/Down, Home/End, G (go to page)
 * - Zoom: +/-, 0 (reset), Ctrl+0 (fit width)
 * - Search: Ctrl+F, Escape
 * - UI: F (fullscreen), ? (shortcuts overlay), Ctrl+K (command)
 */

/** @typedef {{ key: string, ctrl?: boolean, shift?: boolean, meta?: boolean, alt?: boolean }} KeyBinding */
/** @typedef {{ label: string, description: string, binding: KeyBinding, action: () => void, category: string }} Shortcut */

export class KeyboardController {
  /**
   * @param {object} handlers - Object mapping action names to functions
   */
  constructor(handlers) {
    this.handlers = handlers;
    this.enabled = true;
    this.shortcuts = this._buildShortcutMap();
    this._overlayVisible = false;

    this._handleKeyDown = this._onKeyDown.bind(this);
    document.addEventListener('keydown', this._handleKeyDown);
  }

  // ── Public API ──────────────────────────────────────────────

  /** Enable or disable keyboard handling */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /** Show the keyboard shortcuts overlay */
  showOverlay() {
    if (this._overlayVisible) return;
    this._overlayVisible = true;

    const overlay = document.createElement('div');
    overlay.className = 'keyboard-overlay';
    overlay.id = 'keyboard-shortcuts-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="keyboard-overlay-backdrop"></div>
      <div class="keyboard-overlay-panel">
        <div class="keyboard-overlay-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="keyboard-overlay-close" aria-label="Close shortcuts overlay">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="keyboard-overlay-body">
          ${this._renderShortcutGroups()}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Close handlers
    const closeOverlay = () => this.hideOverlay();
    overlay.querySelector('.keyboard-overlay-close').addEventListener('click', closeOverlay);
    overlay.querySelector('.keyboard-overlay-backdrop').addEventListener('click', closeOverlay);
  }

  /** Hide the keyboard shortcuts overlay */
  hideOverlay() {
    this._overlayVisible = false;
    const overlay = document.getElementById('keyboard-shortcuts-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    }
  }

  /** Toggle the shortcuts overlay */
  toggleOverlay() {
    if (this._overlayVisible) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  /** Cleanup */
  destroy() {
    document.removeEventListener('keydown', this._handleKeyDown);
    this.hideOverlay();
  }

  // ── Private ─────────────────────────────────────────────────

  _buildShortcutMap() {
    const h = this.handlers;
    /** @type {Shortcut[]} */
    return [
      // Navigation
      { label: '↑ / ↓', description: 'Scroll up / down', binding: { key: 'ArrowUp' }, action: null, category: 'Navigation' },
      { label: 'Page Up', description: 'Previous page', binding: { key: 'PageUp' }, action: () => h.previousPage?.(), category: 'Navigation' },
      { label: 'Page Down', description: 'Next page', binding: { key: 'PageDown' }, action: () => h.nextPage?.(), category: 'Navigation' },
      { label: 'Home', description: 'First page', binding: { key: 'Home', ctrl: true }, action: () => h.goToPage?.(1), category: 'Navigation' },
      { label: 'End', description: 'Last page', binding: { key: 'End', ctrl: true }, action: () => h.goToLastPage?.(), category: 'Navigation' },
      { label: '← / →', description: 'Previous / next page', binding: { key: 'ArrowLeft' }, action: null, category: 'Navigation' },

      // Zoom
      { label: '+ / =', description: 'Zoom in', binding: { key: '+' }, action: () => h.zoomIn?.(), category: 'Zoom' },
      { label: '-', description: 'Zoom out', binding: { key: '-' }, action: () => h.zoomOut?.(), category: 'Zoom' },
      { label: '0', description: 'Fit to width', binding: { key: '0' }, action: () => h.fitToWidth?.(), category: 'Zoom' },

      // Search
      { label: 'Ctrl + F', description: 'Open search', binding: { key: 'f', ctrl: true }, action: () => h.openSearch?.(), category: 'Search' },
      { label: 'Escape', description: 'Close search / overlay', binding: { key: 'Escape' }, action: () => h.escape?.(), category: 'Search' },
      { label: 'Enter', description: 'Next match', binding: { key: 'Enter' }, action: null, category: 'Search' },
      { label: 'Shift + Enter', description: 'Previous match', binding: { key: 'Enter', shift: true }, action: null, category: 'Search' },

      // View
      { label: 'F', description: 'Toggle fullscreen', binding: { key: 'f' }, action: () => h.toggleFullscreen?.(), category: 'View' },
      { label: '?', description: 'Show keyboard shortcuts', binding: { key: '?' }, action: () => this.toggleOverlay(), category: 'View' },
    ];
  }

  _onKeyDown(e) {
    if (!this.enabled) return;

    // Don't capture when typing in inputs
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

    // Always allow Escape and Ctrl+F
    if (e.key === 'Escape') {
      if (this._overlayVisible) {
        e.preventDefault();
        this.hideOverlay();
        return;
      }
      this.handlers.escape?.();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      this.handlers.openSearch?.();
      return;
    }

    // Don't process other shortcuts while typing
    if (isInput) return;

    const key = e.key;

    switch (key) {
      case 'PageUp':
        e.preventDefault();
        this.handlers.previousPage?.();
        break;
      case 'PageDown':
        e.preventDefault();
        this.handlers.nextPage?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.handlers.previousPage?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.handlers.nextPage?.();
        break;
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.handlers.goToPage?.(1);
        }
        break;
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.handlers.goToLastPage?.();
        }
        break;
      case '+':
      case '=':
        e.preventDefault();
        this.handlers.zoomIn?.();
        break;
      case '-':
        e.preventDefault();
        this.handlers.zoomOut?.();
        break;
      case '0':
        e.preventDefault();
        this.handlers.fitToWidth?.();
        break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.handlers.toggleFullscreen?.();
        }
        break;
      case '?':
        e.preventDefault();
        this.toggleOverlay();
        break;
    }
  }

  _renderShortcutGroups() {
    const groups = {};
    this.shortcuts.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });

    return Object.entries(groups).map(([category, shortcuts]) => `
      <div class="keyboard-group">
        <h3>${category}</h3>
        <div class="keyboard-group-items">
          ${shortcuts.map(s => `
            <div class="keyboard-shortcut-item">
              <kbd>${s.label}</kbd>
              <span>${s.description}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}
