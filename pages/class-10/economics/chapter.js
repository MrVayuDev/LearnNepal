/**
 * LearnNepal — Class 10 Economics Chapter Experience JS
 */

document.addEventListener('DOMContentLoaded', function () {
  // Reading Progress Bar
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      const el = document.documentElement;
      const scrollTotal = el.scrollHeight - el.clientHeight;
      const scrollProgress = scrollTotal > 0 ? (el.scrollTop / scrollTotal) * 100 : 0;
      progressBar.style.width = Math.min(scrollProgress, 100) + '%';
    }, { passive: true });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Sidebar Accordion for Units
  const unitHeaders = document.querySelectorAll('.sidebar-unit-header');
  unitHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      const parentUnit = header.closest('.sidebar-unit-item');
      if (parentUnit) {
        parentUnit.classList.toggle('open');
      }
    });
  });

  // Mobile Sidebar Drawer
  const mobileToggleBtn = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('chapterSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', openMobileSidebar);
  }
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Toast Notification helper
  window.showToast = function (message) {
    let toast = document.getElementById('chapterToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'chapterToast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  };

  // Copy Page Link
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        window.showToast('लिंक कपी भयो! (Link copied!)');
      }).catch(function () {
        window.showToast('लिंक कपी हुन सकेन');
      });
    });
  }

  // Font Size Adjuster — uses a scale factor stored as a CSS variable
  // Targets reading content only (body text, answers, objectives, etc.)
  const contentMain = document.getElementById('main-content');
  const btnFontDec = document.getElementById('btnFontDec');
  const btnFontInc = document.getElementById('btnFontInc');

  // Scale steps: 6 levels from small to large (index 3 = default 1.0×)
  const FONT_SCALES = [0.82, 0.90, 0.96, 1.0, 1.08, 1.16, 1.25];
  const DEFAULT_STEP = 3;
  const STORAGE_KEY = 'learnnepal-font-step';

  // Reading-content selectors that should scale
  var READING_SELECTORS = [
    '.content-body',
    '.qa-answer',
    '.qa-question',
    '.learning-objectives-list',
    '.chapter-subtitle',
    '.concept-box',
    '.formula-card',
    '.comparison-table td',
    '.comparison-table th'
  ].join(',');

  // Restore saved preference
  var fontStep = DEFAULT_STEP;
  try {
    var saved = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!isNaN(saved) && saved >= 0 && saved < FONT_SCALES.length) fontStep = saved;
  } catch(e) { /* localStorage unavailable */ }

  function applyFontScale(step) {
    fontStep = step;
    var scale = FONT_SCALES[step];
    if (!contentMain) return;

    // Apply scale to all reading-content elements
    var els = contentMain.querySelectorAll(READING_SELECTORS);
    els.forEach(function (el) {
      // Store original font-size on first run
      if (!el.dataset.origFs) {
        el.dataset.origFs = window.getComputedStyle(el).fontSize;
      }
      var origPx = parseFloat(el.dataset.origFs);
      el.style.fontSize = (origPx * scale) + 'px';
    });

    // Persist
    try { localStorage.setItem(STORAGE_KEY, step); } catch(e) {}
  }

  // Apply on load
  applyFontScale(fontStep);

  // Visual feedback helper — briefly pulses the button
  function pulseBtn(btn) {
    btn.style.transition = 'background 0.15s, color 0.15s, transform 0.15s';
    btn.style.background = 'var(--primary)';
    btn.style.color = 'white';
    btn.style.transform = 'scale(1.15)';
    setTimeout(function () {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.transform = '';
    }, 200);
  }

  if (btnFontDec && contentMain) {
    btnFontDec.addEventListener('click', function (e) {
      e.preventDefault();
      if (fontStep > 0) {
        applyFontScale(fontStep - 1);
        pulseBtn(btnFontDec);
        if (fontStep === DEFAULT_STEP) {
          window.showToast && window.showToast('Default font size restored');
        }
      } else {
        window.showToast && window.showToast('Minimum font size reached');
      }
    });

    // Double-click to reset
    btnFontDec.addEventListener('dblclick', function (e) {
      e.preventDefault();
      applyFontScale(DEFAULT_STEP);
      window.showToast && window.showToast('Font size reset to default');
    });
  }

  if (btnFontInc && contentMain) {
    btnFontInc.addEventListener('click', function (e) {
      e.preventDefault();
      if (fontStep < FONT_SCALES.length - 1) {
        applyFontScale(fontStep + 1);
        pulseBtn(btnFontInc);
      } else {
        window.showToast && window.showToast('Maximum font size reached');
      }
    });
  }

  // Copy Answer Helper
  window.copyAnswer = function (btn, questionId) {
    const card = btn.closest('.qa-card');
    if (!card) return;
    const answerEl = card.querySelector('.qa-answer');
    if (!answerEl) return;

    const answerText = answerEl.innerText || answerEl.textContent;
    navigator.clipboard.writeText(answerText.trim()).then(function () {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;color:green;">check</span> कपी भयो!';
      window.showToast('उत्तर कपी गरियो! (Answer copied!)');
      setTimeout(function () {
        btn.innerHTML = origHtml;
      }, 2000);
    });
  };

  // Toggle All Q&A
  const toggleAllQABtn = document.getElementById('toggleAllQABtn');
  let allQAExpanded = true;
  if (toggleAllQABtn) {
    toggleAllQABtn.addEventListener('click', function () {
      allQAExpanded = !allQAExpanded;
      const answers = document.querySelectorAll('.qa-answer');
      answers.forEach(function (ans) {
        ans.style.display = allQAExpanded ? 'block' : 'none';
      });
      toggleAllQABtn.innerHTML = allQAExpanded
        ? '<span class="material-symbols-outlined" style="font-size:16px;">unfold_less</span> सबै लुकाउनुहोस्'
        : '<span class="material-symbols-outlined" style="font-size:16px;">unfold_more</span> सबै देखाउनुहोस्';
    });
  }
});
