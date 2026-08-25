<#
.SYNOPSIS
    Migrates all LearnNepal pages from Tailwind CDN to the native design system.
#>

$ProjectRoot = "c:\Users\Om Raut\Documents\GitHub\LearnNepal"

# Pages to migrate
$Pages = @(
    @{ Path = "about.html";   Depth = 0 },
    @{ Path = "contact.html"; Depth = 0 },
    @{ Path = "privacy.html"; Depth = 0 },
    @{ Path = "pages\courses.html"; Depth = 1 },
    @{ Path = "pages\class-11\english.html";   Depth = 2 },
    @{ Path = "pages\class-11\nepali.html";    Depth = 2 },
    @{ Path = "pages\class-11\computer\c11_computer_syllabus.html";  Depth = 3 },
    @{ Path = "pages\class-11\computer\c11_computer_chapter_1.html"; Depth = 3 },
    @{ Path = "pages\class-11\computer\c11_computer_chapter_2.html"; Depth = 3 },
    @{ Path = "pages\class-12\nepali.html"; Depth = 2 },
    @{ Path = "pages\class-12\computer\c12_computer_syllabus.html";  Depth = 3 },
    @{ Path = "pages\class-12\computer\c12_computer_chapter_1.html"; Depth = 3 },
    @{ Path = "pages\class-12\computer\c12_computer_chapter_2.html"; Depth = 3 },
    @{ Path = "pages\class-12\english\c12_english_syllabus.html";        Depth = 3 },
    @{ Path = "pages\class-12\english\c12_english_unit_1.html";          Depth = 3 },
    @{ Path = "pages\class-12\english\c12_english_story_1.html";         Depth = 3 },
    @{ Path = "pages\class-12\english\c12_english_2083_solutions.html";  Depth = 3 },
    @{ Path = "pages\class-12\nepali\c12_nepali_chapter_1.html"; Depth = 3 },
    @{ Path = "pages\class-12\nepali\c12_nepali_chapter_9.html"; Depth = 3 }
)

function Get-RelRoot([int]$Depth) {
    if ($Depth -eq 0) { return "." }
    $parts = @()
    for ($i = 0; $i -lt $Depth; $i++) { $parts += ".." }
    return ($parts -join "/")
}

function Get-HeadBlock([string]$Title, [string]$R) {
    $lines = @()
    $lines += '<!DOCTYPE html>'
    $lines += '<html lang="en">'
    $lines += '<head>'
    $lines += '    <meta charset="UTF-8" />'
    $lines += '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    $lines += "    <title>$Title</title>"
    $lines += '    <meta name="description" content="LearnNepal - Premium NEB Class 11 and 12 Notes. Free, structured study materials." />'
    $lines += ''
    $lines += "    <link rel=`"icon`" href=`"$R/assets/images/logo.png`" type=`"image/png`" />"
    $lines += "    <link rel=`"apple-touch-icon`" href=`"$R/assets/images/logo.png`" />"
    $lines += ''
    $lines += '    <link rel="preconnect" href="https://fonts.googleapis.com" />'
    $lines += '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'
    $lines += '    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Mukta:wght@400;600&display=swap" rel="stylesheet" />'
    $lines += '    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />'
    $lines += ''
    $lines += "    <script src=`"$R/scripts/theme.js`"></script>"
    $lines += "    <link rel=`"stylesheet`" href=`"$R/styles/main.css`" />"
    $lines += '</head>'
    return ($lines -join "`n")
}

function Get-HeaderBlock([string]$R) {
    $lines = @()
    $lines += '<body>'
    $lines += '    <div id="reading-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Reading progress"></div>'
    $lines += ''
    $lines += '    <header class="header" id="site-header">'
    $lines += '        <div class="header-container">'
    $lines += "            <a href=`"$R/index.html`" class=`"logo`">"
    $lines += "                <img src=`"$R/assets/images/logo.png`" alt=`"LearnNepal`">"
    $lines += '                LearnNepal'
    $lines += '            </a>'
    $lines += ''
    $lines += '            <button class="mobile-toggle" aria-label="Toggle Navigation">'
    $lines += '                <span class="bar"></span>'
    $lines += '                <span class="bar"></span>'
    $lines += '                <span class="bar"></span>'
    $lines += '            </button>'
    $lines += ''
    $lines += '            <nav class="nav-menu" aria-label="Main navigation">'
    $lines += "                <a href=`"$R/index.html`" class=`"nav-link`">Home</a>"
    $lines += "                <a href=`"$R/pages/courses.html`" class=`"nav-link`">Courses</a>"
    $lines += "                <a href=`"$R/pages/class-12/question-bank/index.html`" class=`"nav-link`">Question Bank</a>"
    $lines += "                <a href=`"$R/about.html`" class=`"nav-link`">About</a>"
    $lines += ''
    $lines += '                <button class="search-trigger btn-search" aria-label="Search">'
    $lines += '                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
    $lines += '                    <span>Search</span>'
    $lines += '                    <kbd>Ctrl K</kbd>'
    $lines += '                </button>'
    $lines += "                <a href=`"$R/contact.html`" class=`"btn btn-primary btn-sm`">Contact Us</a>"
    $lines += '            </nav>'
    $lines += '        </div>'
    $lines += '    </header>'
    $lines += ''
    $lines += '    <main>'
    return ($lines -join "`n")
}

function Get-FooterBlock([string]$R) {
    $lines = @()
    $lines += '    </main>'
    $lines += ''
    $lines += '    <footer class="footer" role="contentinfo">'
    $lines += '        <div class="container">'
    $lines += '            <div class="footer-top">'
    $lines += '                <div class="footer-brand">'
    $lines += "                    <a href=`"$R/index.html`" class=`"logo`">"
    $lines += "                        <img src=`"$R/assets/images/logo.png`" alt=`"LearnNepal`">"
    $lines += '                        LearnNepal<span></span>'
    $lines += '                    </a>'
    $lines += '                    <p>Empowering NEB students with high-quality, structured, and accessible digital study notes — completely free.</p>'
    $lines += '                    <div class="footer-social">'
    $lines += '                        <a href="https://www.youtube.com/@OfficialLearnNepal" target="_blank" rel="noopener" aria-label="YouTube" class="social-icon">'
    $lines += '                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.46z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>'
    $lines += '                        </a>'
    $lines += '                        <a href="mailto:hello@learnnepal.com" aria-label="Email" class="social-icon">'
    $lines += '                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
    $lines += '                        </a>'
    $lines += '                    </div>'
    $lines += '                </div>'
    $lines += ''
    $lines += '                <div class="footer-col">'
    $lines += '                    <h5 class="footer-heading">Class 11</h5>'
    $lines += '                    <ul class="footer-links">'
    $lines += "                        <li><a href=`"$R/pages/class-11/english.html`">English</a></li>"
    $lines += "                        <li><a href=`"$R/pages/class-11/nepali.html`">Nepali</a></li>"
    $lines += "                        <li><a href=`"$R/pages/class-11/computer/c11_computer_syllabus.html`">Computer Science</a></li>"
    $lines += '                    </ul>'
    $lines += '                </div>'
    $lines += ''
    $lines += '                <div class="footer-col">'
    $lines += '                    <h5 class="footer-heading">Class 12</h5>'
    $lines += '                    <ul class="footer-links">'
    $lines += "                        <li><a href=`"$R/pages/class-12/english/c12_english_syllabus.html`">English</a></li>"
    $lines += "                        <li><a href=`"$R/pages/class-12/nepali.html`">Nepali</a></li>"
    $lines += "                        <li><a href=`"$R/pages/class-12/computer/c12_computer_syllabus.html`">Computer Science</a></li>"
    $lines += "                        <li><a href=`"$R/pages/class-12/question-bank/index.html`">Question Bank</a></li>"
    $lines += '                    </ul>'
    $lines += '                </div>'
    $lines += ''
    $lines += '                <div class="footer-col">'
    $lines += '                    <h5 class="footer-heading">Resources</h5>'
    $lines += '                    <ul class="footer-links">'
    $lines += "                        <li><a href=`"$R/pages/courses.html`">All Courses</a></li>"
    $lines += "                        <li><a href=`"$R/about.html`">About Us</a></li>"
    $lines += "                        <li><a href=`"$R/contact.html`">Contact</a></li>"
    $lines += "                        <li><a href=`"$R/privacy.html`">Privacy Policy</a></li>"
    $lines += '                    </ul>'
    $lines += '                </div>'
    $lines += '            </div>'
    $lines += ''
    $lines += '            <div class="footer-bottom">'
    $lines += '                <p>&#169; 2026 LearnNepal &#8212; Built with &#10084; for NEB students across Nepal</p>'
    $lines += '                <div class="footer-bottom-links">'
    $lines += "                    <a href=`"$R/privacy.html`">Privacy</a>"
    $lines += '                    <span>&#8226;</span>'
    $lines += "                    <a href=`"$R/contact.html`">Contact</a>"
    $lines += '                    <span>&#8226;</span>'
    $lines += "                    <a href=`"$R/about.html`">About</a>"
    $lines += '                </div>'
    $lines += '            </div>'
    $lines += '        </div>'
    $lines += '    </footer>'
    $lines += ''
    $lines += "    <script src=`"$R/scripts/app.js`"></script>"
    $lines += "    <script src=`"$R/scripts/search.js`"></script>"
    $lines += "    <script src=`"$R/scripts/transitions.js`"></script>"
    $lines += '    <script>'
    $lines += '    (function () {'
    $lines += "        var bar = document.getElementById('reading-progress');"
    $lines += '        if (bar) {'
    $lines += "            window.addEventListener('scroll', function() {"
    $lines += '                var el = document.documentElement;'
    $lines += "                bar.style.width = Math.min(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100, 100) + '%';"
    $lines += "            }, { passive: true });"
    $lines += '        }'
    $lines += '    })();'
    $lines += '    </script>'
    $lines += '</body>'
    $lines += '</html>'
    return ($lines -join "`n")
}

# Process each page
$total = $Pages.Count
$done = 0

foreach ($page in $Pages) {
    $fullPath = Join-Path $ProjectRoot $page.Path

    if (-not (Test-Path $fullPath)) {
        Write-Warning "SKIP: $($page.Path) not found"
        continue
    }

    Write-Host "[$($done+1)/$total] $($page.Path)" -ForegroundColor Cyan

    $content = [System.IO.File]::ReadAllText($fullPath)
    $R = Get-RelRoot $page.Depth

    # Extract title
    $titleM = [regex]::Match($content, '<title>(.*?)</title>', 'Singleline')
    $origTitle = if ($titleM.Success) { $titleM.Groups[1].Value } else { "LearnNepal" }

    # --- Strip everything before the body content ---

    # Remove from start through </head>
    $content = [regex]::Replace($content, '(?s)^.*?</head>\s*', '')

    # Remove <body> tag (with any classes)
    $content = [regex]::Replace($content, '(?s)<body[^>]*>\s*', '')

    # Remove reading-progress div if present
    $content = [regex]::Replace($content, '(?s)\s*<div\s+id="reading-progress"[^>]*>.*?</div>\s*', "`n")

    # Remove header block (multiple patterns)
    $content = [regex]::Replace($content, '(?s)\s*<!--[^>]*HEADER[^>]*-->\s*<header[^>]*>.*?</header>\s*', "`n")
    $content = [regex]::Replace($content, '(?s)\s*<!--\s*Header\s*-->\s*', '')
    $content = [regex]::Replace($content, '(?s)\s*<header\s+class="header"[^>]*>.*?</header>\s*', "`n")

    # Remove footer block
    $content = [regex]::Replace($content, '(?s)\s*<!--[^>]*FOOTER[^>]*-->\s*<footer[^>]*>.*?</footer>\s*', "`n")
    $content = [regex]::Replace($content, '(?s)\s*<!--\s*Footer\s*-->\s*', '')
    $content = [regex]::Replace($content, '(?s)\s*<footer\s+class="footer"[^>]*>.*?</footer>\s*', "`n")

    # Remove old script tags
    $content = [regex]::Replace($content, '(?s)\s*<script\s+src="[^"]*scripts/(app|search|transitions)\.js"[^>]*>\s*</script>', '')

    # Remove Tailwind CDN
    $content = [regex]::Replace($content, '(?s)\s*<script\s+src="https://cdn\.tailwindcss\.com[^"]*"[^>]*>\s*</script>', '')
    $content = [regex]::Replace($content, '(?s)\s*<script\s+id="tailwind-config"[^>]*>.*?</script>', '')

    # Remove inline <style> with glass-card/lift-hover
    $content = [regex]::Replace($content, '(?s)\s*<style>\s*\.glass-card\s*\{.*?</style>', '')

    # Remove closing tags
    $content = [regex]::Replace($content, '(?s)\s*</body>\s*</html>\s*$', '')

    # Remove any inline reading-progress script block
    $content = [regex]::Replace($content, "(?s)\s*<script>\s*\(function\s*\(\)\s*\{[^}]*reading-progress.*?\}\)\(\);\s*</script>", '')

    # Clean excessive newlines
    $content = [regex]::Replace($content, "(\r?\n){4,}", "`n`n")
    $content = $content.Trim()

    # Build final file
    $head = Get-HeadBlock $origTitle $R
    $header = Get-HeaderBlock $R
    $footer = Get-FooterBlock $R

    $final = $head + "`n" + $header + "`n" + $content + "`n" + $footer

    [System.IO.File]::WriteAllText($fullPath, $final, [System.Text.Encoding]::UTF8)

    $done++
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host ""
Write-Host "Migration complete: $done / $total pages processed." -ForegroundColor Green

# Verification
Write-Host ""
Write-Host "Verifying no Tailwind CDN references remain..." -ForegroundColor Yellow

$refs = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.html" |
    Where-Object { $_.FullName -notlike "*\class-10\*" -and $_.FullName -notlike "*\question-bank\*" } |
    Select-String -Pattern "cdn.tailwindcss.com" -SimpleMatch |
    Select-Object -ExpandProperty Path -Unique

if ($refs.Count -gt 0) {
    Write-Warning "Files still referencing Tailwind CDN:"
    $refs | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "No remaining Tailwind CDN references." -ForegroundColor Green
}
