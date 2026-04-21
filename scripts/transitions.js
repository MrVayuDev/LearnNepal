/**
 * LearnNepal — transitions.js  v2
 * Dual cursor (ring + dot) · Lenis smooth scroll · GSAP scroll reveals
 * Back-to-top button · Header scroll state
 */

/* ─── Bootstrap: load GSAP, ScrollTrigger, Lenis sequentially ─── */
(function bootstrapLibs() {
  const libs = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js',
  ];

  function loadNext(i) {
    if (i >= libs.length) { init(); return; }
    const s = document.createElement('script');
    s.src = libs[i];
    s.onload  = () => loadNext(i + 1);
    s.onerror = () => loadNext(i + 1);
    document.head.appendChild(s);
  }

  loadNext(0);
})();

/* ─── Main init — called once all libs are ready ─── */
function init() {
  if (window.__transitionsInited) return;
  window.__transitionsInited = true;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buildDualCursor();
  initHeaderScroll();
  initBackToTop();

  if (!reducedMotion && typeof gsap !== 'undefined') {
    initSmoothScroll();
    initScrollReveal();
  }
}

/* ════════════════════════════════════════════════════════════
   DUAL CURSOR  — ring trails, dot snaps
   ════════════════════════════════════════════════════════════ */
function buildDualCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (typeof gsap === 'undefined') return;

  const ring = document.createElement('div');
  ring.className = 'ln-cursor-ring';
  const dot = document.createElement('div');
  dot.className = 'ln-cursor-dot';
  document.body.append(ring, dot);

  gsap.set(ring, { xPercent: -50, yPercent: -50 });
  gsap.set(dot,  { xPercent: -50, yPercent: -50 });

  let mX = window.innerWidth / 2;
  let mY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mX = e.clientX;
    mY = e.clientY;
    gsap.to(dot,  { x: mX, y: mY, duration: 0.05, ease: 'none' });
    gsap.to(ring, { x: mX, y: mY, duration: 0.18, ease: 'expo.out' });
  });

  const HOVER_TARGETS = 'a, button, .btn, .card, .chapter-card, .class-card, .feature-card, .sidebar-link, .nav-link, .subject-pill, .back-to-top, input, textarea, select, label, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_TARGETS)) {
      ring.classList.add('is-hovering');
      dot.classList.add('is-hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_TARGETS)) {
      ring.classList.remove('is-hovering');
      dot.classList.remove('is-hovering');
    }
  });

  document.addEventListener('mousedown', () => {
    ring.classList.add('is-clicking');
    dot.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('is-clicking');
    dot.classList.remove('is-clicking');
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([ring, dot], { opacity: 0, duration: 0.25 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([ring, dot], { opacity: 1, duration: 0.25 });
  });
}

/* ════════════════════════════════════════════════════════════
   HEADER SCROLL STATE — shrink + gold border on scroll
   ════════════════════════════════════════════════════════════ */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;

      if (y > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastY = y;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
}

/* ════════════════════════════════════════════════════════════
   BACK-TO-TOP BUTTON
   ════════════════════════════════════════════════════════════ */
function initBackToTop() {
  // Create the button
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '&#8593;';
  document.body.appendChild(btn);

  function checkVisibility() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  checkVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

/* ════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED REVEALS
   ════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  if (typeof gsap === 'undefined') return;

  /* 1. Cards not inside a stagger-grid */
  gsap.utils.toArray('.card:not(.stagger-grid *)').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 26 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* 2. Feature cards */
  gsap.utils.toArray('.feature-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* 3. Class cards */
  gsap.utils.toArray('.class-card').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        delay: i * 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* 4. Chapter title */
  gsap.utils.toArray('.chapter-title').forEach((heading) => {
    if (!heading.closest('.animate-fade-up') && !heading.classList.contains('animate-fade-up')) {
      gsap.fromTo(heading,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.2 }
      );
    }
  });

  /* 5–6. Docs content & reader content animations REMOVED.
   * These batch-animated every p, h2, h3, question-box, match-table
   * on chapter/solution pages, causing distracting fade-in delays
   * while reading. Content now appears instantly for better UX. */

  /* 7. Stat block counter pop */
  gsap.utils.toArray('.stat-block').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 95%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}
