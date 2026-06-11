/**
 * LearnNepal Core Scripts
 * Handles Navigation, Mobile Menu, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initDropdowns();
    initSidebarAccordion();
    initMobileSidebar();
    initOfflineDetection();
    initPageTransitions();
});

function initOfflineDetection() {
    if (document.getElementById('offline-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'offline-overlay';
    overlay.innerHTML = `
        <div class="offline-content">
            <div class="wifi-symbol">
                <div class="wifi-circle first"></div>
                <div class="wifi-circle second"></div>
                <div class="wifi-circle third"></div>
                <div class="wifi-dot"></div>
            </div>
            <h2 class="offline-title">No Internet Connection</h2>
            <p class="offline-message">It looks like you're offline. Please check your connection and try again.</p>
            <button class="offline-retry-btn" onclick="window.location.reload()">Retry</button>
        </div>
    `;
    document.body.appendChild(overlay);

    function updateOnlineStatus() {
        if (navigator.onLine) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.visibility = 'hidden';
            }, 300);
        } else {
            overlay.style.visibility = 'visible';
            setTimeout(() => {
                overlay.classList.add('active');
            }, 10);
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if (!navigator.onLine) {
        updateOnlineStatus();
    }
}

/* NOTE: initProgressBar() and initBackToTop() REMOVED.
 * Progress bar is now handled by #reading-progress in the HTML + inline JS.
 * Back-to-top button is now created by transitions.js → initBackToTop().
 * Having duplicates caused two progress bars and two back-to-top buttons. */

function initSidebarAccordion() {
    const sidebarGroups = document.querySelectorAll('.sidebar-group');
    
    sidebarGroups.forEach(group => {
        const title = group.querySelector('.sidebar-group-title');
        if (!title) return;

        // Make the accordion header keyboard-focusable and assign button role
        title.setAttribute('tabindex', '0');
        title.setAttribute('role', 'button');
        
        // Sync initial aria-expanded state
        const isActive = group.classList.contains('active');
        title.setAttribute('aria-expanded', isActive ? 'true' : 'false');

        function toggleGroup() {
            const nowActive = group.classList.toggle('active');
            title.setAttribute('aria-expanded', nowActive ? 'true' : 'false');
        }

        // Toggle on click
        title.addEventListener('click', toggleGroup);

        // Keyboard support: Space & Enter to toggle
        title.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                e.preventDefault();
                toggleGroup();
            }
        });
    });
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-menu');
    if (!toggle || !nav) return;

    // Dynamically create backdrop overlay if not present
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
    }

    function toggleMenu() {
        const isOpen = document.body.classList.toggle('nav-open');
        nav.classList.toggle('active', isOpen);
    }

    function closeMenu() {
        document.body.classList.remove('nav-open');
        nav.classList.remove('active');
    }

    toggle.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
            closeMenu();
        }
    });

    // Close menu when clicking links (except dropdown parents)
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
             if (!link.parentElement.classList.contains('dropdown')) {
                 closeMenu();
             }
         });
    });
}

function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!trigger || !menu) return;

        // Set initial ARIA attributes
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');

        function toggleDropdown(forceState) {
            const willOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('active');
            
            // Close other open dropdowns
            if (willOpen) {
                document.querySelectorAll('.dropdown.active').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                        const t = d.querySelector('.nav-link');
                        if (t) t.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            dropdown.classList.toggle('active', willOpen);
            trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        }

        // Handle click
        trigger.addEventListener('click', (e) => {
            // Under 1024px, click is the toggle mechanism
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                toggleDropdown();
            }
        });

        // Handle Keyboard Events
        trigger.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                e.preventDefault();
                toggleDropdown();
                if (dropdown.classList.contains('active')) {
                    // Focus first item when opened via keyboard
                    const firstItem = menu.querySelector('.dropdown-item');
                    if (firstItem) firstItem.focus();
                }
            } else if (e.key === 'ArrowDown' && !dropdown.classList.contains('active')) {
                e.preventDefault();
                toggleDropdown(true);
                const firstItem = menu.querySelector('.dropdown-item');
                if (firstItem) firstItem.focus();
            }
        });

        // Handle inside-menu keyboard navigation
        const items = Array.from(menu.querySelectorAll('.dropdown-item'));
        items.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    toggleDropdown(false);
                    trigger.focus();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextItem = items[index + 1] || items[0];
                    if (nextItem) nextItem.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevItem = items[index - 1] || items[items.length - 1];
                    if (prevItem) prevItem.focus();
                }
            });
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

function initMobileSidebar() {
    const toggle = document.querySelector('.mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (!toggle || !sidebar) return;
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (link.getAttribute('href') !== '#' && !link.classList.contains('sidebar-group-title')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

function initPageTransitions() {
    const old = document.querySelector('.svg-transition-overlay');
    if (old) old.remove();
}
