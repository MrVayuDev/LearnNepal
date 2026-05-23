/**
 * LearnNepal — Theme System
 * Dark/Light toggle with localStorage persistence + system preference detection
 */
(function() {
    const STORAGE_KEY = 'learnnepal-theme';

    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        // Update all toggle buttons
        document.querySelectorAll('.theme-toggle').forEach(function(btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    // Apply on load (before paint)
    applyTheme(getPreferredTheme());

    // Bind toggle buttons when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.theme-toggle').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var current = document.documentElement.getAttribute('data-theme') || 'dark';
                applyTheme(current === 'dark' ? 'light' : 'dark');
            });
        });
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'light' : 'dark');
        }
    });
})();
