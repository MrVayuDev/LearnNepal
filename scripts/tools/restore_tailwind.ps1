$Files = @(
    "about.html",
    "contact.html",
    "privacy.html",
    "pages\courses.html",
    "pages\class-11\english.html",
    "pages\class-11\nepali.html",
    "pages\class-11\computer\c11_computer_syllabus.html",
    "pages\class-11\computer\c11_computer_chapter_1.html",
    "pages\class-11\computer\c11_computer_chapter_2.html",
    "pages\class-12\nepali.html",
    "pages\class-12\computer\c12_computer_syllabus.html",
    "pages\class-12\computer\c12_computer_chapter_1.html",
    "pages\class-12\computer\c12_computer_chapter_2.html",
    "pages\class-12\english\c12_english_syllabus.html",
    "pages\class-12\english\c12_english_unit_1.html",
    "pages\class-12\english\c12_english_story_1.html",
    "pages\class-12\english\c12_english_2083_solutions.html",
    "pages\class-12\nepali\c12_nepali_chapter_1.html",
    "pages\class-12\nepali\c12_nepali_chapter_9.html"
)

$ProjectRoot = "c:\Users\Om Raut\Documents\GitHub\LearnNepal"

$TailwindBlock = @"
    <!-- Tailwind CDN for layout styling compatibility -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface-variant": "#dfe3e7",
                        "secondary-container": "#6cf8bb",
                        "tertiary-fixed-dim": "#ffb95f",
                        "on-error-container": "#93000a",
                        "inverse-surface": "#2c3134",
                        "tertiary-container": "#885500",
                        "secondary-fixed": "#6ffbbe",
                        "on-primary-container": "#dad7ff",
                        "primary-container": "#4f46e5",
                        "secondary": "#006c49",
                        "primary-fixed": "#e2dfff",
                        "inverse-primary": "#c3c0ff",
                        "surface-container-highest": "#dfe3e7",
                        "inverse-on-surface": "#edf1f5",
                        "surface-dim": "#d6dade",
                        "background": "#f6fafe",
                        "surface-container-lowest": "#ffffff",
                        "surface-bright": "#f6fafe",
                        "primary-fixed-dim": "#c3c0ff",
                        "on-primary-fixed-variant": "#3323cc",
                        "on-secondary-fixed-variant": "#005236",
                        "primary": "#3525cd",
                        "tertiary-fixed": "#ffddb8",
                        "outline": "#777587",
                        "on-tertiary-container": "#ffd4a4",
                        "on-background": "#171c1f",
                        "on-secondary-fixed": "#002113",
                        "surface-container-high": "#e4e9ed",
                        "error": "#ba1a1a",
                        "tertiary": "#684000",
                        "on-secondary-container": "#00714d",
                        "on-tertiary-fixed": "#2a1700",
                        "on-surface-variant": "#464555",
                        "outline-variant": "#c7c4d8",
                        "surface-container": "#eaeef2",
                        "on-surface": "#171c1f",
                        "on-error": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "on-secondary": "#ffffff",
                        "on-primary": "#ffffff",
                        "surface-tint": "#4d44e3",
                        "surface": "#f6fafe",
                        "on-primary-fixed": "#0f0069",
                        "secondary-fixed-dim": "#4edea3",
                        "on-tertiary-fixed-variant": "#653e00",
                        "surface-container-low": "#f0f4f8",
                        "error-container": "#ffdad6"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "base": "8px",
                        "margin-mobile": "16px",
                        "margin-desktop": "48px",
                        "gutter": "24px",
                        "container-max": "1280px"
                    },
                    fontFamily: {
                        "headline-md": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "nepali-body": ["Mukta"],
                        "headline-sm": ["Plus Jakarta Sans"],
                        "display-lg": ["Plus Jakarta Sans"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "display-lg-mobile": ["Plus Jakarta Sans"],
                        "label-md": ["Plus Jakarta Sans"]
                    },
                    fontSize: {
                        "headline-md": ["30px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "nepali-body": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-sm": ["24px", {"lineHeight": "1.4", "fontWeight": "700"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "display-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "800"}],
                        "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}]
                    }
                }
            }
        };
    </script>
"@

foreach ($file in $Files) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        $content = [System.IO.File]::ReadAllText($fullPath)
        
        # Check if Tailwind block is already there
        if ($content -notlike "*cdn.tailwindcss.com*") {
            Write-Host "Restoring Tailwind to: $file"
            $content = $content.Replace("</head>", "`n$TailwindBlock`n</head>")
            [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
            Write-Host "  Successfully restored." -ForegroundColor Green
        } else {
            Write-Host "Tailwind already present in: $file" -ForegroundColor Yellow
        }
    }
}
