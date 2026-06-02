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

    const bars = document.querySelectorAll('.bar');

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        
        if (nav.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            document.body.style.overflow = 'hidden';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
            document.body.style.overflow = '';
        }
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
             if (!link.parentElement.classList.contains('dropdown')) {
                 nav.classList.remove('active');
                 bars[0].style.transform = 'none';
                 bars[1].style.opacity = '1';
                 bars[2].style.transform = 'none';
                 document.body.style.overflow = '';
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
