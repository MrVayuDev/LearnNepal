/**
 * Application Bootstrapper — Enterprise PDF Viewer
 *
 * Wires together:
 * - Security guards (DOM protections)
 * - Service worker registration (secure PDF vault)
 * - Virtual-viewport PDF engine with canvas pooling
 * - Search controller with text extraction
 * - Keyboard navigation system
 * - Premium toolbar with navigation, zoom, and actions
 * - Sidebar accordion with chapter/exercise navigation
 * - Deep-linking via URL parameters
 * - Fullscreen mode
 * - Responsive behavior
 *
 * NOTE: pdfjsLib is loaded as a global <script> tag in viewer.html.
 */
import { initializeSecurityGuards } from './security.js';
import { SecurePDFEngine } from '../modules/pdf-engine.js';
import { SearchController } from '../modules/search-controller.js';
import { KeyboardController } from '../modules/keyboard-controller.js';
import { ThumbnailController } from '../modules/thumbnail-controller.js';
import { StateManager } from '../modules/state-manager.js';
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
      await navigator.serviceWorker.register('./vault-worker.js', { scope: './' });
    } catch (err) {
      console.warn('[Vault] Service worker registration failed:', err);
    }
  }

  // ── DOM References ────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  // Sidebar
  const sidebar = $('viewer-sidebar');
  const sidebarOverlay = $('sidebar-overlay');
  const sidebarToggleBtn = $('sidebar-toggle-btn');
  const sidebarCloseBtn = $('sidebar-close-btn');
  const navContainer = $('lessons-nav');

  // Toolbar
  const toolbarPageCurrent = $('toolbar-page-current');
  const toolbarPageTotal = $('toolbar-page-total');
  const toolbarPageInput = $('toolbar-page-input');
  const toolbarZoomLevel = $('toolbar-zoom-level');
  const toolbarPrevPage = $('toolbar-prev-page');
  const toolbarNextPage = $('toolbar-next-page');
  const toolbarZoomIn = $('toolbar-zoom-in');
  const toolbarZoomOut = $('toolbar-zoom-out');
  const toolbarFitWidth = $('toolbar-fit-width');
  const toolbarFitPage = $('toolbar-fit-page');
  const toolbarSearchBtn = $('toolbar-search-btn');
  const toolbarFullscreenBtn = $('toolbar-fullscreen-btn');
  const toolbarDownloadBtn = $('toolbar-download-btn');
  const toolbarPrintBtn = $('toolbar-print-btn');
  const toolbarShortcutsBtn = $('toolbar-shortcuts-btn');

  // Search bar
  const searchBar = $('search-bar');
  const searchInput = $('search-input');
  const searchMatchCount = $('search-match-count');
  const searchPrev = $('search-prev');
  const searchNext = $('search-next');
  const searchClose = $('search-close');
  const searchCaseSensitive = $('search-case-sensitive');

  // Title ribbon
  const chapterTitle = $('active-chapter-title');
  const exerciseTitle = $('active-exercise-title');

  // Toolbar container
  const toolbar = $('viewer-toolbar');
  const viewerWorkspace = $('viewer-workspace') || document.querySelector('.viewer-workspace');

  // ── Initialize State Manager ──────────────────────────────
  const stateManager = new StateManager();

  // ── Initialize PDF Engine ─────────────────────────────────
  const engine = new SecurePDFEngine('pdf-stage');

  // ── Initialize Search Controller ──────────────────────────
  const searchCtrl = new SearchController(engine, {
    searchBar,
    searchInput,
    matchCount: searchMatchCount,
    prevBtn: searchPrev,
    nextBtn: searchNext,
    closeBtn: searchClose,
    caseSensitiveBtn: searchCaseSensitive
  });

  // ── State ─────────────────────────────────────────────────
  let isFullscreen = false;
  let currentPdfUrl = null;

  // ── Engine Callbacks ──────────────────────────────────────
  engine.onPageChange = (page, total) => {
    if (toolbarPageCurrent) toolbarPageCurrent.textContent = page;
    if (toolbarPageInput) toolbarPageInput.value = page;
    if (toolbarPageTotal) toolbarPageTotal.textContent = total;
    
    // Save state
    if (currentPdfUrl) {
      stateManager.saveDocumentState(currentPdfUrl, page, engine.getCurrentScale());
    }
  };

  engine.onRenderComplete = () => {
    updateZoomDisplay();
    // Save state
    if (currentPdfUrl) {
      stateManager.saveDocumentState(currentPdfUrl, engine.getCurrentPage(), engine.getCurrentScale());
    }
  };

  engine.onDocumentLoaded = ({ totalPages }) => {
    if (toolbarPageTotal) toolbarPageTotal.textContent = totalPages;
    if (toolbar) toolbar.classList.add('active');
    
    // Restore state if available
    const savedState = stateManager.getDocumentState(currentPdfUrl);
    if (savedState) {
      // Restore scale first to avoid unnecessary re-renders
      if (savedState.scale && Math.abs(savedState.scale - engine.getCurrentScale()) > 0.01) {
        // Private method access for initial restore without animation
        engine.currentScale = savedState.scale * engine.baseScale; 
      }
      
      // Update UI
      if (toolbarPageCurrent) toolbarPageCurrent.textContent = savedState.page;
      if (toolbarPageInput) {
        toolbarPageInput.value = savedState.page;
        toolbarPageInput.max = totalPages;
      }
      
      // Navigate to saved page
      setTimeout(() => {
        engine.goToPage(savedState.page);
        updateZoomDisplay();
      }, 100); // Small delay to let initial render settle
      
    } else {
      // Default state
      if (toolbarPageCurrent) toolbarPageCurrent.textContent = '1';
      if (toolbarPageInput) {
        toolbarPageInput.value = '1';
        toolbarPageInput.max = totalPages;
      }
      updateZoomDisplay();
    }
  };

  engine.onLoadProgress = ({ phase, progress }) => {
    const progressBar = document.getElementById('pdf-load-progress');
    const loadingText = document.querySelector('.viewer-loading-text');

    if (progressBar) {
      const percent = Math.round(progress * 100);
      progressBar.style.width = `${percent}%`;
    }

    if (loadingText) {
      const messages = {
        download: 'Downloading document…',
        parsing: 'Preparing pages…',
        rendering: 'Rendering content…',
        complete: 'Almost ready…'
      };
      loadingText.textContent = messages[phase] || 'Loading…';
    }
  };

  // ── Toolbar Actions ───────────────────────────────────────
  function updateZoomDisplay() {
    if (toolbarZoomLevel) {
      toolbarZoomLevel.textContent = Math.round(engine.getCurrentScale() * 100) + '%';
    }
  }

  function toggleFullscreen() {
    if (!viewerWorkspace) return;

    if (!isFullscreen) {
      if (viewerWorkspace.requestFullscreen) {
        viewerWorkspace.requestFullscreen();
      } else if (viewerWorkspace.webkitRequestFullscreen) {
        viewerWorkspace.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    if (toolbarFullscreenBtn) {
      toolbarFullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
      toolbarFullscreenBtn.classList.toggle('is-fullscreen', isFullscreen);
    }
    if (viewerWorkspace) {
      viewerWorkspace.classList.toggle('is-fullscreen', isFullscreen);
    }
  });

  // Toolbar button handlers
  if (toolbarPrevPage) toolbarPrevPage.addEventListener('click', () => engine.previousPage());
  if (toolbarNextPage) toolbarNextPage.addEventListener('click', () => engine.nextPage());
  if (toolbarZoomIn) toolbarZoomIn.addEventListener('click', () => { engine.zoomIn(); updateZoomDisplay(); });
  if (toolbarZoomOut) toolbarZoomOut.addEventListener('click', () => { engine.zoomOut(); updateZoomDisplay(); });
  if (toolbarFitWidth) toolbarFitWidth.addEventListener('click', () => { engine.fitToWidth(); updateZoomDisplay(); });
  if (toolbarFitPage) toolbarFitPage.addEventListener('click', () => { engine.fitToPage(); updateZoomDisplay(); });
  if (toolbarSearchBtn) toolbarSearchBtn.addEventListener('click', () => searchCtrl.toggle());
  if (toolbarFullscreenBtn) toolbarFullscreenBtn.addEventListener('click', toggleFullscreen);
  if (toolbarShortcutsBtn) toolbarShortcutsBtn.addEventListener('click', () => keyboardCtrl.toggleOverlay());

  // Presentation Mode
  const toolbarPresentationBtn = $('toolbar-presentation-btn');
  const presentationPrev = $('presentation-prev');
  const presentationNext = $('presentation-next');
  const presentationExit = $('presentation-exit');
  const presentationPageCurrent = $('presentation-page-current');
  const presentationPageTotal = $('presentation-page-total');
  
  let isPresentationMode = false;

  function enterPresentationMode() {
    isPresentationMode = true;
    document.body.classList.add('is-presentation-mode');
    
    // Attempt fullscreen if supported
    if (!isFullscreen) toggleFullscreen();
    
    // Fit to page
    engine.fitToPage();
    updateZoomDisplay();

    // Close sidebar
    if (!sidebar.classList.contains('collapsed')) {
      sidebar.classList.add('collapsed');
    }
    
    // Close search
    searchCtrl.close();
    
    // Update presentation overlay
    if (presentationPageTotal) presentationPageTotal.textContent = engine.getTotalPages();
    if (presentationPageCurrent) presentationPageCurrent.textContent = engine.getCurrentPage();
  }

  function exitPresentationMode() {
    isPresentationMode = false;
    document.body.classList.remove('is-presentation-mode');
    
    if (isFullscreen) toggleFullscreen();
    
    // Re-fit to width for normal reading
    engine.fitToWidth();
    updateZoomDisplay();
  }

  // Bind presentation buttons
  if (toolbarPresentationBtn) toolbarPresentationBtn.addEventListener('click', enterPresentationMode);
  if (presentationExit) presentationExit.addEventListener('click', exitPresentationMode);
  if (presentationPrev) presentationPrev.addEventListener('click', () => engine.previousPage());
  if (presentationNext) presentationNext.addEventListener('click', () => engine.nextPage());

  // Hook into engine's onPageChange to update presentation overlay
  const originalOnPageChangeForPresentation = engine.onPageChange;
  engine.onPageChange = (page, total) => {
    if (originalOnPageChangeForPresentation) originalOnPageChangeForPresentation(page, total);
    if (presentationPageCurrent) presentationPageCurrent.textContent = page;
  };

  // Page input navigation
  if (toolbarPageInput) {
    toolbarPageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const page = parseInt(toolbarPageInput.value, 10);
        if (page >= 1 && page <= engine.getTotalPages()) {
          engine.goToPage(page);
        } else {
          toolbarPageInput.value = engine.getCurrentPage();
        }
        toolbarPageInput.blur();
      }
    });

    toolbarPageInput.addEventListener('blur', () => {
      toolbarPageInput.value = engine.getCurrentPage();
    });
  }

  // Download button
  if (toolbarDownloadBtn) {
    toolbarDownloadBtn.addEventListener('click', () => {
      if (currentPdfUrl) {
        const a = document.createElement('a');
        a.href = `assets/secure-pdfs/${currentPdfUrl}`;
        a.download = currentPdfUrl;
        a.click();
      }
    });
  }

  // Print button
  if (toolbarPrintBtn) {
    toolbarPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ── Keyboard Controller ───────────────────────────────────
  const keyboardCtrl = new KeyboardController({
    previousPage: () => engine.previousPage(),
    nextPage: () => engine.nextPage(),
    goToPage: (p) => engine.goToPage(p),
    goToLastPage: () => engine.goToPage(engine.getTotalPages()),
    zoomIn: () => { engine.zoomIn(); updateZoomDisplay(); },
    zoomOut: () => { engine.zoomOut(); updateZoomDisplay(); },
    fitToWidth: () => { engine.fitToWidth(); updateZoomDisplay(); },
    openSearch: () => searchCtrl.open(),
    escape: () => {
      if (searchCtrl.isOpen) {
        searchCtrl.close();
      } else if (isPresentationMode) {
        exitPresentationMode();
      } else if (isFullscreen) {
        toggleFullscreen();
      }
    },
    toggleFullscreen
  });

  // ── Thumbnail Controller ──────────────────────────────────
  // Import dynamically to avoid top-level await issues if needed, or assume it's imported at top
  // For now we'll import it at the top of the file
  
  const thumbnailCtrl = new ThumbnailController(engine, {
    container: $('thumbnails-container')
  });

  // Wire up engine events to thumbnail controller
  const originalOnPageChange = engine.onPageChange;
  engine.onPageChange = (page, total) => {
    if (originalOnPageChange) originalOnPageChange(page, total);
    thumbnailCtrl.updateActivePage(page);
  };

  const originalOnDocumentLoaded = engine.onDocumentLoaded;
  engine.onDocumentLoaded = (data) => {
    if (originalOnDocumentLoaded) originalOnDocumentLoaded(data);
    
    // Only build thumbnails if the thumbnail tab is open, otherwise lazy load
    if (thumbnailCtrl.isOpen) {
      thumbnailCtrl.buildThumbnails();
    }
  };

  // ── Sidebar Tabs Logic ────────────────────────────────────
  const tabLessons = $('tab-lessons');
  const tabThumbnails = $('tab-thumbnails');
  const navLessons = $('lessons-nav');
  const navThumbnails = $('thumbnails-nav');

  function switchTab(tabId) {
    stateManager.savePreference('activeTab', tabId);

    if (tabId === 'lessons') {
      tabLessons.classList.add('active');
      tabThumbnails.classList.remove('active');
      navLessons.classList.add('active');
      navThumbnails.classList.remove('active');
      thumbnailCtrl.close();
    } else if (tabId === 'thumbnails') {
      tabThumbnails.classList.add('active');
      tabLessons.classList.remove('active');
      navThumbnails.classList.add('active');
      navLessons.classList.remove('active');
      
      thumbnailCtrl.open();
      
      // If thumbnails haven't been built yet for this document, build them now
      if (thumbnailCtrl.thumbnails.size === 0 && engine.pdfDocument) {
        thumbnailCtrl.buildThumbnails();
      }
    }
  }

  if (tabLessons) tabLessons.addEventListener('click', () => switchTab('lessons'));
  if (tabThumbnails) tabThumbnails.addEventListener('click', () => switchTab('thumbnails'));

  // Restore tab state
  const savedTab = stateManager.getPreference('activeTab', 'lessons');
  switchTab(savedTab);

  // ── Sidebar Logic ─────────────────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const initialChapter = urlParams.get('chapter');
  const initialExercise = urlParams.get('exercise');

  buildSyllabusMenu(
    OPT_MATH_COURSE,
    navContainer,
    (selectedPayload) => {
      chapterTitle.innerText = selectedPayload.chapterTitle;
      exerciseTitle.innerText = selectedPayload.exerciseName;
      currentPdfUrl = selectedPayload.pdfUrl;

      // Clear old thumbnails before loading new doc
      thumbnailCtrl.destroy();

      engine.renderDocument(selectedPayload.pdfUrl);

      // Close search on new document
      searchCtrl.close();

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

  // Sidebar toggle logic
  function openSidebar() {
    sidebar.classList.remove('collapsed');
    document.body.classList.add('viewer-sidebar-open');
  }

  function closeSidebar() {
    if (window.innerWidth <= 900) {
      document.body.classList.remove('viewer-sidebar-open');
    } else {
      sidebar.classList.add('collapsed');
    }
  }

  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => {
    document.body.classList.remove('viewer-sidebar-open');
  });
});
