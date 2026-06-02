/**
 * Security Guards — Non-Destructive DOM Protections
 * 
 * Blocks common content-extraction vectors without degrading UX:
 * - Right-click context menus
 * - Ctrl/Cmd + P (Print), S (Save), C (Copy), U (View Source)
 * - F12 (DevTools shortcut)
 * - Drag-and-drop text/asset scraping
 * 
 * NOTE: The original blueprint included a `debugger` statement in a
 * setInterval loop to detect DevTools. This has been intentionally
 * removed because it fires every 500ms, freezes the page when DevTools
 * is open, and degrades performance even when it's closed.
 */
export function initializeSecurityGuards() {
  // Prevent right-click context menus
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Intercept copy, print, save, and view-source shortcuts
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (
      (e.ctrlKey || e.metaKey) && (key === 'p' || key === 's' || key === 'c' || key === 'u') ||
      key === 'f12'
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Prevent drag-and-drop text/asset scraping
  document.addEventListener('dragstart', (e) => e.preventDefault());

  // Prevent text selection on the entire document
  document.addEventListener('selectstart', (e) => {
    // Allow selection in form inputs if any exist
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  });
}
