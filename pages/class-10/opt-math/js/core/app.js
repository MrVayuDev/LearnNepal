/**
 * Application Bootstrapper — Viewer Page
 * 
 * Wires together:
 * - Security guards (DOM protections)
 * - Service worker registration (network proxy vault)
 * - PDF.js canvas engine with zoom support
 * - Sidebar accordion + toggle
 * - URL parameter handling for deep-linking
 * 
 * NOTE: pdfjsLib is loaded as a global <script> tag in viewer.html,
 * so we access it via `window.pdfjsLib` — NOT via ES module import.
 */
import { initializeSecurityGuards } from './security.js';
import { SecurePDFEngine } from '../modules/pdf-engine.js';
import { buildSyllabusMenu } from '../modules/ui-controller.js';
import { OPT_MATH_COURSE } from '../data/course-schema.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ── Activate security guards ──────────────────────────────
  initializeSecurityGuards();

  // ── Register the service worker vault ─────────────────────
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./vault-worker.js', {
        scope: './'
      });
    } catch (err) {
      console.warn('[Vault] Service worker registration failed:', err);
    }
  }

  // ── Initialize the PDF canvas engine ──────────────────────
  const canvasEngine = new SecurePDFEngine('pdf-stage');

  // ── Build the sidebar accordion ───────────────────────────
  const navContainer = document.getElementById('lessons-nav');
  const sidebar = document.getElementById('viewer-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const zoomToolbar = document.getElementById('zoom-toolbar');
  const zoomLevelDisplay = document.getElementById('zoom-level-display');

  // Parse URL parameters for deep-linking
  const urlParams = new URLSearchParams(window.location.search);
  const initialChapter = urlParams.get('chapter');
  const initialExercise = urlParams.get('exercise');

  buildSyllabusMenu(
    OPT_MATH_COURSE,
    navContainer,
    (selectedPayload) => {
      document.getElementById('active-chapter-title').innerText = selectedPayload.chapterTitle;
      document.getElementById('active-exercise-title').innerText = selectedPayload.exerciseName;
      canvasEngine.renderDocument(selectedPayload.pdfUrl);

      // Show zoom toolbar once a document is loaded
      if (zoomToolbar) zoomToolbar.style.display = 'flex';

      // Update page title
      document.title = `${selectedPayload.exerciseName} — Class 10 Opt. Math | LearnNepal`;

      // Update URL without reloading
      const newUrl = `viewer.html?chapter=${selectedPayload.chapterId}&exercise=${selectedPayload.exerciseId}`;
      history.replaceState(null, '', newUrl);

      // Close mobile sidebar on selection
      document.body.classList.remove('viewer-sidebar-open');
    },
    { initialChapter, initialExercise }
  );

  // ── Sidebar toggle logic ──────────────────────────────────
  function openSidebar() {
    sidebar.classList.remove('collapsed');
    document.body.classList.add('viewer-sidebar-open');
  }

  function closeSidebar() {
    // On mobile, just remove the open class
    if (window.innerWidth <= 900) {
      document.body.classList.remove('viewer-sidebar-open');
    } else {
      sidebar.classList.add('collapsed');
    }
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', openSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      document.body.classList.remove('viewer-sidebar-open');
    });
  }

  // ── Zoom controls ─────────────────────────────────────────
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomFitBtn = document.getElementById('zoom-fit-btn');

  function updateZoomDisplay() {
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = Math.round(canvasEngine.getCurrentScale() * 100) + '%';
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      canvasEngine.zoomIn();
      updateZoomDisplay();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      canvasEngine.zoomOut();
      updateZoomDisplay();
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', () => {
      canvasEngine.fitToWidth();
      updateZoomDisplay();
    });
  }

  // Update zoom display after PDF renders
  canvasEngine.onRenderComplete = updateZoomDisplay;
});
