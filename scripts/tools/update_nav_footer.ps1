$projectRoot = "c:\Users\Om Raut\Documents\GitHub\LearnNepal"

# Define target files and their depth relative to root
$targets = @{
    "about.html" = "./";
    "contact.html" = "./";
    "pages\courses.html" = "../";
    "pages\chapter_view.html" = "../";
    "pages\class-12\question-bank\index.html" = "../../../";
    
    # Class 10
    "pages\class-10\opt-math\index.html" = "../../../";
    
    # Class 11
    "pages\class-11\english.html" = "../../";
    "pages\class-11\nepali.html" = "../../";
    "pages\class-11\computer\c11_computer_syllabus.html" = "../../../";
    "pages\class-11\computer\c11_computer_chapter_1.html" = "../../../";
    "pages\class-11\computer\c11_computer_chapter_2.html" = "../../../";
    
    # Class 12
    "pages\class-12\nepali.html" = "../../";
    "pages\class-12\computer\c12_computer_syllabus.html" = "../../../";
    "pages\class-12\computer\c12_computer_chapter_1.html" = "../../../";
    "pages\class-12\computer\c12_computer_chapter_2.html" = "../../../";
    "pages\class-12\english\c12_english_syllabus.html" = "../../../";
    "pages\class-12\english\c12_english_unit_1.html" = "../../../";
    "pages\class-12\english\c12_english_story_1.html" = "../../../";
    "pages\class-12\english\c12_english_2083_solutions.html" = "../../../";
    "pages\class-12\nepali\c12_nepali_chapter_1.html" = "../../../";
    "pages\class-12\nepali\c12_nepali_chapter_9.html" = "../../../"
}

# Iterate over all targets
foreach ($relPath in $targets.Keys) {
    $filePath = Join-Path $projectRoot $relPath
    if (-not (Test-Path $filePath)) {
        Write-Host "Skip (Not Found): $relPath" -ForegroundColor Yellow
        continue
    }
    
    $depth = $targets[$relPath]
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Ensure main.css is loaded
    if ($content -notmatch "styles/main\.css") {
        # insert before </head>
        $link = "`n    <link rel=`"stylesheet`" href=`"${depth}styles/main.css`" />"
        $content = $content -replace '</head>', "$link`n</head>"
    }
    
    # Ensure theme.js is loaded
    if ($content -notmatch "scripts/theme\.js") {
        $script = "`n    <script src=`"${depth}scripts/theme.js`"></script>"
        $content = $content -replace '</head>', "$script`n</head>"
    }
    
    # Check if there is an active navigation link to set
    $activePage = ""
    if ($relPath -match "courses\.html") { $activePage = "courses" }
    elseif ($relPath -match "question-bank") { $activePage = "qb" }
    elseif ($relPath -match "about\.html") { $activePage = "about" }
    
    $navHomeActive = if ($activePage -eq "home") { " active" } else { "" }
    $navCoursesActive = if ($activePage -eq "courses") { " active" } else { "" }
    $navQbActive = if ($activePage -eq "qb") { " active" } else { "" }
    $navAboutActive = if ($activePage -eq "about") { " active" } else { "" }
    
    # Construct standard Navbar
    $navbar = @"
    <!-- ═══ HEADER ═══ -->
    <header class="header" id="site-header">
        <div class="header-container">
            <a href="${depth}index.html" class="logo">
                <img src="${depth}assets/images/logo.png" alt="LearnNepal">
                LearnNepal
            </a>

            <button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>

            <nav class="nav-menu" aria-label="Main navigation">
                <a href="${depth}index.html" class="nav-link${navHomeActive}">Home</a>
                <a href="${depth}pages/courses.html" class="nav-link${navCoursesActive}">Courses</a>
                <a href="${depth}pages/class-12/question-bank/index.html" class="nav-link${navQbActive}">Question Bank</a>
                <a href="${depth}about.html" class="nav-link${navAboutActive}">About</a>

                <button class="search-trigger btn-search" aria-label="Search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span>Search</span>
                    <kbd>Ctrl K</kbd>
                </button>
                <a href="${depth}contact.html" class="btn btn-primary btn-sm">Contact Us</a>
            </nav>
        </div>
    </header>
"@

    # Construct standard Footer
    $footer = @"
    <!-- ═══ FOOTER ═══ -->
    <footer class="footer" role="contentinfo">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <a href="${depth}index.html" class="logo">
                        <img src="${depth}assets/images/logo.png" alt="LearnNepal">
                        LearnNepal<span></span>
                    </a>
                    <p>Empowering NEB students with high-quality, structured, and accessible digital study notes &mdash; completely free.</p>
                    <div class="footer-social">
                        <a href="https://www.youtube.com/@OfficialLearnNepal" target="_blank" rel="noopener" aria-label="YouTube" class="social-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.46z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="mailto:hello@learnnepal.com" aria-label="Email" class="social-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </a>
                    </div>
                </div>

                <div class="footer-col">
                    <h5 class="footer-heading">Class 11</h5>
                    <ul class="footer-links">
                        <li><a href="${depth}pages/class-11/english.html">English</a></li>
                        <li><a href="${depth}pages/class-11/nepali.html">Nepali</a></li>
                        <li><a href="${depth}pages/class-11/computer/c11_computer_syllabus.html">Computer Science</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5 class="footer-heading">Class 12</h5>
                    <ul class="footer-links">
                        <li><a href="${depth}pages/class-12/english/c12_english_syllabus.html">English</a></li>
                        <li><a href="${depth}pages/class-12/nepali.html">Nepali</a></li>
                        <li><a href="${depth}pages/class-12/computer/c12_computer_syllabus.html">Computer Science</a></li>
                        <li><a href="${depth}pages/class-12/question-bank/index.html" class="qb-link"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 6px; display: inline-block; vertical-align: middle;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/></svg>Question Bank</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5 class="footer-heading">Resources</h5>
                    <ul class="footer-links">
                        <li><a href="${depth}pages/courses.html">All Courses</a></li>
                        <li><a href="${depth}about.html">About Us</a></li>
                        <li><a href="${depth}contact.html">Contact</a></li>
                        <li><a href="${depth}privacy.html">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 LearnNepal &mdash; Built with &#10084; for NEB students across Nepal</p>
                <div class="footer-bottom-links">
                    <a href="${depth}privacy.html">Privacy</a>
                    <span>&bull;</span>
                    <a href="${depth}contact.html">Contact</a>
                    <span>&bull;</span>
                    <a href="${depth}about.html">About</a>
                </div>
            </div>
        </div>
    </footer>
"@

    # Replace navbar block
    # Matches <header...>...</header> or <nav id="top-nav">...</nav> or similar
    $content = [regex]::Replace($content, '(?s)<(header|nav)\s+class="[^"]*(header|fixed|top-nav|site-header)[^"]*"[^>]*>.*?</\1>', $navbar)
    
    # Replace footer block
    $content = [regex]::Replace($content, '(?s)<footer\b[^>]*>.*?</footer>', $footer)
    
    # Write updated content
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Updated header and footer in $relPath" -ForegroundColor Green
}
