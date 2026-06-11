# LearnNepal

## Project Overview

LearnNepal is a static educational website built for NEB Class 10, Class 11, and Class 12 students in Nepal. The project provides structured notes, subject guides, question banks, and exam preparation material for Class 10 Optional Mathematics, and Class 11 & Class 12 English, Nepali, and Computer Science.

The site is built using plain HTML, CSS, and JavaScript. It is designed to be lightweight, responsive, and easy to open directly in a browser without a build step.

## Key Features

- **Responsive Landing Page:** Dynamic homepage featuring navigation, course boards, site search, and theme toggle.
- **Grade portals (Class 10, 11, 12):** Access portals covering Optional Mathematics, English, Nepali, and Computer Science.
- **Syllabus & Chapter Modules:** Structured chapter pages with summaries, guides, and exercise solutions.
- **Interactive Question Bank:** Filtering and viewing tools for past NEB exam questions populated from JSON datasets.
- **Secure Document Viewer:** Custom PDF viewer using canvas rendering (PDF.js) backed by a service worker proxy to prevent direct URL downloads.
- **Bilingual Support & Access:** Full support for Devanagari script typography and a dark mode toggle.
- **Offline Reliability:** Network connection detection with custom status alerts.
- **Automated YouTube Notifications:** A zero-cost GitHub Action automatically polls the YouTube RSS feed hourly and updates the site via a static JSON file, triggering a frontend popup for new videos without any backend server.

## Project Structure

```text
.
├── assets/                  # Core design system assets (images, fonts)
├── data/                    # JSON datasets (e.g., Question Bank)
├── pages/                   # Subject portals and lesson modules
│   ├── class-10/
│   │   └── opt-math/        # Optional Math course hub & secure viewer
│   ├── class-11/            # Grade XI course index pages
│   ├── class-12/            # Grade XII course index & Question Bank
│   ├── chapter_view.html
│   └── courses.html
├── scripts/                 # Core JavaScript logic & modular scripts
├── styles/                  # Theme styling, layout, components
├── index.html               # Main landing page
├── about.html               # About page
├── contact.html             # Contact page
├── privacy.html             # Privacy policy page
└── README.md                # Project documentation
```

## File and Folder Breakdown

### Root files

- `about.html` — About Us information page
- `contact.html` — Contact and query page
- `index.html` — Main website homepage
- `privacy.html` — Website privacy policy page
- `README.md` — Project overview and file breakdown documentation

### Assets

- `assets/fonts/RozhaOne-Regular.ttf` — Custom display font
- `assets/images/author_gopal.png` — Profile asset image
- `assets/images/logo.png` — Logo branding image

### Data

- `data/question-bank/computer.json` — Computer Science question bank dataset
- `data/question-bank/english.json` — English question bank dataset
- `data/question-bank/nepali.json` — Nepali question bank dataset

### Pages

- `pages/chapter_view.html` — General chapter notes layout template
- `pages/class-10/opt-math/index.html` — Class 10 Optional Mathematics chapter directory
- `pages/class-10/opt-math/viewer.html` — Secure exercise solution viewer
- `pages/class-10/opt-math/vault-worker.js` — Service worker protecting PDF files
- `pages/class-10/opt-math/js/core/app.js` — Application bootstrap script for the viewer
- `pages/class-10/opt-math/js/data/course-schema.js` — Class 10 Optional Math curriculum schema
- `pages/class-10/opt-math/js/modules/pdf-engine.js` — PDF rendering canvas engine
- `pages/class-10/opt-math/js/modules/ui-controller.js` — Sidebar accordion UI controller
- `pages/class-11/computer/c11_computer_chapter_1.html` — Class 11 Computer Chapter 1 content
- `pages/class-11/computer/c11_computer_chapter_2.html` — Class 11 Computer Chapter 2 content
- `pages/class-11/computer/c11_computer_syllabus.html` — Class 11 Computer course syllabus
- `pages/class-11/english.html` — Class 11 English portal page
- `pages/class-11/nepali.html` — Class 11 Nepali portal page
- `pages/class-12/computer/c12_computer_chapter_1.html` — Class 12 Computer Chapter 1 content
- `pages/class-12/computer/c12_computer_chapter_2.html` — Class 12 Computer Chapter 2 content
- `pages/class-12/computer/c12_computer_syllabus.html` — Class 12 Computer course syllabus
- `pages/class-12/english/c12_english_2083_solutions.html` — Class 12 English exam solutions
- `pages/class-12/english/c12_english_story_1.html` — Class 12 English unit story content page
- `pages/class-12/english/c12_english_syllabus.html` — Class 12 English course syllabus
- `pages/class-12/english/c12_english_unit_1.html` — Class 12 English unit notes page
- `pages/class-12/nepali.html` — Class 12 Nepali portal page
- `pages/class-12/nepali/c12_nepali_chapter_1.html` — Class 12 Nepali Chapter 1 content page
- `pages/class-12/nepali/c12_nepali_chapter_9.html` — Class 12 Nepali Chapter 9 content page
- `pages/class-12/question-bank/index.html` — Question bank dashboard page
- `pages/class-12/question-bank/computer/index.html` — Computer Science question bank page
- `pages/class-12/question-bank/english/index.html` — English question bank page
- `pages/class-12/question-bank/nepali/index.html` — Nepali question bank page
- `pages/courses.html` — Main courses list page

### Scripts

- `scripts/app.js` — Core UI interactions, mobile menu, offline detection, sidebar accordion, sticky header
- `scripts/question-bank.js` — Question bank handling and loading JSON data
- `scripts/search.js` — Search interface and filtering logic
- `scripts/theme.js` — Theme switching and persistence
- `scripts/transitions.js` — Page transitions, header scroll state, back-to-top button behavior

### Styles

- `styles/animations.css` — Animations and motion utility styles
- `styles/components.css` — UI components like cards, buttons, dropdowns, navigation
- `styles/courses.css` — Course listing and subject cards styles
- `styles/homepage.css` — Styles specific to the homepage and hero sections
- `styles/layout.css` — Layout grid, spacing, responsive rules
- `styles/loader.css` — Loader and splash screen styles
- `styles/main.css` — Main global styles, utilities, buttons, containers
- `styles/offline.css` — Offline overlay styles
- `styles/question-bank.css` — Question bank UI styling
- `styles/reset.css` — CSS reset rules
- `styles/typography.css` — Font and text styling
- `styles/variables.css` — CSS custom properties and theme variables

## How to Use

1. Open `index.html` directly in a browser (or run via a simple local static server).
2. Use the navigation links to browse subject lists, search notes, or view past questions.
3. Toggle between dark and light themes using the theme icon button in the header.
4. Interact with the PDF guides securely inside the exercise viewer page.

## Notes

- This is a static frontend project that runs entirely client-side. No backend databases or build tools are required.
- The `vault-worker.js` service worker intercepts requests for PDF resources to ensure they are fetched only from inside the application frame.

## Summary

LearnNepal is a self-contained learning site for NEB students, focused on Class 10, Class 11, and Class 12 notes, exam preparation, and structured course material. It is implemented with static front-end files for easy deployment and fast access.
