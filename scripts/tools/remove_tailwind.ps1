# LearnNepal — Batch Tailwind Removal Script
# Removes Tailwind CDN, inline config, and body class references from all subject pages
# Also adds missing scripts (search.js, transitions.js)

$projectRoot = "c:\Users\Om Raut\Documents\GitHub\LearnNepal"

# List of files to process (relative to project root)
$files = @(
    "pages\class-11\english.html",
    "pages\class-11\nepali.html",
    "pages\class-12\nepali.html",
    "pages\class-10\opt-math\index.html",
    "pages\class-11\computer\c11_computer_syllabus.html",
    "pages\class-12\computer\c12_computer_syllabus.html",
    "pages\class-12\english\c12_english_syllabus.html",
    "pages\class-11\computer\c11_computer_chapter_1.html",
    "pages\class-11\computer\c11_computer_chapter_2.html",
    "pages\class-12\computer\c12_computer_chapter_1.html",
    "pages\class-12\computer\c12_computer_chapter_2.html",
    "pages\class-12\english\c12_english_unit_1.html",
    "pages\class-12\english\c12_english_story_1.html",
    "pages\class-12\english\c12_english_2083_solutions.html",
    "pages\class-12\nepali\c12_nepali_chapter_1.html",
    "pages\class-12\nepali\c12_nepali_chapter_9.html"
)

foreach ($relPath in $files) {
    $filePath = Join-Path $projectRoot $relPath
    if (-not (Test-Path $filePath)) {
        Write-Host "SKIP (not found): $relPath" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $filePath -Raw -Encoding UTF8

    # 1. Remove Tailwind CDN script tag
    $content = $content -replace '(?s)\s*<script src="https://cdn\.tailwindcss\.com[^"]*"></script>\s*', "`n"

    # 2. Remove inline tailwind config script block
    $content = $content -replace '(?s)\s*<script>\s*tailwind\.config\s*=\s*\{.*?\}\s*</script>\s*', "`n"
    $content = $content -replace '(?s)\s*<script id="tailwind-config">\s*tailwind\.config\s*=\s*\{.*?\}\s*</script>\s*', "`n"

    # 3. Remove inline <style> blocks with glass-card/lift-hover/material-symbols (the Tailwind page specific ones)
    $content = $content -replace '(?s)\s*<style>\s*\.glass-card\s*\{[^}]*\}\s*\.lift-hover\s*\{[^}]*\}\s*\.lift-hover:hover\s*\{[^}]*\}\s*\.material-symbols-outlined\s*\{[^}]*\}\s*</style>\s*', "`n"

    # 4. Clean body tag - remove Tailwind utility classes
    $content = $content -replace '<body class="[^"]*">', '<body>'

    # 5. Convert main tag with Tailwind classes to use our CSS class
    $content = $content -replace '<main class="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">', '<main class="content-page">'
    $content = $content -replace '<main class="pt-24 min-h-screen">', '<main class="content-page">'

    # 6. Ensure search.js and transitions.js are present before </body>
    if ($content -notmatch 'scripts/search\.js') {
        $content = $content -replace '(<script src="[^"]*scripts/app\.js"></script>)', "`$1`n<script src=`"$( if ($relPath -match '\\\\[^\\\\]+\\\\[^\\\\]+\\\\[^\\\\]+\\\\') { '../../../' } elseif ($relPath -match '\\\\[^\\\\]+\\\\[^\\\\]+\\\\') { '../../' } else { '../' })scripts/search.js`"></script>"
    }
    if ($content -notmatch 'scripts/transitions\.js') {
        $content = $content -replace '(scripts/search\.js"></script>)', "`$1`n<script src=`"$( if ($relPath -match '\\\\[^\\\\]+\\\\[^\\\\]+\\\\[^\\\\]+\\\\') { '../../../' } elseif ($relPath -match '\\\\[^\\\\]+\\\\[^\\\\]+\\\\') { '../../' } else { '../' })scripts/transitions.js`"></script>"
    }

    # Write back
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "DONE: $relPath" -ForegroundColor Green
}

Write-Host "`nAll files processed." -ForegroundColor Cyan
