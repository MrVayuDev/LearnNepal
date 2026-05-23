/**
 * LearnNepal — Command Palette & Fuzzy Search Engine
 * Custom keyboard-driven search navigation system
 */
(function() {
    // Search database containing all routes and structural links
    const searchDb = [
        // Navigation Group
        { name: "All Courses Dashboard", desc: "View both Class 11 & Class 12 subject syllabi", url: "pages/courses.html", cat: "Navigation", icon: "🌐" },
        { name: "About Us", desc: "Our mission, value statement, and story", url: "about.html", cat: "Navigation", icon: "📖" },
        { name: "Contact Us", desc: "Get in touch or subscribe to our channel", url: "contact.html", cat: "Navigation", icon: "✉️" },
        
        // Grade 11
        { name: "Class 11 English", desc: "Vocabulary, summaries, and exercise guides", url: "pages/class-11/english.html", cat: "Class 11", icon: "📘" },
        { name: "Class 11 Nepali", desc: " Devangari notes, grammar (ब्याकरण), and stories", url: "pages/class-11/nepali.html", cat: "Class 11", icon: "📕" },
        { name: "Class 11 Computer Science", desc: "Introduction to coding, computer architectures, and software", url: "pages/class-11/computer/c11_computer_syllabus.html", cat: "Class 11", icon: "💻" },

        // Grade 12
        { name: "Class 12 English", desc: "Literature chapters, free response templates, grammar rules", url: "pages/class-12/english/c12_english_syllabus.html", cat: "Class 12", icon: "📘" },
        { name: "Class 12 Nepali", desc: "Full chapter analyses, exercises, and vocabulary notes", url: "pages/class-12/nepali.html", cat: "Class 12", icon: "📕" },
        { name: "Class 12 Computer Science", desc: "Database Management (DBMS), Networking, Web Tech, and C language", url: "pages/class-12/computer/c12_computer_syllabus.html", cat: "Class 12", icon: "💻" },

        // Question Bank
        { name: "NEB Class 12 Question Bank", desc: "Past questions and exam templates with filters", url: "pages/class-12/question-bank/index.html", cat: "Question Bank", icon: "📝" }
    ];

    let activeIndex = 0;
    let filteredItems = [];

    // Helper to determine the path prefix relative to current URL
    function getPathPrefix() {
        const path = window.location.pathname;
        const parts = path.split('/');
        const pagesPos = parts.indexOf('pages');
        if (pagesPos === -1) return "";
        const depth = parts.length - pagesPos - 1;
        return "../".repeat(depth);
    }

    const prefix = getPathPrefix();
    // Resolve absolute urls relative to current document location
    searchDb.forEach(item => {
        item.resolvedUrl = prefix + item.url;
    });

    // Create and inject the Command Palette HTML dynamically into the body
    function injectPalette() {
        if (document.getElementById('cmd-palette')) return;

        const paletteHtml = `
            <div class="cmd-palette" id="cmd-palette">
                <div class="cmd-palette-overlay" id="cmd-overlay"></div>
                <div class="cmd-palette-modal">
                    <div class="cmd-palette-header">
                        <svg class="cmd-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="cmd-search-input" placeholder="Type to search subjects, chapters, pages..." autocomplete="off">
                        <span class="cmd-esc-badge">ESC</span>
                    </div>
                    <div class="cmd-palette-results" id="cmd-results"></div>
                    <div class="cmd-palette-footer">
                        <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = paletteHtml;
        document.body.appendChild(tempDiv.firstElementChild);
    }

    injectPalette();

    const palette = document.getElementById('cmd-palette');
    const overlay = document.getElementById('cmd-overlay');
    const input = document.getElementById('cmd-search-input');
    const resultsContainer = document.getElementById('cmd-results');

    function openPalette() {
        palette.classList.add('active');
        input.value = "";
        renderResults("");
        setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
        palette.classList.remove('active');
        input.blur();
    }

    // Toggle logic via Ctrl+K
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (palette.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        }
        if (e.key === 'Escape' && palette.classList.contains('active')) {
            closePalette();
        }
    });

    if (overlay) {
        overlay.addEventListener('click', closePalette);
    }

    // Render logic
    function renderResults(query) {
        resultsContainer.innerHTML = "";
        query = query.toLowerCase().trim();

        if (query === "") {
            filteredItems = [...searchDb];
        } else {
            filteredItems = searchDb.filter(item => {
                return item.name.toLowerCase().includes(query) || 
                       item.desc.toLowerCase().includes(query) || 
                       item.cat.toLowerCase().includes(query);
            });
        }

        if (filteredItems.length === 0) {
            resultsContainer.innerHTML = `<div class="cmd-no-results">No results found for "${query}"</div>`;
            return;
        }

        activeIndex = 0;
        let currentGroup = "";
        let html = "";

        filteredItems.forEach((item, idx) => {
            if (item.cat !== currentGroup) {
                currentGroup = item.cat;
                html += `<div class="cmd-group-title">${currentGroup}</div>`;
            }

            // Convert raw icon emojis into standard styled inline SVG representations
            let svgMarkup = "";
            if (item.icon === "📘") {
                svgMarkup = `<svg width="16" height="16" fill="none" stroke="var(--subject-english)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`;
            } else if (item.icon === "📕") {
                svgMarkup = `<svg width="16" height="16" fill="none" stroke="var(--subject-nepali)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
            } else if (item.icon === "💻") {
                svgMarkup = `<svg width="16" height="16" fill="none" stroke="var(--subject-computer)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
            } else if (item.icon === "📝") {
                svgMarkup = `<svg width="16" height="16" fill="none" stroke="var(--subject-qbank)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/></svg>`;
            } else {
                // Default Navigation icons
                svgMarkup = `<svg width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
            }

            html += `
                <a href="${item.resolvedUrl}" class="cmd-item ${idx === activeIndex ? 'selected' : ''}" data-index="${idx}">
                    <div class="cmd-item-icon">
                        ${svgMarkup}
                    </div>
                    <div class="cmd-item-body">
                        <span class="cmd-item-name">${item.name}</span>
                        <span class="cmd-item-desc">${item.desc}</span>
                    </div>
                </a>
            `;
        });

        resultsContainer.innerHTML = html;

        // Bind clicks
        document.querySelectorAll('.cmd-item').forEach(el => {
            el.addEventListener('click', function(e) {
                closePalette();
            });
        });
    }

    input.addEventListener('input', function() {
        renderResults(input.value);
    });

    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
        if (filteredItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            updateSelection((activeIndex + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            updateSelection((activeIndex - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedItem = filteredItems[activeIndex];
            if (selectedItem) {
                window.location.href = selectedItem.resolvedUrl;
                closePalette();
            }
        }
    });

    function updateSelection(newIndex) {
        const items = document.querySelectorAll('.cmd-item');
        if (items[activeIndex]) items[activeIndex].classList.remove('selected');
        
        activeIndex = newIndex;
        
        if (items[activeIndex]) {
            items[activeIndex].classList.add('selected');
            // Scroll into view if needed
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Expose search API globally to attach to search triggers/nav links
    window.LearnNepalSearch = {
        open: openPalette,
        close: closePalette
    };

    // Attach to search trigger buttons if they exist
    document.addEventListener('click', function(e) {
        if (e.target.closest('.search-trigger')) {
            e.preventDefault();
            openPalette();
        }
    });
})();
