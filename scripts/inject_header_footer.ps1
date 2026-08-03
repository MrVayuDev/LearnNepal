param (
    [string]$src,
    [string]$dst,
    [string]$depthStr
)

$standardHeader = @"
    <!-- ═══ HEADER ═══ -->
        <header class="header" id="site-header">
        <div class="header-container">
            <a href="index.html" class="logo">
                <img src="assets/images/logo.png" alt="LearnNepal">
                LearnNepal
            </a>

            <button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>

            <nav class="nav-menu" aria-label="Main navigation">
                <a href="index.html" class="nav-link">Home</a>
                <a href="pages/courses.html" class="nav-link active">Courses</a>
                <a href="pages/class-12/question-bank/index.html" class="nav-link">Question Bank</a>
                <a href="about.html" class="nav-link">About</a>

                <button class="search-trigger btn-search" aria-label="Search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span>Search</span>
                    <kbd>Ctrl K</kbd>
                </button>
                <button class="theme-toggle" aria-label="Toggle Theme">
                    <svg class="sun-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                    <svg class="moon-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </button>
                <a href="contact.html" class="btn btn-primary btn-sm">Contact Us</a>
            </nav>
        </div>
    </header>
"@

$standardFooter = @"
    <!-- ═══ FOOTER ═══ -->
    <footer class="footer" role="contentinfo">
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand">
                    <a href="index.html" class="logo">
                        <img src="assets/images/logo.png" alt="LearnNepal">
                        LearnNepal<span></span>
                    </a>
                    <p>Empowering NEB students with high-quality, structured, and accessible digital study notes — completely free.</p>
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
                        <li><a href="pages/class-11/english.html">English</a></li>
                        <li><a href="pages/class-11/nepali.html">Nepali</a></li>
                        <li><a href="pages/class-11/computer/c11_computer_syllabus.html">Computer Science</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5 class="footer-heading">Class 12</h5>
                    <ul class="footer-links">
                        <li><a href="pages/class-12/english/c12_english_syllabus.html">English</a></li>
                        <li><a href="pages/class-12/nepali.html">Nepali</a></li>
                        <li><a href="pages/class-12/computer/c12_computer_syllabus.html">Computer Science</a></li>
                        <li><a href="pages/class-12/question-bank/index.html" class="qb-link"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="margin-right: 6px; display: inline-block; vertical-align: middle;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/></svg>Question Bank</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h5 class="footer-heading">Resources</h5>
                    <ul class="footer-links">
                        <li><a href="pages/courses.html">All Courses</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="privacy.html">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 LearnNepal &mdash; Built with &#10084; for NEB students across Nepal</p>
                <div class="footer-bottom-links">
                    <a href="privacy.html">Privacy</a>
                    <span>&bull;</span>
                    <a href="contact.html">Contact</a>
                    <span>&bull;</span>
                    <a href="about.html">About</a>
                </div>
            </div>
        </div>
    </footer>
"@

# Adjust relative paths using simple String.Replace
$standardHeader = $standardHeader.Replace('href="index.html"', 'href="' + $depthStr + 'index.html"')
$standardHeader = $standardHeader.Replace('src="assets/', 'src="' + $depthStr + 'assets/')
$standardHeader = $standardHeader.Replace('href="pages/', 'href="' + $depthStr + 'pages/')
$standardHeader = $standardHeader.Replace('href="about.html"', 'href="' + $depthStr + 'about.html"')
$standardHeader = $standardHeader.Replace('href="contact.html"', 'href="' + $depthStr + 'contact.html"')

$standardFooter = $standardFooter.Replace('href="index.html"', 'href="' + $depthStr + 'index.html"')
$standardFooter = $standardFooter.Replace('src="assets/', 'src="' + $depthStr + 'assets/')
$standardFooter = $standardFooter.Replace('href="pages/', 'href="' + $depthStr + 'pages/')
$standardFooter = $standardFooter.Replace('href="about.html"', 'href="' + $depthStr + 'about.html"')
$standardFooter = $standardFooter.Replace('href="contact.html"', 'href="' + $depthStr + 'contact.html"')
$standardFooter = $standardFooter.Replace('href="privacy.html"', 'href="' + $depthStr + 'privacy.html"')

$srcContent = Get-Content -Path $src -Raw -Encoding UTF8

if ($srcContent -notmatch "styles/main.css") {
    $headInject = "<script src=`"" + $depthStr + "scripts/theme.js`"></script>`n<link rel=`"stylesheet`" href=`"" + $depthStr + "styles/main.css`" />`n</head>"
    $srcContent = [regex]::Replace($srcContent, "(?i)(</head>)", $headInject)
}

if ($srcContent -notmatch "scripts/app.js") {
    $jsLink = "`n<script src=`"" + $depthStr + "scripts/app.js`"></script>`n</body>"
    $srcContent = [regex]::Replace($srcContent, "(?i)(</body>)", $jsLink)
}

# If existing header is present, replace it; otherwise insert after <!-- TopNavBar --> or <body>
if ($srcContent -match "(?s)<header class=`"header`" id=`"site-header`".*?</header>") {
    $srcContent = [regex]::Replace($srcContent, "(?s)<header class=`"header`" id=`"site-header`".*?</header>", $standardHeader)
} elseif ($srcContent -match "(?s)<nav class=`"fixed top-0.*?</nav>") {
    $srcContent = [regex]::Replace($srcContent, "(?s)<nav class=`"fixed top-0.*?</nav>", $standardHeader)
} elseif ($srcContent -match "<!-- TopNavBar -->") {
    $srcContent = $srcContent.Replace("<!-- TopNavBar -->", "<!-- TopNavBar -->`n" + $standardHeader)
} else {
    $srcContent = [regex]::Replace($srcContent, "(?i)(<body[^>]*>)", "`$1`n" + $standardHeader)
}

# If existing footer is present, replace it; otherwise insert before </main> or </body>
if ($srcContent -match "(?s)<footer.*?>.*?</footer>") {
    $srcContent = [regex]::Replace($srcContent, "(?s)<footer.*?>.*?</footer>", $standardFooter)
} else {
    $srcContent = [regex]::Replace($srcContent, "(?s)(</main>)", "`$1`n" + $standardFooter)
}

Set-Content -Path $dst -Value $srcContent -Encoding UTF8
Write-Output "Successfully rebuilt $dst"
