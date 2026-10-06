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

  // Font Size Adjuster
  const contentBody = document.querySelector('.content-body');
  const btnFontDec = document.getElementById('btnFontDec');
  const btnFontInc = document.getElementById('btnFontInc');
  let currentFontSize = 1.08;

  if (btnFontDec && contentBody) {
    btnFontDec.addEventListener('click', function () {
      if (currentFontSize > 0.9) {
        currentFontSize -= 0.08;
        contentBody.style.fontSize = currentFontSize.toFixed(2) + 'rem';
      }
    });
  }

  if (btnFontInc && contentBody) {
    btnFontInc.addEventListener('click', function () {
      if (currentFontSize < 1.4) {
        currentFontSize += 0.08;
        contentBody.style.fontSize = currentFontSize.toFixed(2) + 'rem';
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
