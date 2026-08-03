param (
    [string]$src,
    [string]$dst,
    [string]$depthStr
)

$content = Get-Content -Path $src -Raw -Encoding UTF8

# 1. Add theme.js to head
$themeScript = '<script src="' + $depthStr + 'scripts/theme.js"></script>' + "`n"
$content = $content -replace "(?i)(</head>)", ($themeScript + "`$1")

# 2. Fix navigation links
$content = [regex]::Replace($content, 'href="#"([^>]*>Home<)', 'href="' + $depthStr + 'index.html"$1')
$content = [regex]::Replace($content, 'href="#"([^>]*>Courses<)', 'href="' + $depthStr + 'pages/courses.html"$1')
$content = [regex]::Replace($content, 'href="#"([^>]*>Question Bank<)', 'href="' + $depthStr + 'pages/class-12/question-bank/index.html"$1')
$content = [regex]::Replace($content, 'href="#"([^>]*>About<)', 'href="' + $depthStr + 'about.html"$1')
$content = [regex]::Replace($content, 'href="#"([^>]*>\s*LearnNepal\s*<)', 'href="' + $depthStr + 'index.html"$1')

# 3. Add theme-toggle class
$content = $content.Replace('class="material-symbols-outlined text-on-surface-variant cursor-pointer"', 'class="material-symbols-outlined text-on-surface-variant cursor-pointer theme-toggle"')
$content = $content.Replace('class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"', 'class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors theme-toggle"')
$content = $content.Replace('class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"', 'class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container theme-toggle"')

Set-Content -Path $dst -Value $content -Encoding UTF8
Write-Output "Processed $dst"
