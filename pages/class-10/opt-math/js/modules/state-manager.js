/**
 * State Manager — Persistent Viewer State
 *
 * Persists and restores the user's reading progress (current page,
 * zoom level, and sidebar tab) using localStorage. State is namespaced
 * to the specific document URL.
 */

const STORAGE_KEY = 'LearnNepal_ViewerState_v1';

export class StateManager {
  constructor() {
    this.state = this._loadState();
  }

  /**
   * Save the reading progress for a specific document.
   * @param {string} documentId - Unique identifier for the document (e.g. its URL or path)
   * @param {number} page - Current page number
   * @param {number} scale - Current zoom scale
   */
  saveDocumentState(documentId, page, scale) {
    if (!documentId) return;

    if (!this.state.documents) {
      this.state.documents = {};
    }

    this.state.documents[documentId] = {
      page,
      scale,
      timestamp: Date.now()
    };

    // Cleanup old entries if we have too many (e.g., > 50)
    this._cleanupOldStates();
    this._persist();
  }

  /**
   * Retrieve the saved progress for a document.
   * @param {string} documentId 
   * @returns {{page: number, scale: number}|null}
   */
  getDocumentState(documentId) {
    if (!documentId || !this.state.documents) return null;
    return this.state.documents[documentId] || null;
  }

  /**
   * Save global viewer preferences (e.g., last active sidebar tab)
   * @param {string} key 
   * @param {any} value 
   */
  savePreference(key, value) {
    if (!this.state.preferences) {
      this.state.preferences = {};
    }
    this.state.preferences[key] = value;
    this._persist();
  }

  /**
   * Retrieve a global viewer preference.
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  getPreference(key, defaultValue = null) {
    if (!this.state.preferences) return defaultValue;
    return this.state.preferences[key] !== undefined ? this.state.preferences[key] : defaultValue;
  }

  // ── Private ─────────────────────────────────────────────────

  _loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[StateManager] Failed to load viewer state from localStorage', err);
    }
    return { documents: {}, preferences: {} };
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('[StateManager] Failed to save viewer state to localStorage', err);
    }
  }

  _cleanupOldStates() {
    const keys = Object.keys(this.state.documents);
    if (keys.length > 50) {
      // Sort by timestamp descending
      const sorted = keys.map(k => ({ id: k, ...this.state.documents[k] }))
                         .sort((a, b) => b.timestamp - a.timestamp);
      
      // Keep only the 50 most recent
      const newDocs = {};
      sorted.slice(0, 50).forEach(doc => {
        newDocs[doc.id] = { page: doc.page, scale: doc.scale, timestamp: doc.timestamp };
      });
      this.state.documents = newDocs;
    }
  }
}
