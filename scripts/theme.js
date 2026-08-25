/**
 * LearnNepal — Theme System
 * Enforces Light Theme across all pages
 */
(function() {
    try {
        localStorage.removeItem('learnnepal-theme');
    } catch (e) {
        // localStorage access may be blocked
    }

    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
})();

