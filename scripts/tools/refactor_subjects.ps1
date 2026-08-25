$files = @(
    "pages\class-10\opt-math\index.html",
    "pages\class-11\english.html",
    "pages\class-11\nepali.html",
    "pages\class-11\computer\c11_computer_syllabus.html",
    "pages\class-12\nepali.html",
    "pages\class-12\computer\c12_computer_syllabus.html",
    "pages\class-12\english\c12_english_syllabus.html"
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Output "Skipping $file (not found)"
        continue
    }

    $content = Get-Content -Path $file -Raw -Encoding UTF8
    
    # Extract metadata
    $badge = ""
    $grade = "Class"
    $stream = "General"
    if ($content -match '(?s)<span class="badge">(.*?)</span>') {
        $badge = $matches[1] -replace '&bull;', '|' -replace '<[^>]+>', ''
        $parts = $badge.Split('|')
        if ($parts.Length -ge 2) {
            $grade = $parts[0].Trim()
            $stream = $parts[1].Trim()
        } else {
            $grade = $parts[0].Trim()
        }
    }

    $title = "Syllabus"
    if ($content -match '(?s)<h1[^>]*>(.*?)</h1>') {
        $title = $matches[1].Trim()
    }

    $desc = ""
    if ($content -match '(?s)<p class="text-lead"[^>]*>\s*(.*?)\s*</p>') {
        $desc = $matches[1].Trim() -replace '\s+', ' '
    }

    # Extract units
    $unitMatches = [regex]::Matches($content, '(?s)<a href="([^"]+)".*?class="card[^"]*".*?<div class="card-icon"[^>]*>(.*?)</div>.*?<h3[^>]*>(.*?)</h3>.*?<p[^>]*>(.*?)</p>.*?</a>')
    
    $unitsHtml = ""
    $totalUnits = $unitMatches.Count

    foreach ($match in $unitMatches) {
        $href = $match.Groups[1].Value.Trim()
        $num = $match.Groups[2].Value.Trim()
        $name = $match.Groups[3].Value.Trim()
        $subtext = $match.Groups[4].Value.Trim() -replace '<[^>]+>', ''

        $unitsHtml += @"
        <div class="group border border-outline-variant rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-primary/30">
            <div class="p-6 flex items-center justify-between cursor-pointer bg-surface-container-low group-hover:bg-primary/5 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden')">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">$num</div>
                    <div>
                        <h3 class="font-headline-sm">$name</h3>
                        <p class="text-on-surface-variant font-label-md">$subtext</p>
                    </div>
                </div>
                <span class="material-symbols-outlined transition-transform duration-300">keyboard_arrow_down</span>
            </div>
            <div class="hidden p-6 grid grid-cols-1 gap-4 bg-white border-t border-outline-variant">
                <div class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-outline-variant lift-hover">
                    <div>
                        <span class="text-on-surface-variant font-label-md uppercase tracking-wider">Chapter 01</span>
                        <h4 class="font-headline-sm text-lg mt-1">$name</h4>
                    </div>
                    <div class="flex gap-2 mt-4 md:mt-0">
                        <a href="$href" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-white transition-all font-label-md">
                            <span class="material-symbols-outlined text-[18px]">description</span> View Notes
                        </a>
                    </div>
                </div>
            </div>
        </div>
"@
        $unitsHtml += "`n"
    }

    $depth = ($file.Split('\').Length - 1)
    if ($depth -eq 1) { $depthStr = "../" }
    elseif ($depth -eq 2) { $depthStr = "../../" }
    elseif ($depth -eq 3) { $depthStr = "../../../" }
    elseif ($depth -eq 4) { $depthStr = "../../../../" }
    else { $depthStr = "./" }

    # Tailwind config string
    $twConfig = @"
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#3525cd",
                        "secondary": "#006c49",
                        "tertiary": "#684000",
                        "background": "#f6fafe",
                        "surface": "#f6fafe",
                        "surface-container": "#eaeef2",
                        "surface-container-low": "#f0f4f8",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-highest": "#dfe3e7",
                        "on-surface": "#171c1f",
                        "on-surface-variant": "#464555",
                        "outline-variant": "#c7c4d8",
                        "primary-container": "#4f46e5",
                        "secondary-container": "#6cf8bb"
                    },
                    spacing: {
                        "gutter": "24px",
                        "container-max": "1280px",
                        "margin-mobile": "16px",
                        "margin-desktop": "48px"
                    }
                }
            }
        }
"@

    $html = @"
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title - LearnNepal</title>
    
    <link rel="icon" type="image/png" href="${depthStr}assets/images/logo.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Mukta:wght@400;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <script>
$twConfig
    </script>
    
    <script src="${depthStr}scripts/theme.js"></script>
    <link rel="stylesheet" href="${depthStr}styles/main.css">
    
    <style>
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 0.5px solid rgba(255, 255, 255, 0.2); }
        .lift-hover { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease; }
        .lift-hover:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    </style>
</head>
<body class="bg-surface font-body-md text-on-surface">

<!-- TopNavBar -->

<main class="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
    <!-- Subject Header Section -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20 items-start">
        <div class="lg:col-span-8">
            <div class="flex items-center gap-2 mb-4">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full font-label-md">$grade</span>
                <span class="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-md">$stream</span>
            </div>
            <h1 class="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-6">$title</h1>
            <p class="font-body-lg text-on-surface-variant max-w-2xl">
                $desc
            </p>
        </div>
        <div class="lg:col-span-4">
            <div class="glass-card p-6 rounded-xl shadow-lg border border-primary/10">
                <h3 class="font-headline-sm mb-4">Subject Overview</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">menu_book</span>
                            <span class="font-body-md">Total Units</span>
                        </div>
                        <span class="font-bold">$totalUnits Units</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">schedule</span>
                            <span class="font-body-md">Est. Study Time</span>
                        </div>
                        <span class="font-bold">60 Hours</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-tertiary">trending_up</span>
                            <span class="font-body-md">Difficulty</span>
                        </div>
                        <span class="font-bold text-tertiary">Intermediate</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content Area: Curriculum & Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="lg:col-span-8 space-y-8">
            <div class="flex items-center justify-between mb-2">
                <h2 class="font-headline-md">Curriculum Breakdown</h2>
                <button class="text-primary font-label-md flex items-center gap-1" onclick="document.querySelectorAll('.hidden.p-6.grid').forEach(el => el.classList.remove('hidden'))">
                    Expand All <span class="material-symbols-outlined">expand_more</span>
                </button>
            </div>
            
$unitsHtml
            
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-gutter">
            <!-- Learning Progress Card -->
            <div class="bg-white p-8 rounded-2xl shadow-md border border-outline-variant relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <span class="material-symbols-outlined text-[80px] text-secondary">analytics</span>
                </div>
                <h3 class="font-headline-sm mb-6">Your Progress</h3>
                <div class="flex items-center justify-between mb-2">
                    <span class="font-label-md text-on-surface-variant">Course Completion</span>
                    <span class="font-bold text-secondary">0%</span>
                </div>
                <div class="h-3 w-full bg-secondary-container/20 rounded-full mb-6">
                    <div class="h-full bg-secondary rounded-full" style="width: 0%"></div>
                </div>
                <p class="font-body-md text-on-surface-variant mb-6">
                    Start learning to track your progress across all chapters.
                </p>
                <button class="w-full py-3 rounded-xl bg-primary text-white font-label-md hover:bg-primary/90 transition-all shadow-md">
                    Start Learning
                </button>
            </div>
        </div>
    </div>
</main>

<!-- Footer -->

<script src="${depthStr}scripts/app.js"></script>
</body>
</html>
"@

    Set-Content -Path $file -Value $html -Encoding UTF8
    Write-Output "Successfully refactored $file"
}
