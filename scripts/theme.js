/**
 * LearnNepal — Theme System
 * Dark/Light toggle with localStorage persistence + system preference detection
 */
(function() {
    const STORAGE_KEY = 'learnnepal-theme';

    function getPreferredTheme() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return stored;
        } catch (e) {
            // localStorage access may be blocked in some iframe/privacy settings
        }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            // localStorage access may be blocked
        }
        // Update all toggle buttons
        document.querySelectorAll('.theme-toggle').forEach(function(btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    // Add preload-transitions class immediately to disable initial transitions
    document.documentElement.classList.add('preload-transitions');

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

        // Remove preload-transitions after the first layout/paint has occurred
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                document.documentElement.classList.remove('preload-transitions');
            });
        });
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
        try {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? 'light' : 'dark');
            }
        } catch (err) {
            applyTheme(e.matches ? 'light' : 'dark');
        }
    });
})();
