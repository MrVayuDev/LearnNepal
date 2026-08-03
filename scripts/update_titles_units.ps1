# Full script to update all subject pages with big bold titles (Class X - Subject) and synced unit lists

function Build-AccordionBlock {
    param([string]$num, [string]$title, [string]$subtitle, [string]$chNum, [string]$chTitle, [string]$href)

    return @"
        <div class="group border border-outline-variant rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-primary/30">
            <div class="p-6 flex items-center justify-between cursor-pointer bg-surface-container-low group-hover:bg-primary/5 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden')">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">$num</div>
                    <div>
                        <h3 class="font-headline-sm">$title</h3>
                        <p class="text-on-surface-variant font-label-md">$subtitle</p>
                    </div>
                </div>
                <span class="material-symbols-outlined transition-transform duration-300">keyboard_arrow_down</span>
            </div>
            <div class="hidden p-6 grid grid-cols-1 gap-4 bg-white border-t border-outline-variant">
                <div class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-outline-variant lift-hover">
                    <div>
                        <span class="text-on-surface-variant font-label-md uppercase tracking-wider">$chNum</span>
                        <h4 class="font-headline-sm text-lg mt-1">$chTitle</h4>
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
}

function Write-SubjectPage {
    param(
        [string]$filePath,
        [string]$bigTitle,
        [string]$gradeTag,
        [string]$streamTag,
        [string]$description,
        [string]$totalUnits,
        [string]$unitsHtml,
        [string]$depthStr
    )

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
    <title>$bigTitle - LearnNepal</title>
    
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
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-16 items-start">
        <div class="lg:col-span-8">
            <div class="flex items-center gap-2 mb-4">
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full font-label-md">$gradeTag</span>
                <span class="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-md">$streamTag</span>
            </div>
            <h1 class="font-display-lg font-extrabold text-display-lg-mobile md:text-display-lg text-on-background mb-6 tracking-tight">$bigTitle</h1>
            <p class="font-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                $description
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
                        <span class="font-bold">80 Hours</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-tertiary">trending_up</span>
                            <span class="font-body-md">Difficulty</span>
                        </div>
                        <span class="font-bold text-tertiary">NEB Curriculum</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content Area: Curriculum Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="lg:col-span-8 space-y-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-headline-md text-2xl font-bold">Curriculum Breakdown</h2>
                <button class="text-primary font-label-md flex items-center gap-1 hover:underline" onclick="document.querySelectorAll('.hidden.p-6.grid').forEach(el => el.classList.remove('hidden'))">
                    Expand All <span class="material-symbols-outlined">expand_more</span>
                </button>
            </div>
            
$unitsHtml
            
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-gutter">
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

    Set-Content -Path $filePath -Value $html -Encoding UTF8
    Write-Output "Updated $filePath"
}

# 1. Class 10 - Optional Mathematics
$c10OptMath = (Build-AccordionBlock "1" "Function" "Composite & Inverse Functions" "Exercise 1.1 & 1.2" "Composite Function & Inverse Function" "viewer.html?pdf=alg_func_1_1.pdf") + "`n" +
              (Build-AccordionBlock "2" "Polynomial" "Remainder & Factor Theorem, Polynomial Equations" "Exercise 2.1 & 2.2" "Polynomial Equations" "viewer.html?pdf=alg_poly_2_1.pdf") + "`n" +
              (Build-AccordionBlock "3" "Linear Programming" "Linear Inequalities & Optimization" "Exercise 3.1 & 3.2" "Linear Programming Problems" "viewer.html?pdf=alg_lp_3_1.pdf") + "`n" +
              (Build-AccordionBlock "4" "Quadratic Equation" "Roots & Graphs of Quadratic Functions" "Exercise 4.1 & 4.2" "Quadratic Equations" "viewer.html?pdf=alg_quad_4_1.pdf") + "`n" +
              (Build-AccordionBlock "5" "Matrix & Determinants" "Determinants, Inverse Matrix & Cramer's Rule" "Exercise 6.1 - 6.3" "Matrix Operations" "viewer.html?pdf=mat_det_6_1.pdf") + "`n" +
              (Build-AccordionBlock "6" "Trigonometry" "Multiple & Sub-multiple Angles" "Exercise 7.1 - 7.3" "Trigonometric Identities" "viewer.html?pdf=trig_mult_7_1.pdf")

Write-SubjectPage -filePath "pages\class-10\opt-math\index.html" `
    -bigTitle "Class 10 - Optional Mathematics" `
    -gradeTag "Grade 10" -streamTag "SEE Board" `
    -description "Complete exercise solutions for NEB Class 10 Optional Mathematics: Functions, Polynomials, Linear Programming, Matrices, Trigonometry, Vectors, and Statistics." `
    -totalUnits "6" -unitsHtml $c10OptMath -depthStr "../../../"

# 2. Class 11 - English
$c11English = (Build-AccordionBlock "1" "Language Development" "Grammar, Vocabulary, and Reading Comprehension" "Section I" "Language Skills & Grammar" "#") + "`n" +
              (Build-AccordionBlock "2" "Literature" "Short Stories, Poems, Essays, and One-Act Plays" "Section II" "Literary Texts & Analysis" "#")

Write-SubjectPage -filePath "pages\class-11\english.html" `
    -bigTitle "Class 11 - English" `
    -gradeTag "Grade 11" -streamTag "Compulsory" `
    -description "Complete curriculum notes and summaries for NEB Class 11 English language development and literature." `
    -totalUnits "2" -unitsHtml $c11English -depthStr "../../"

# 3. Class 11 - Nepali
$c11Nepali = (Build-AccordionBlock "१" "वीर पुर्खा" "कविता - राष्ट्रियता र पुर्खाको गौरव" "पाठ १" "वीर पुर्खा (कविता)" "#") + "`n" +
             (Build-AccordionBlock "२" "गाउँको माया" "कथा - सामाजिक जीवन र परिवेश" "पाठ २" "गाउँको माया (कथा)" "#") + "`n" +
             (Build-AccordionBlock "३" "संस्कृतिको नयाँ यात्रा" "निबन्ध - संस्कृति र रूपान्तरण" "पाठ ३" "संस्कृतिको नयाँ यात्रा (निबन्ध)" "#") + "`n" +
             (Build-AccordionBlock "४" "योगमाया" "एकाङ्की - सामाजिक चेतना" "पाठ ४" "योगमाया (एकाङ्की)" "#") + "`n" +
             (Build-AccordionBlock "५" "साथीलाई पत्र" "पत्रसाहित्य - व्यवहारिक लेखन" "पाठ ५" "साथीलाई पत्र (पत्रसाहित्य)" "#")

Write-SubjectPage -filePath "pages\class-11\nepali.html" `
    -bigTitle "Class 11 - Nepali" `
    -gradeTag "Grade 11" -streamTag "Compulsory" `
    -description "कक्षा ११ नेपाली विषयको सम्पूर्ण पाठ्यसामग्री, कविता, कथा, निबन्ध र अभ्यास उत्तरहरू।" `
    -totalUnits "5" -unitsHtml $c11Nepali -depthStr "../../"

# 4. Class 11 - Computer Science
$c11Comp = (Build-AccordionBlock "1" "Computer System" "Concepts, Architecture & Components" "Chapter 01" "Computer Architecture & Organization" "c11_computer_chapter_1.html") + "`n" +
           (Build-AccordionBlock "2" "Number System & Boolean Logic" "Binary, Octal, Hexadecimal & Logic Gates" "Chapter 02" "Number System & Gates" "c11_computer_chapter_2.html") + "`n" +
           (Build-AccordionBlock "3" "Computer Software & Operating System" "System Software, OS Functions & Concepts" "Chapter 03" "Software & OS" "#") + "`n" +
           (Build-AccordionBlock "4" "Application Package & Web Technology" "HTML, CSS & Office Tools" "Chapter 04" "Web & Packages" "#") + "`n" +
           (Build-AccordionBlock "5" "Programming Concepts & C Language" "Algorithms, Flowcharts & Control Statements" "Chapter 05" "C Programming Basics" "#")

Write-SubjectPage -filePath "pages\class-11\computer\c11_computer_syllabus.html" `
    -bigTitle "Class 11 - Computer Science" `
    -gradeTag "Grade 11" -streamTag "Computer Stream" `
    -description "NEB Class 11 Computer Science syllabus notes, diagrams, and programming guides." `
    -totalUnits "5" -unitsHtml $c11Comp -depthStr "../../../"

# 5. Class 12 - English
$c12English = (Build-AccordionBlock "1" "Section I: Language Development" "Grammar, Vocabulary & Critical Writing" "Unit 01" "Language Skills & Grammar" "c12_english_unit_1.html") + "`n" +
              (Build-AccordionBlock "2" "Section II: Literature (Short Stories)" "Neighbors, A Respectable Woman, and key stories" "Unit 02" "Neighbors & Story Summaries" "c12_english_story_1.html") + "`n" +
              (Build-AccordionBlock "3" "NEB Model Solutions (2083)" "Solved past board exam questions and answers" "Board Prep" "Complete 2083 Model Solution" "c12_english_2083_solutions.html")

Write-SubjectPage -filePath "pages\class-12\english\c12_english_syllabus.html" `
    -bigTitle "Class 12 - English" `
    -gradeTag "Grade 12" -streamTag "Compulsory" `
    -description "Comprehensive study guide, story summaries, grammar rules, and 2083 board exam solutions for NEB Class 12 English." `
    -totalUnits "3" -unitsHtml $c12English -depthStr "../../../"

# 6. Class 12 - Nepali
$c12Nepali = (Build-AccordionBlock "१" "आमाको सपना" "कविता - देशभक्ति र क्रान्तिकारी चेतना" "पाठ १" "आमाको सपना (कविता)" "nepali/c12_nepali_chapter_1.html") + "`n" +
             (Build-AccordionBlock "२" "विरही दमयन्ती" "कथा - पौराणिक आख्यान" "पाठ २" "विरही दमयन्ती (कथा)" "#") + "`n" +
             (Build-AccordionBlock "३" "घनघस्याको उकालो काटी" "यात्रा संस्मरण - नियात्रा" "पाठ ३" "घनघस्याको उकालो काटी" "#") + "`n" +
             (Build-AccordionBlock "४" "व्यवसायिक पत्र" "व्यवहारिक लेखन र पत्राचार" "पाठ ४" "व्यवसायिक पत्र लेखन" "#") + "`n" +
             (Build-AccordionBlock "५" "सहकारी" "निबन्ध - आर्थिक समृद्धि र सहकार्य" "पाठ ९" "सहकारी (निबन्ध)" "nepali/c12_nepali_chapter_9.html")

Write-SubjectPage -filePath "pages\class-12\nepali.html" `
    -bigTitle "Class 12 - Nepali" `
    -gradeTag "Grade 12" -streamTag "Compulsory" `
    -description "कक्षा १२ नेपाली पाठ्यपुस्तकका सम्पूर्ण पाठहरू, कविता विश्लेषण, कथाको सारांश र उत्तरहरू।" `
    -totalUnits "5" -unitsHtml $c12Nepali -depthStr "../../"

# 7. Class 12 - Computer Science
$c12Comp = (Build-AccordionBlock "1" "Database Management System (DBMS)" "Database Concepts, Relational Model & SQL" "Chapter 01" "DBMS & SQL Querying" "c12_computer_chapter_1.html") + "`n" +
           (Build-AccordionBlock "2" "Network & Data Communication" "Topologies, Protocols, OSI Model & Hardware" "Chapter 02" "Networking Fundamentals" "c12_computer_chapter_2.html") + "`n" +
           (Build-AccordionBlock "3" "Web Technology II" "CSS Grid/Flexbox, JavaScript DOM & Server-Side PHP" "Chapter 03" "Web Development II" "#") + "`n" +
           (Build-AccordionBlock "4" "Programming in C" "Structures, Unions, Pointers & File Handling" "Chapter 04" "Advanced C Programming" "#") + "`n" +
           (Build-AccordionBlock "5" "OOP Concepts" "Classes, Objects, Inheritance & Polymorphism" "Chapter 05" "Object Oriented Programming" "#") + "`n" +
           (Build-AccordionBlock "6" "Software Process Model" "SDLC, Waterfall, Agile & System Testing" "Chapter 06" "Software Engineering" "#") + "`n" +
           (Build-AccordionBlock "7" "Recent Trends in ICT" "Cloud Computing, AI, IoT & Big Data" "Chapter 07" "Modern ICT Trends" "#")

Write-SubjectPage -filePath "pages\class-12\computer\c12_computer_syllabus.html" `
    -bigTitle "Class 12 - Computer Science" `
    -gradeTag "Grade 12" -streamTag "Computer Science" `
    -description "Detailed chapter notes, code snippets, database diagrams, and networking tutorials for NEB Class 12 Computer Science." `
    -totalUnits "7" -unitsHtml $c12Comp -depthStr "../../../"

Write-Output "All 7 subject pages rebuilt with Big Bold Titles (Class - Subject) and synced unit lists."
