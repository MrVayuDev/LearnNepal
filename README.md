# LearnNepal — Academic Learning Platform

## Project Overview

**LearnNepal** is an open-access, high-performance educational platform designed for high school and higher secondary students in Nepal. It provides free, structured chapter notes, syllabus breakdowns, verified exercise solutions, and solved National Examinations Board (NEB) past question banks for **Class 10 (SEE)**, **Class 11**, and **Class 12**.

The project is built on a **static-first, mobile-optimized architecture** using native HTML5, modular CSS3 design tokens, and modular ES JavaScript. It runs smoothly on any device without framework bundle overhead or build step requirements, making it instant to load and easy to deploy.

---

## Key Features

- **Grade Portals (Class 10, 11, 12)**: Dedicated hubs for SEE Optional Mathematics, as well as Class 11 & 12 English, Nepali, and Computer Science streams.
- **Interactive Question Bank**: Real-time solved past exam question viewer with subject filtering (`Computer`, `English`, `Nepali`), year selection (`2080`, `2081`, `2082`), and accordion solutions.
- **Global Instant Search (`Ctrl+K`)**: Keyboard-accessible modal search dialog for rapid navigation across all subjects and chapter notes.
- **Integrated PDF Document Viewer**: Embedded canvas rendering engine (`PDF.js`) with a service worker (`vault-worker.js`) proxy for Class 10 Optional Mathematics notes.
- **Bilingual Devanagari Typography**: Full support for native Devanagari script reading powered by Google Fonts Mukta.
- **Automated YouTube Integration**: Polling integration fetching and displaying official tutorial video lessons without backend server overhead.
- **Mobile-First Responsive Navigation**: Touch-optimized side drawer navigation and smooth momentum scrolling via Lenis.

---

## Project Structure

```text
LearnNepal/
├── assets/                  # Design system assets (branding, fonts, SVG graphics)
│   ├── fonts/
│   └── images/              # Logo, author image, and SVG feature illustrations
├── data/                    # JSON datasets for Question Bank and YouTube feed
│   ├── latest-video.json
│   └── question-bank/       # Computer, English, and Nepali question datasets
├── pages/                   # Subject portals, lesson modules & question banks
│   ├── chapter_view.html    # Chapter layout template
│   ├── courses.html         # Course directory dashboard
│   ├── class-10/
│   │   └── opt-math/        # Optional Math portal, PDF viewer & service worker
│   ├── class-11/            # Grade 11 subject & syllabus pages
│   └── class-12/            # Grade 12 subject, syllabus & Question Bank hubs
├── scripts/                 # Core client-side runtime JavaScript
│   ├── app.js               # Main application initializer
│   ├── latest-video-section.js # Homepage YouTube video feed loader
│   ├── popup.js             # Modal / announcement popup handler
│   ├── question-bank.js     # Solved Question Bank filter engine
│   ├── search.js            # Global Ctrl+K search dialog
│   ├── theme.js             # Light theme lock & storage key cleanup
│   ├── transitions.js       # Smooth scroll (Lenis) & mobile menu toggle
│   └── tools/               # One-shot build, migration & maintenance scripts
├── styles/                  # Modular CSS design system (@import manifest in main.css)
│   ├── main.css             # Stylesheet entry point
│   ├── variables.css        # Design tokens (colors, fonts, radii, spacing)
│   ├── reset.css            # Baseline CSS resets
│   ├── typography.css       # Typography rules & Devanagari font scaling
│   ├── layout.css           # Header, footer, container grid rules
│   ├── components.css       # Buttons, cards, badges, modal, form styles
│   ├── homepage.css         # Hero, bento grid, steps & CTA section rules
│   ├── content.css          # Chapter reading view & sidebar navigation
│   ├── question-bank.css    # Question Bank filter panel & accordion styles
│   ├── responsive.css       # Centralized media query breakpoints
│   ├── animations.css       # Micro-interactions & keyframes
│   ├── loader.css           # Skeleton & spinner utilities
│   └── popup.css            # Announcement popup styles
├── about.html               # About LearnNepal page
├── contact.html             # Contact Us page
├── index.html               # Homepage portal
├── privacy.html             # Privacy policy page
└── README.md                # Technical overview & project guide
```

---

## Detailed File Breakdown

### Root Pages

- `index.html` — Homepage featuring hero section, trust stats, bento grid, YouTube feed, how-it-works steps, and CTA section.
- `about.html` — About LearnNepal story, mission, core values, and educator profiles.
- `contact.html` — Contact and inquiry form with interactive support cards.
- `privacy.html` — Plain-language privacy terms and data safety information.

### Assets & Datasets

- `assets/images/logo.png` — LearnNepal brand logo.
- `assets/images/author_gopal.png` — Profile portrait asset.
- `assets/images/feat-fast.svg`, `feat-curriculum.svg`, `feat-bilingual.svg` — Feature grid SVG illustrations.
- `data/question-bank/computer.json` — Solved Computer Science board questions dataset.
- `data/question-bank/english.json` — Solved English board questions dataset.
- `data/question-bank/nepali.json` — Solved Nepali board questions dataset.

### Client-Side Runtime Scripts (`scripts/`)

- `scripts/app.js` — Application core bootstrap and component orchestrator.
- `scripts/theme.js` — Light mode enforcer and legacy storage cleanup.
- `scripts/transitions.js` — Lenis smooth scroll engine, navbar scroll state, and back-to-top floating button handler.
- `scripts/search.js` — Instant modal search (`Ctrl+K`) logic and index matcher.
- `scripts/question-bank.js` — Interactive filter engine for Question Bank subject/year selections.
- `scripts/latest-video-section.js` — YouTube feed loader and video grid renderer.
- `scripts/popup.js` — Announcement popup modal controller.

### Modular Stylesheet System (`styles/`)

- `styles/main.css` — Global CSS entry point importing all design system layers.
- `styles/variables.css` — Design system tokens (`--primary`, `--space-*`, `--radius-*`, `--font-*`).
- `styles/reset.css` — Modern reset and box-sizing normalizations.
- `styles/typography.css` — Headings, body text, and Devanagari typography.
- `styles/layout.css` — Fixed header, footer, and container rules.
- `styles/components.css` — Reusable buttons (`.btn-primary`, `.btn-yt`), cards, badges, and forms.
- `styles/homepage.css` — Homepage layout, hero grid, and `.home-cta-section`.
- `styles/content.css` — Reading view sidebar, breadcrumbs, and chapter content blocks.
- `styles/question-bank.css` — Solved Question Bank layout, filter panel, and solution accordions.
- `styles/responsive.css` — Mobile (`320px-480px`), tablet (`481px-768px`), and laptop breakpoints.

---

## How to Use & Develop

1. **Run Locally**: Open `index.html` directly in any web browser, or launch using any static HTTP server (e.g. VS Code Live Server or `python -m http.server 8000`).
2. **Global Search**: Press `Ctrl + K` or click the search button in the header to open instant modal search.
3. **Question Bank**: Navigate to **Question Bank** to filter solved questions by subject (`Computer`, `English`, `Nepali`) or year (`2080`, `2081`, `2082`).
4. **PDF Viewer**: Access **Class 10 Opt Math** solutions to view embedded canvas PDF documents.

---

## Architectural Principles

- **Zero-Build Deployment**: Runs natively on standard web browsers with static file hosting (Vercel, Netlify, GitHub Pages).
- **High Performance & Accessibility**: Optimized for low-bandwidth mobile networks with fast First Contentful Paint.
- **Maintainable Design System**: CSS custom properties and semantic HTML5 markup ensure clean code readability.

---

## Detailed Summary

LearnNepal is a self-contained, high-performance educational platform for NEB students in Nepal. It combines clean static frontend architecture, modular CSS design tokens, interactive solved question banks, and an embedded PDF viewer into an accessible, fast-loading digital learning environment.
