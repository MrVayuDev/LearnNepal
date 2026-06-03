/**
 * LearnNepal Core Scripts
 * Handles Navigation, Mobile Menu, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initDropdownsForMobile();
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
        
        if (title) {
            title.addEventListener('click', () => {
                group.classList.toggle('active');
            });
        }
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

function initDropdownsForMobile() {
    const dropdowns = document.querySelectorAll('.dropdown > .nav-link');
    
    dropdowns.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = trigger.parentElement;

                /* Close other open dropdowns */
                document.querySelectorAll('.dropdown.active').forEach(d => {
                    if (d !== parent) d.classList.remove('active');
                });

                parent.classList.toggle('active');
            }
        });
    });
}

function initMobileSidebar() {
    const toggle = document.querySelector('.mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    if (toggle && sidebar) {
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
}

function initPageTransitions() {
    const old = document.querySelector('.svg-transition-overlay');
    if (old) old.remove();
}
