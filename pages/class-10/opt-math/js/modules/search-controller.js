/**
 * Search Controller — PDF Text Search Module
 *
 * Manages the search UI state, text extraction, match navigation,
 * and highlight synchronization with the PDF engine.
 *
 * Features:
 * - Case-sensitive / insensitive toggle
 * - Match counter with navigation (prev/next)
 * - Auto-scroll to active match
 * - Debounced search for performance
 * - Keyboard shortcuts (Enter = next, Shift+Enter = prev, Escape = close)
 */

export class SearchController {
  /**
   * @param {import('./pdf-engine.js').SecurePDFEngine} engine
   * @param {object} elements - DOM element references
   */
  constructor(engine, elements) {
    this.engine = engine;
    this.els = elements; // { searchInput, matchCount, prevBtn, nextBtn, closeBtn, caseSensitiveBtn }

    this.isOpen = false;
    this.query = '';
    this.caseSensitive = false;
    this.results = []; // { pageIndex, matchCount, snippets[] }
    this.totalMatches = 0;
    this.currentMatchIndex = 0; // 0-indexed global match index
    this.matchMap = []; // flat array of { pageIndex, localIndex }

    this._searchDebounce = null;

    this._bindEvents();
  }

  // ── Public API ──────────────────────────────────────────────

  open() {
    this.isOpen = true;
    if (this.els.searchBar) {
      this.els.searchBar.classList.add('active');
      this.els.searchBar.setAttribute('aria-hidden', 'false');
    }
    if (this.els.searchInput) {
      this.els.searchInput.focus();
      this.els.searchInput.select();
    }
  }

  close() {
    this.isOpen = false;
    this.query = '';
    if (this.els.searchInput) this.els.searchInput.value = '';
    if (this.els.searchBar) {
      this.els.searchBar.classList.remove('active');
      this.els.searchBar.setAttribute('aria-hidden', 'true');
    }
    this.engine.clearHighlights();
    this._updateMatchDisplay(0, 0);
    this.results = [];
    this.matchMap = [];
    this.totalMatches = 0;
    this.currentMatchIndex = 0;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  nextMatch() {
    if (this.totalMatches === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.totalMatches;
    this._navigateToMatch();
  }

  prevMatch() {
    if (this.totalMatches === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.totalMatches) % this.totalMatches;
    this._navigateToMatch();
  }

  // ── Private ─────────────────────────────────────────────────

  _bindEvents() {
    if (this.els.searchInput) {
      this.els.searchInput.addEventListener('input', () => {
        clearTimeout(this._searchDebounce);
        this._searchDebounce = setTimeout(() => this._performSearch(), 200);
      });

      this.els.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            this.prevMatch();
          } else {
            this.nextMatch();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      });
    }

    if (this.els.closeBtn) {
      this.els.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.els.prevBtn) {
      this.els.prevBtn.addEventListener('click', () => this.prevMatch());
    }

    if (this.els.nextBtn) {
      this.els.nextBtn.addEventListener('click', () => this.nextMatch());
    }

    if (this.els.caseSensitiveBtn) {
      this.els.caseSensitiveBtn.addEventListener('click', () => {
        this.caseSensitive = !this.caseSensitive;
        this.els.caseSensitiveBtn.classList.toggle('active', this.caseSensitive);
        this.els.caseSensitiveBtn.setAttribute('aria-pressed', this.caseSensitive);
        this._performSearch();
      });
    }
  }

  async _performSearch() {
    const query = this.els.searchInput?.value?.trim() || '';

    if (!query) {
      this.engine.clearHighlights();
      this._updateMatchDisplay(0, 0);
      this.results = [];
      this.matchMap = [];
      this.totalMatches = 0;
      this.currentMatchIndex = 0;
      this.query = '';
      return;
    }

    this.query = query;
    this.results = await this.engine.searchText(query);
    this.matchMap = [];
    this.totalMatches = 0;

    this.results.forEach(r => {
      for (let i = 0; i < r.matchCount; i++) {
        this.matchMap.push({ pageIndex: r.pageIndex, localIndex: i });
      }
      this.totalMatches += r.matchCount;
    });

    this.currentMatchIndex = 0;

    // Highlight all rendered pages
    this.engine.clearHighlights();
    this.results.forEach(r => {
      this.engine.highlightOnPage(r.pageIndex, query);
    });

    this._updateMatchDisplay(
      this.totalMatches > 0 ? 1 : 0,
      this.totalMatches
    );

    // Navigate to first match
    if (this.totalMatches > 0) {
      this._navigateToMatch();
    }
  }

  _navigateToMatch() {
    if (this.matchMap.length === 0) return;

    const match = this.matchMap[this.currentMatchIndex];
    if (!match) return;

    // Navigate to the page containing the match
    this.engine.goToPage(match.pageIndex + 1);

    // Set active highlight after a short delay (let page render)
    setTimeout(() => {
      // Re-highlight on the page if it was just rendered
      this.engine.highlightOnPage(match.pageIndex, this.query);
      this.engine.setActiveHighlight(match.pageIndex, match.localIndex);
    }, 300);

    this._updateMatchDisplay(this.currentMatchIndex + 1, this.totalMatches);
  }

  _updateMatchDisplay(current, total) {
    if (this.els.matchCount) {
      if (total === 0 && this.query) {
        this.els.matchCount.textContent = 'No matches';
        this.els.matchCount.classList.add('no-matches');
      } else if (total > 0) {
        this.els.matchCount.textContent = `${current} of ${total}`;
        this.els.matchCount.classList.remove('no-matches');
      } else {
        this.els.matchCount.textContent = '';
        this.els.matchCount.classList.remove('no-matches');
      }
    }
  }
}
