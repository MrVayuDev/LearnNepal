$projectRoot = "c:\Users\Om Raut\Documents\GitHub\LearnNepal"

function Process-ExampleFile {
    param(
        [string]$SrcRelPath,
        [string]$DstRelPath,
        [string]$DepthStr
    )
    
    $srcPath = Join-Path $projectRoot $SrcRelPath
    $dstPath = Join-Path $projectRoot $DstRelPath
    
    if (-not (Test-Path $srcPath)) {
        Write-Host "File not found: $srcPath"
        return
    }
    
    $content = Get-Content $srcPath -Raw -Encoding UTF8
    
    # 1. Add theme.js to head
    if ($content -match '</head>') {
        $themeScript = "<script src=`"${DepthStr}scripts/theme.js`"></script>`n"
        $content = $content -replace '</head>', "$themeScript</head>"
    }
    
    # 2. Fix navigation links
    $content = [regex]::Replace($content, 'href="#"([^>]*>Home<)', "href=`"${DepthStr}index.html`"`$1")
    $content = [regex]::Replace($content, 'href="#"([^>]*>Courses<)', "href=`"${DepthStr}pages/courses.html`"`$1")
    $content = [regex]::Replace($content, 'href="#"([^>]*>Question Bank<)', "href=`"${DepthStr}pages/class-12/question-bank/index.html`"`$1")
    $content = [regex]::Replace($content, 'href="#"([^>]*>About<)', "href=`"${DepthStr}about.html`"`$1")
    $content = [regex]::Replace($content, 'href="#"([^>]*>\s*LearnNepal\s*<)', "href=`"${DepthStr}index.html`"`$1")
    
    # 3. Add theme-toggle class
    $content = $content.Replace('class="material-symbols-outlined text-on-surface-variant cursor-pointer"', 'class="material-symbols-outlined text-on-surface-variant cursor-pointer theme-toggle"')
    $content = $content.Replace('class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"', 'class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors theme-toggle"')
    $content = $content.Replace('class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container"', 'class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container theme-toggle"')
    
    [System.IO.File]::WriteAllText($dstPath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Restored $DstRelPath"
}

# Restore main pages from example templates
Process-ExampleFile -SrcRelPath 'example\contact_us_learnnepal\code.html' -DstRelPath 'contact.html' -DepthStr './'
Process-ExampleFile -SrcRelPath 'example\courses_learnnepal\code.html' -DstRelPath 'pages\courses.html' -DepthStr '../'
Process-ExampleFile -SrcRelPath 'example\neb_question_bank\code.html' -DstRelPath 'pages\class-12\question-bank\index.html' -DepthStr '../../../'
Process-ExampleFile -SrcRelPath 'example\about_us_learnnepal\code.html' -DstRelPath 'about.html' -DepthStr './'

# Restore tailwind to subject/chapter files modified by remove_tailwind.ps1
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

$tailwindConfig = @'
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "inverse-primary": "#c3c0ff",
                        "surface-container-highest": "#dfe3e7",
                        "on-tertiary": "#ffffff",
                        "inverse-on-surface": "#edf1f5",
                        "on-tertiary-fixed": "#2a1700",
                        "on-tertiary-container": "#ffd4a4",
                        "on-error-container": "#93000a",
                        "surface": "#f6fafe",
                        "primary-fixed": "#e2dfff",
                        "secondary-container": "#6cf8bb",
                        "tertiary-fixed": "#ffddb8",
                        "on-primary-fixed-variant": "#3323cc",
                        "error-container": "#ffdad6",
                        "surface-bright": "#f6fafe",
                        "on-surface": "#171c1f",
                        "on-primary-container": "#dad7ff",
                        "primary": "#3525cd",
                        "error": "#ba1a1a",
                        "surface-tint": "#4d44e3",
                        "on-tertiary-fixed-variant": "#653e00",
                        "on-surface-variant": "#464555",
                        "on-background": "#171c1f",
                        "on-secondary-fixed-variant": "#005236",
                        "inverse-surface": "#2c3134",
                        "tertiary-fixed-dim": "#ffb95f",
                        "surface-dim": "#d6dade",
                        "on-secondary": "#ffffff",
                        "on-primary": "#ffffff",
                        "primary-fixed-dim": "#c3c0ff",
                        "tertiary": "#684000",
                        "surface-container-high": "#e4e9ed",
                        "secondary-fixed-dim": "#4edea3",
                        "primary-container": "#4f46e5",
                        "outline-variant": "#c7c4d8",
                        "tertiary-container": "#885500",
                        "background": "#f6fafe",
                        "secondary": "#006c49",
                        "surface-container-low": "#f0f4f8",
                        "outline": "#777587",
                        "surface-variant": "#dfe3e7",
                        "on-error": "#ffffff",
                        "secondary-fixed": "#6ffbbe",
                        "surface-container": "#eaeef2",
                        "on-secondary-fixed": "#002113",
                        "on-secondary-container": "#00714d",
                        "surface-container-lowest": "#ffffff",
                        "on-primary-fixed": "#0f0069"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "gutter": "24px",
                        "container-max": "1280px",
                        "margin-mobile": "16px",
                        "margin-desktop": "48px",
                        "base": "8px"
                    },
                    "fontFamily": {
                        "display-lg": ["Plus Jakarta Sans"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "nepali-body": ["Mukta"],
                        "headline-sm": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "label-md": ["Plus Jakarta Sans"],
                        "headline-md": ["Plus Jakarta Sans"],
                        "display-lg-mobile": ["Plus Jakarta Sans"]
                    },
                    "fontSize": {
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "nepali-body": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-sm": ["24px", {"lineHeight": "1.4", "fontWeight": "700"}],
                        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "headline-md": ["30px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "display-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "800"}]
                    }
                },
            },
        }
    </script>
<style>
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 0.5px solid rgba(255, 255, 255, 0.2);
        }
        .lift-hover {
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), shadow 0.2s ease;
        }
        .lift-hover:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
'@

foreach ($relPath in $files) {
    $filePath = Join-Path $projectRoot $relPath
    if (-not (Test-Path $filePath)) { continue }

    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Check if tailwind script is already present
    if ($content -notmatch 'cdn\.tailwindcss\.com') {
        $content = $content -replace '</head>', "`n$tailwindConfig`n</head>"
    }

    # Restore body class
    $content = $content -replace '<body>', '<body class="bg-surface text-on-surface font-body-md selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">'
    
    # Restore main class
    $content = $content -replace '<main class="content-page[^"]*">', '<main class="flex-grow pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">'
    
    # Also I replaced header and footer in chapter_view.html, let's restore chapter_view.html from example if it exists.
    # Actually chapter_view is from class_12_computer_science_dbms/code.html
    
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Restored Tailwind in $relPath"
}

# Restore chapter_view.html
Process-ExampleFile -SrcRelPath 'example\class_12_computer_science_dbms\code.html' -DstRelPath 'pages\chapter_view.html' -DepthStr '../'

Write-Host "Done restoring pages."
