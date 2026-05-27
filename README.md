# LearnNepal

## Project Overview

LearnNepal is a static educational website built for NEB Class 11 and Class 12 students in Nepal. The project provides structured notes, subject guides, question banks, and exam preparation material for English, Nepali, and Computer Science.

The site is built using plain HTML, CSS, and JavaScript. It is designed to be lightweight, responsive, and easy to open directly in a browser without a build step.

## Key Features

- Landing page with navigation, subject cards, search, and theme toggle.
- Class 11 and Class 12 subject pages for English, Nepali, and Computer Science.
- Syllabus and chapter pages for computer science and English.
- Question bank support with JSON data for English, Nepali, and Computer Science.
- Offline detection overlay and mobile-friendly navigation.
- Simple theming with dark mode support.

## Project Structure

- `index.html` — Homepage
- `about.html` — About page
- `contact.html` — Contact page
- `privacy.html` — Privacy page
- `pages/` — Static content pages for chapters, courses, and subjects
- `assets/` — Fonts and image assets
- `data/` — Question bank JSON data
- `scripts/` — Client-side JavaScript functionality
- `styles/` — CSS stylesheets and layout rules
- `NEB_Grade_XII_English_Exam_2026.txt` — Exam paper content
- `NEB_Grade_XII_English_Exam_2026_Solutions.txt` — Solutions content

## File and Folder Breakdown

### Root files

- `index.html`
- `about.html`
- `contact.html`
- `privacy.html`
- `NEB_Grade_XII_English_Exam_2026.txt`
- `NEB_Grade_XII_English_Exam_2026_Solutions.txt`

### Assets

- `assets/fonts/RozhaOne-Regular.ttf`
- `assets/images/author_gopal.png`
- `assets/images/logo.png`

### Data

- `data/question-bank/computer.json`
- `data/question-bank/english.json`
- `data/question-bank/nepali.json`

### Pages

- `pages/chapter_view.html`
- `pages/courses.html`
- `pages/class-11/english.html`
- `pages/class-11/nepali.html`
- `pages/class-11/computer/c11_computer_chapter_1.html`
- `pages/class-11/computer/c11_computer_chapter_2.html`
- `pages/class-11/computer/c11_computer_syllabus.html`
- `pages/class-12/nepali.html`
- `pages/class-12/nepali/c12_nepali_chapter_1.html`
- `pages/class-12/nepali/c12_nepali_chapter_9.html`
- `pages/class-12/english/c12_english_syllabus.html`
- `pages/class-12/english/c12_english_unit_1.html`
- `pages/class-12/english/c12_english_story_1.html`
- `pages/class-12/english/c12_english_2083_solutions.html`
- `pages/class-12/computer/c12_computer_syllabus.html`
- `pages/class-12/computer/c12_computer_chapter_1.html`
- `pages/class-12/computer/c12_computer_chapter_2.html`
- `pages/class-12/question-bank/index.html`

### Scripts

- `scripts/app.js` — Core UI interactions, mobile menu, offline detection, sidebar accordion, sticky header
- `scripts/question-bank.js` — Question bank handling and loading JSON data
- `scripts/search.js` — Search interface and filtering logic
- `scripts/theme.js` — Theme switching and persistence
- `scripts/transitions.js` — Page transitions, header scroll state, back-to-top button behavior

### Styles

- `styles/main.css` — Main global styles, utilities, buttons, containers
- `styles/homepage.css` — Styles specific to the homepage and hero sections
- `styles/courses.css` — Course listing and subject cards styles
- `styles/layout.css` — Layout grid, spacing, responsive rules
- `styles/components.css` — UI components like cards, buttons, dropdowns, navigation
- `styles/animations.css` — Animations and motion utility styles
- `styles/loader.css` — Loader and splash screen styles
- `styles/offline.css` — Offline overlay styles
- `styles/question-bank.css` — Question bank UI styling
- `styles/reset.css` — CSS reset rules
- `styles/typography.css` — Font and text styling
- `styles/variables.css` — CSS custom properties and theme variables

## How to Use

1. Open `index.html` in a browser.
2. Navigate using the header links to class pages, subject pages, and the question bank.
3. Use the theme toggle button for light/dark mode switching.
4. Use the search button to search site content if available.

## Notes

- This is a static website with no backend or build tools required.
- The `data/question-bank/*.json` files are used to populate the question bank pages.
- The site relies on browser JavaScript for interactivity and offline detection.

## Summary

LearnNepal is a self-contained learning site for NEB students, focused on Class 11 and Class 12 notes, exam preparation, and structured course material. It is implemented with static front-end files for easy deployment and fast access.
