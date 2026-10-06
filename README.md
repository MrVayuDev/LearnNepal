# LearnNepal — Next-Gen Academic Learning Platform for Nepal

[![Static Site](https://img.shields.io/badge/Architecture-Static--First%20%7C%20Zero--Build-10b981?style=for-the-badge&logo=html5&logoColor=white)](https://learnnepal.me)
[![Design System](https://img.shields.io/badge/CSS3-Modular%20Tokens-3b82f6?style=for-the-badge&logo=css3&logoColor=white)](./styles/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-f59e0b?style=for-the-badge&logo=javascript&logoColor=white)](./scripts/)
[![Grades Covered](https://img.shields.io/badge/Grades-Class%208%20%7C%2010%20(SEE)%20%7C%2011%20%7C%2012%20(NEB)-8b5cf6?style=for-the-badge)](./pages/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](./LICENSE)

---

## 📖 Table of Contents

1. [Executive Overview](#-executive-overview)
2. [Key Platform Features](#-key-platform-features)
3. [Grade & Subject Coverage](#-grade--subject-coverage)
4. [Universal Question Bank Engine (v1.0)](#-universal-question-bank-engine-v10)
   - [Architectural Principles](#architectural-principles)
   - [JSON Data Schema Specification](#json-data-schema-specification)
   - [Rich Content Block System](#rich-content-block-system)
5. [Complete Repository Structure](#-complete-repository-structure)
6. [Component & Layer Breakdown](#-component--layer-breakdown)
   - [1. Root & Core Pages](#1-root--core-pages)
   - [2. Grade Hubs & Chapters](#2-grade-hubs--chapters)
   - [3. Client Runtime Scripts (`scripts/`)](#3-client-runtime-scripts-scripts)
   - [4. Modular CSS Design System (`styles/`)](#4-modular-css-design-system-styles)
   - [5. Maintenance & Tooling Scripts (`scripts/tools/`)](#5-maintenance--tooling-scripts-scriptstools)
   - [6. Data Repositories (`data/`)](#6-data-repositories-data)
7. [Design System & UI Architecture](#-design-system--ui-architecture)
8. [Local Development & Usage](#-local-development--usage)
9. [Performance, SEO & Accessibility](#-performance-seo--accessibility)
10. [Contributing & Content Guidelines](#-contributing--content-guidelines)
11. [License & Acknowledgments](#-license--acknowledgments)

---

## 🌟 Executive Overview

**LearnNepal** is an open-access, high-performance educational web platform engineered specifically for school and secondary education students in Nepal (Grade 8, Class 10 SEE, and Class 11/12 NEB). It provides comprehensive curriculum breakdowns, structured textbook chapter notes, exercise solutions, bilingual study resources, and an interactive solved National Examinations Board past question bank.

### Core Philosophy:
* **Zero-Build, Static-First**: Built with native HTML5, modular CSS3 tokens, and vanilla ES6+ JavaScript. No Node build pipelines, transpilers, or bundle overhead are required for production deployment.
* **Instant Load on Low Bandwidth**: Optimized for Nepali mobile networks with sub-second First Contentful Paint (FCP) and zero heavy runtime dependencies.
* **Schema-Driven Flexibility**: The question bank and content modules operate on clean JSON specifications, enabling dynamic rendering without code changes.
* **Devanagari-First Typography**: Native high-legibility bilingual rendering with Google Fonts *Mukta* and *Plus Jakarta Sans*.

---

## ⚡ Key Platform Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Global Instant Search (`Ctrl+K`)** | Keyboard-accessible modal search dialog providing instant fuzzy search across all grade levels, units, chapters, and past questions. |
| 📚 **Universal Question Bank Engine** | Data-driven past exam paper viewer featuring year selection (`2080`, `2081`, `2082`), question groups (`Group A/B/C`), marks breakdowns, interactive MCQ option selection, and collapsible solutions. |
| 🌐 **Bilingual Dual-Script Engine** | Real-time toggle and support for simultaneous English and Devanagari Nepali scripts across curriculum modules and question instructions. |
| 📄 **Embedded Canvas PDF Viewer** | High-performance canvas PDF rendering engine powered by PDF.js and background caching service worker (`vault-worker.js`) for complex mathematics solutions. |
| 📱 **Mobile-First Responsive Layout** | Touch-friendly navigation drawer, sticky breadcrumb progress trails, floating back-to-top actions, and smooth momentum scrolling via Lenis. |
| 🎥 **Dynamic YouTube Integration** | Automatic fetching and grid rendering of official video tutorials directly from curated video datasets without backend dependencies. |
| 🎨 **Design Token System** | Scalable CSS custom properties defining a modern HSL color palette, typography scales, glassmorphism layers, and micro-interactions. |

---

## 🎓 Grade & Subject Coverage

```
LearnNepal/
├── Class 8 (BLE Foundation)
│   └── Social Studies & Human Values Education (सामाजिक अध्ययन तथा मानव मूल्य शिक्षा)
│       ├── Unit 1: We, Our Community and Nation (हामी, हाम्रो समाज र राष्ट्र)
│       └── Complete Chapter Solutions & Value Exercises
├── Class 10 (Secondary Education Examination - SEE)
│   ├── Optional Mathematics (ऐच्छिक गणित)
│   │   ├── Vector, Trigonometry, Coordinate Geometry, Transformation, Matrices
│   │   └── Embedded PDF Viewer & Past Model Sets
│   ├── Science & Technology (विज्ञान तथा प्रविधि)
│   │   └── Solved Board Examination Papers (2080-2082)
│   ├── English (Compulsory)
│   │   └── Unit Solutions, Grammar Bank, Reading Comprehension
│   ├── Social Studies (सामाजिक अध्ययन)
│   └── Economics (अर्थशास्त्र)
├── Class 11 (National Examinations Board - NEB)
│   ├── Compulsory English
│   ├── Compulsory Nepali (अनिवार्य नेपाली)
│   ├── Computer Science (C Programming, Web Tech, Digital Logic)
│   └── Solved Past Question Bank Hubs
└── Class 12 (National Examinations Board - NEB)
    ├── Compulsory English (Stories, Poems, Essays, One-Act Plays & Grammar)
    ├── Compulsory Nepali (साहित्यिक पाठहरू, व्याकरण र रचना)
    ├── Computer Science (DBMS, Networking, OOP in C++, Web Tech II, Software Engineering)
    └── Comprehensive Solved Past Board Questions (2080, 2081, 2082 Regular & Back)
```

---

## ⚙️ Universal Question Bank Engine (v1.0)

The LearnNepal Question Bank is powered by **`scripts/question-bank-engine.js`**, a data-driven rendering engine that transforms structured JSON datasets into interactive, printable, and searchable exam environments.

### Architectural Principles

```
                  ┌───────────────────────────────┐
                  │    question-bank/*.json       │
                  │ (Standardized Schema v1 File) │
                  └──────────────┬────────────────┘
                                 │ Fetch & Parse
                                 ▼
                  ┌───────────────────────────────┐
                  │      QBEngine.load(data)      │
                  │  • Schema Normalization       │
                  │  • State & Filter Registry    │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│          buildUI()            │               │           render()            │
│  • Subject / Grade Selector   │               │  • Group Containers (A/B/C)   │
│  • Year & Set Navigation      │               │  • Interactive MCQ Evaluator  │
│  • Exam Timer & Stats Bar     │               │  • KaTeX / Formula Parser     │
│  • Language Mode Switcher     │               │  • Collapsible Solution Views │
└───────────────────────────────┘               └───────────────────────────────┘
```

### JSON Data Schema Specification

Every question bank JSON file conforms to the Universal Schema:

```json
{
  "$schema": "./schema.md",
  "classId": "class-12",
  "className": "Class 12",
  "subjectId": "computer-science",
  "subjectName": "Computer Science",
  "languageMode": "english",
  "lastUpdated": "2082-03-15",
  "chapters": [
    { "id": "database-management-system", "name": "Database Management System" },
    { "id": "networking", "name": "Networking & Communication" }
  ],
  "exams": [
    {
      "year": "2080",
      "examType": { "id": "regular", "name": "Regular Examination" },
      "fullMarks": 75,
      "passMarks": 27,
      "duration": "3 hours",
      "sets": [
        {
          "id": "set-a",
          "name": "Set A",
          "groups": [
            {
              "id": "group-a",
              "name": "Group A - Very Short / Multiple Choice",
              "questionType": "mcq",
              "totalMarks": 9,
              "instruction": "Select or write the correct option.",
              "questions": [
                {
                  "id": "c12-cs-2080-reg-a-q1",
                  "questionNumber": "1",
                  "marks": 1,
                  "chapterId": "database-management-system",
                  "tags": ["mcq", "rdbms", "keys"],
                  "difficulty": "easy",
                  "question": {
                    "content": [
                      { "type": "text", "value": "Which of the following is an attribute that uniquely identifies a row in a table?" }
                    ]
                  },
                  "options": [
                    { "id": "a", "text": "Foreign Key" },
                    { "id": "b", "text": "Primary Key" },
                    { "id": "c", "text": "Composite Key" },
                    { "id": "d", "text": "Candidate Key" }
                  ],
                  "correctAnswer": ["b"],
                  "answer": {
                    "content": [
                      { "type": "text", "value": "A Primary Key uniquely identifies each record in a database table." }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Rich Content Block System

The content engine renders multi-modal question materials using composable content blocks:

* **Text (`text`)**: Standard string or bilingual object (`{ "english": "...", "nepali": "..." }`).
* **Formula (`formula`)**: LaTeX string rendered seamlessly with mathematical notation.
* **Code Block (`code`)**: Formatted syntax block with language tags (`c`, `cpp`, `sql`, `html`).
* **Table (`table`)**: Structured headers and 2D row matrices for comparisons.
* **Diagrams / Images (`image` / `svg`)**: Vector illustrations with responsive captions.
* **Sub-Questions (`subQuestions`)**: Nested multi-part questions with individual mark weightages.
* **Internal Choice (`choice`)**: `either-or` split question representation for standard board paper choices.

---

## 🗂️ Complete Repository Structure

```text
LearnNepal/
├── .github/                         # GitHub repository configuration and workflows
├── .vscode/                         # Visual Studio Code workspace settings
├── assets/                          # Design system assets & static branding
│   ├── fonts/                       # Local web font files & Devanagari fallbacks
│   └── images/                      # Branding, SVG vectors & content imagery
│       ├── author_gopal.png         # Author portrait asset
│       ├── class-8-social.jpg       # Cover art for Class 8 Social Studies
│       ├── feat-bilingual.svg       # Feature illustration: Bilingual support
│       ├── feat-curriculum.svg      # Feature illustration: Curriculum accuracy
│       ├── feat-fast.svg            # Feature illustration: Blazing fast performance
│       ├── img_hero.jfif            # Hero graphic
│       └── logo.png                 # Official LearnNepal logo
├── data/                            # Structured JSON data stores
│   ├── latest-video.json            # YouTube video feed configuration
│   └── question-bank/               # Solved past board question datasets
│       ├── class-10-english-template.json # Base template for Grade 10 English
│       ├── class-10-english.json          # Grade 10 English solved questions
│       ├── computer.json                  # Grade 12 Computer Science question bank
│       ├── english.json                   # Grade 12 English solved question bank
│       ├── nepali.json                    # Grade 12 Nepali solved question bank
│       ├── science&technology.json        # Grade 10 Science & Tech question bank
│       └── schema.md                      # Universal JSON schema specification (v1)
├── demo pages/                      # Staging & layout reference pages
│   └── 12-eng-demo.html             # Extended Class 12 English layout demo
├── pages/                           # Main portal, subject chapters & question banks
│   ├── chapter_view.html            # Standard chapter layout template
│   ├── courses.html                 # Complete courses directory & curriculum hub
│   ├── class-8/                     # Grade 8 BLE educational portal
│   │   ├── social.html              # Grade 8 Social Studies course overview
│   │   └── social/                  # Unit & chapter reading views
│   │       ├── index.html           # Social Studies unit directory
│   │       ├── unit-1-chapter-1.html# Ch 1: Our Traditional Values
│   │       └── unit-1-chapter-2.html# Ch 2: Social Traditions & Customs
│   ├── class-10/                    # Grade 10 SEE portal
│   │   ├── opt-math/                # Optional Mathematics hub
│   │   │   ├── index.html           # Opt Math chapter index
│   │   │   ├── viewer.html          # PDF.js interactive canvas reader
│   │   │   ├── viewer.css           # PDF viewer dedicated styling
│   │   │   └── vault-worker.js      # Service worker proxy & document cache
│   │   ├── question-bank/           # Class 10 Question Bank portal
│   │   │   └── index.html           # Grade 10 solved board question hub
│   │   ├── social.html              # Class 10 Social Studies entry point
│   │   └── social/                  # Class 10 Social Studies units
│   ├── class-11/                    # Grade 11 NEB portal
│   │   ├── computer/                # Grade 11 Computer Science modules
│   │   ├── english.html             # Grade 11 English syllabus & lessons
│   │   ├── nepali.html              # Grade 11 Nepali (अनिवार्य नेपाली) portal
│   │   └── question-bank/           # Grade 11 Question Bank portal
│   ├── class-12/                    # Grade 12 NEB portal
│   │   ├── computer/                # Grade 12 Computer Science chapters
│   │   │   ├── c12_computer_chapter_1.html # Database Management Systems (DBMS)
│   │   │   ├── c12_computer_chapter_2.html # Networking & Data Communication
│   │   │   └── c12_computer_syllabus.html  # NEB Class 12 CS Curriculum
│   │   ├── english/                 # Grade 12 Compulsory English
│   │   │   ├── c12_english_2083_solutions.html # 2083 Model Question Solutions
│   │   │   ├── c12_english_story_1.html        # Story 1: Neighbors
│   │   │   ├── c12_english_story_2.html        # Story 2: A Respectable Woman
│   │   │   ├── c12_english_story_3.html        # Story 3: A Devoted Son
│   │   │   ├── c12_english_story_4.html        # Story 4: The Treasure in the Forest
│   │   │   ├── c12_english_syllabus.html       # Complete NEB English Syllabus
│   │   │   └── c12_english_unit_1.html         # Unit 1 Critical Thinking Notes
│   │   ├── nepali/                  # Grade 12 Compulsory Nepali
│   │   │   ├── c12_nepali_chapter_1.html       # Ch 1: आमाको सपना (कविता)
│   │   │   └── c12_nepali_chapter_9.html       # Ch 9: सङ्घर्ष र सफलता
│   │   ├── nepali.html              # Grade 12 Nepali course portal
│   │   └── question-bank/           # Grade 12 Past Questions Bank
│   │       ├── computer/            # CS Past Papers Viewer
│   │       ├── english/             # English Past Papers Viewer
│   │       ├── nepali/              # Nepali Past Papers Viewer
│   │       └── index.html           # Grade 12 Question Bank index
│   └── question-bank/               # Global Question Bank Portal
│       └── index.html               # Universal Question Bank viewer
├── scripts/                         # Core client-side JavaScript architecture
│   ├── app.js                       # Master app bootstrap & component controller
│   ├── latest-video-section.js      # YouTube video feed dynamic loader
│   ├── popup.js                     # Announcement & modal banner manager
│   ├── question-bank-engine.js      # Universal Question Bank Engine v1.0
│   ├── question-bank.js             # Legacy filter controller & QB helpers
│   ├── search.js                    # Global instant Ctrl+K modal search engine
│   ├── theme.js                     # Light theme enforcement & storage cleaner
│   ├── transitions.js               # Smooth scrolling (Lenis) & mobile drawer
│   └── tools/                       # Maintenance, migration & build automation
│       ├── copy_examples.js         # JSON dataset migration helper
│       ├── copy_examples.ps1        # PowerShell data copying utility
│       ├── copy_examples.py         # Python dataset formatter
│       ├── fix_paths.ps1            # Absolute/relative link sanitizer
│       ├── inject_header_footer.ps1 # Batch header/footer injector
│       ├── migrate_pages.ps1        # Legacy HTML to modern layout migrator
│       ├── populate_all_qb_questions.ps1 # QB JSON mass population script
│       ├── refactor_subjects.ps1    # Subject hierarchy restructuring utility
│       ├── remove_tailwind.ps1      # Tailwind purge & Vanilla CSS normalizer
│       ├── restore.ps1              # Backup recovery utility
│       ├── restore_tailwind.ps1     # Legacy styling rollback tool
│       ├── update_nav_footer.ps1    # Universal navigation updater
│       └── update_titles_units.ps1  # SEO meta title & unit tag sync tool
├── styles/                          # Modular CSS design system (@import in main.css)
│   ├── animations.css               # Keyframes, transitions & micro-interactions
│   ├── components.css               # Buttons, cards, badges, modal, tabs, accordions
│   ├── content.css                  # Chapter reader view, sticky TOC, exercise callouts
│   ├── courses.css                  # Course catalog grid, filter chips, grade badges
│   ├── homepage.css                 # Hero section, trust bento grid, stats counter
│   ├── layout.css                   # Header, navigation, footer, grid wrappers
│   ├── loader.css                   # Skeleton loaders & spinner animations
│   ├── main.css                     # Primary stylesheet entry point
│   ├── popup.css                    # Announcement banner styling
│   ├── question-bank.css            # Question bank layout, filters, marks & options
│   ├── reset.css                    # Modern CSS reset & box-sizing
│   ├── responsive.css               # Centralized media query breakpoints
│   ├── typography.css               # Fonts, headings, line heights, Devanagari rules
│   └── variables.css                # CSS Design Tokens (colors, spacing, shadows, radii)
├── about.html                       # About LearnNepal (Mission, Vision, Author Profile)
├── contact.html                     # Contact Us & Student Feedback Form
├── index.html                       # Homepage portal with Hero, Bento Grid, Video Feed
├── privacy.html                     # Privacy Policy & Platform Terms
└── README.md                        # Complete technical documentation & guide
```

---

## 🧩 Component & Layer Breakdown

### 1. Root & Core Pages
* **`index.html`**: The main platform landing page. Features a hero banner, quick grade selectors (Class 8, 10, 11, 12), animated trust statistics, curriculum feature bento grid, dynamic YouTube tutorial section, step-by-step learning guide, and newsletter CTA.
* **`about.html`**: Details the platform’s mission to democratize quality education in Nepal, core pedagogical values, author profile (Gopal Gautam), and future roadmap.
* **`contact.html`**: Contact form and support hub with direct links to community discussion channels and academic inquiries.
* **`privacy.html`**: Transparent, plain-language privacy statement detailing student data safety and static site security.

### 2. Grade Hubs & Chapters
* **`pages/courses.html`**: Central catalog index allowing students to filter courses by grade level and subject stream.
* **`pages/class-8/`**: Tailored for BLE Grade 8 students. Features complete bilingual unit notes for *Social Studies and Human Values Education*.
* **`pages/class-10/opt-math/`**: Specialized environment containing an interactive canvas PDF viewer (`viewer.html`) with service worker caching (`vault-worker.js`) to display complex mathematical proofs, geometric constructions, and vector calculations without browser plugin dependencies.
* **`pages/class-12/`**: High-density academic portals covering Compulsory English (stories, poems, essays, model solutions), Compulsory Nepali, and Computer Science (C++, DBMS, networking, web tech).

### 3. Client Runtime Scripts (`scripts/`)
* **`scripts/app.js`**: Central application coordinator. Initializes global navigation, populates dynamic year/copyright notices, attaches link status observers, and manages component lifecycle events.
* **`scripts/question-bank-engine.js`**: The universal engine powering the entire past question bank. Manages dataset fetching, client-side caching, search indexing, interactive MCQ evaluation, and print layout optimization.
* **`scripts/search.js`**: Global modal search invoked via `Ctrl+K` (or `Cmd+K` on macOS) or the search icon in the header. Indexes all curriculum pages, past question papers, and syllabus topics for instant client-side lookup.
* **`scripts/transitions.js`**: Smooth momentum scroll implementation using Lenis, dynamic navbar glassmorphism transition on scroll, and back-to-top floating button controller.
* **`scripts/theme.js`**: Enforces optimized light mode palettes and manages storage key cleanups.
* **`scripts/latest-video-section.js`**: Asynchronously loads `data/latest-video.json` to populate the homepage video showcase dynamically.
* **`scripts/popup.js`**: Displays dismissible announcements, exam notices, or platform updates stored in `sessionStorage`.

### 4. Modular CSS Design System (`styles/`)
* **`styles/main.css`**: Master stylesheet that imports all CSS modules in cascading order.
* **`styles/variables.css`**: Defines all CSS custom properties (`--primary`, `--primary-light`, `--secondary`, `--accent`, `--surface`, `--text-primary`, `--space-*`, `--radius-*`, `--shadow-*`).
* **`styles/reset.css`**: Modern reset setting `box-sizing: border-box`, smooth typography antialiasing, and uniform element defaults.
* **`styles/typography.css`**: Typography hierarchy configuring font families (*Mukta*, *Plus Jakarta Sans*, *Outfit*), fluid font sizes (`clamp()`), line heights, and Devanagari script scaling.
* **`styles/layout.css`**: Global header, navbar drawer, container wrappers, footer columns, and grid definitions.
* **`styles/components.css`**: Extensive atomic component library including primary/secondary/ghost buttons, cards, glass panels, pill tags, badges, modals, tooltips, and forms.
* **`styles/homepage.css`**: Hero layout, trust badges, bento grid styling, stats counters, and homepage CTA sections.
* **`styles/content.css`**: Chapter reading views, sticky sidebars, progress indicators, exercise solution accordions, summary boxes, and glossary tables.
* **`styles/question-bank.css`**: Comprehensive styling for question bank layouts, group tabs, mark badges, option buttons, interactive feedback states, and print stylesheets (`@media print`).
* **`styles/responsive.css`**: Centralized responsive media queries covering small mobile (`<480px`), tablets (`481px–768px`), laptops (`769px–1024px`), and ultra-wide desktops.

### 5. Maintenance & Tooling Scripts (`scripts/tools/`)
A collection of developer automation utilities:
* `inject_header_footer.ps1`: Batch updates consistent headers and footers across all HTML pages.
* `migrate_pages.ps1`: Upgrades legacy HTML page layouts into the modern design token format.
* `populate_all_qb_questions.ps1`: Mass-populates question bank datasets from raw text archives into structured JSON schema files.
* `update_titles_units.ps1`: Automatically synchronizes page `<title>` tags, meta descriptions, and breadcrumb structures.
* `fix_paths.ps1`: Verifies and repairs relative paths for assets, stylesheets, and scripts across all nested subdirectories.

### 6. Data Repositories (`data/`)
* `data/question-bank/*.json`: Individual structured question bank files for Computer Science, English, Nepali, and Science & Technology.
* `data/latest-video.json`: YouTube video configuration file containing video IDs, titles, thumbnails, and channel metadata.

---

## 🎨 Design System & UI Architecture

### Color Palette (Tokens)

```css
:root {
  /* Brand Identity */
  --primary: #2563eb;          /* Vibrant Academic Blue */
  --primary-dark: #1d4ed8;     /* Deep Navy Blue */
  --primary-light: #eff6ff;    /* Soft Tint Background */
  --secondary: #0f172a;        /* Deep Slate Neutral */
  --accent: #f59e0b;           /* Nepal Golden Ochre */
  --accent-light: #fef3c7;     /* Highlight Tint */

  /* Surface & Semantic Colors */
  --bg-primary: #f8fafc;       /* Canvas Background */
  --bg-surface: #ffffff;       /* Card & Container Background */
  --text-primary: #0f172a;     /* High Contrast Text */
  --text-secondary: #475569;   /* Muted Paragraph Text */
  --border-subtle: #e2e8f0;    /* Border & Divider Lines */
  --success: #10b981;          /* Correct Answer Green */
  --error: #ef4444;            /* Warning / Incorrect Red */

  /* Elevations & Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.12);
}
```

### Typography

* **Headings & English Body**: `Plus Jakarta Sans`, `Inter`, system-ui, sans-serif
* **Devanagari (Nepali Content)**: `Mukta`, `Noto Sans Devanagari`, sans-serif
* **Monospace / Code Snippets**: `JetBrains Mono`, `Fira Code`, monospace

---

## 🚀 Local Development & Usage

### Prerequisites
Because LearnNepal is completely static-first, **no Node.js build process or compiler is required**. You only need a modern web browser and any lightweight local HTTP server to support `fetch()` API requests for JSON datasets.

### Option 1: Using VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. Live Server will launch the platform at `http://127.0.0.1:5500`.

### Option 2: Using Python Simple HTTP Server
Open PowerShell or Terminal in the project root and run:
```bash
# Python 3.x
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option 3: Using Node.js `npx serve`
```bash
npx serve .
```

---

## ⚡ Performance, SEO & Accessibility

* **Lighthouse Score**: Optimized for 95+ scores in Performance, Accessibility, Best Practices, and SEO.
* **Zero Layout Shift (CLS)**: Explicit image aspect ratios and skeleton loader placeholders ensure zero cumulative layout shift during image or video feed loading.
* **Semantic HTML5**: Full compliance with `<header>`, `<main>`, `<article>`, `<aside>`, `<nav>`, and `<footer>` tags for optimal screen reader support.
* **Structured Data**: JSON-LD educational metadata embedded for Google Search rich snippets.
* **Print Styling (`@media print`)**: Dedicated print stylesheets automatically hide navigation headers, footers, and interactive buttons to produce clean, paper-ready question papers.

---

## 🤝 Contributing & Content Guidelines

We warmly welcome contributions from educators, developers, and students across Nepal!

### Adding New Question Bank Datasets
1. Review the universal schema in [`data/question-bank/schema.md`](file:///c:/Users/Om%20Raut/Documents/GitHub/LearnNepal/data/question-bank/schema.md).
2. Create or update the relevant JSON file in `data/question-bank/`.
3. Validate question numbers, group totals, mark allocations, and correct answer keys.
4. Test locally using the Question Bank viewer at `pages/question-bank/index.html`.

### Adding New Textbook Chapters
1. Copy `pages/chapter_view.html` to the target grade and subject folder (e.g., `pages/class-12/english/`).
2. Populate the chapter text, exercises, and vocabulary callouts following the modular design system in `styles/content.css`.
3. Update the global search index in `scripts/search.js` so students can discover the new chapter instantly via `Ctrl+K`.

---

## 📄 License & Acknowledgments

* **Platform Code & Infrastructure**: Released under the open-access [MIT License](./LICENSE).
* **Curriculum & Past Questions**: Sourced and structured according to the official curriculum frameworks published by the **Curriculum Development Centre (CDC)** and the **National Examinations Board (NEB)** of Nepal.
* **Maintainer**: Gopal Gautam & the LearnNepal Open Education Community.

---

<div align="center">
  <sub>Built with ❤️ for every student across Nepal. Learn freely. Excel boldly.</sub>
</div>
