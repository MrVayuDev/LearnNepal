/**
 * LearnNepal — Advanced Page Transitions
 * Powered by GSAP 3 + Lenis Smooth Scroll
 *
 * Features:
 *  - Multi-strip liquid curtain transition (cinema-style)
 *  - Custom magnetic dual-ring cursor
 *  - Lenis smooth scroll with inertia
 *  - ScrollTrigger-powered element reveals
 *  - Link hover scramble text effect
 */

/* ─── Bootstrap: load GSAP + plugins + Lenis from CDN sequentially ─── */
(function bootstrapLibs() {
  const libs = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js',
  ];

  function loadNext(index) {
    if (index >= libs.length) { init(); return; }
    const s = document.createElement('script');
    s.src = libs[index];
    s.onload  = () => loadNext(index + 1);
    s.onerror = () => loadNext(index + 1); // skip missing, degrade gracefully
    document.head.appendChild(s);
  }

  loadNext(0);
})();

/* ─── Main init — called after all libs loaded ─── */
function init() {
  if (window.__transitionsInited) return;
  window.__transitionsInited = true;

  gsap.registerPlugin(ScrollTrigger);

  buildCurtain();
  buildCursor();
  initSmoothScroll();
  initScrollReveal();
  initLinkHover();
  playEnter();          // reveal the page on load
  interceptLinks();     // wire up exit transitions
}

/* ═══════════════════════════════════════════════
   CURTAIN — multi-strip liquid wipe
═══════════════════════════════════════════════ */
const STRIP_COUNT   = 9;
const STRIP_COLOR_A = '#0f2a4a';   // navy (--color-primary)
const STRIP_COLOR_B = '#c5a059';   // gold  (--color-accent)

let curtainEl, strips;

function buildCurtain() {
  // Already exists? (back-nav from bfcache)
  if (document.querySelector('.ln-curtain')) {
    curtainEl = document.querySelector('.ln-curtain');
    strips    = Array.from(curtainEl.querySelectorAll('.ln-strip'));
    return;
  }

  curtainEl = document.createElement('div');
  curtainEl.className = 'ln-curtain';
  curtainEl.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < STRIP_COUNT; i++) {
    const strip = document.createElement('div');
    strip.className = 'ln-strip';
    // Alternate colors for a layered feel
    strip.style.background = i % 2 === 0 ? STRIP_COLOR_A : STRIP_COLOR_B;
    curtainEl.appendChild(strip);
  }

  document.body.appendChild(curtainEl);
  strips = Array.from(curtainEl.querySelectorAll('.ln-strip'));

  // Start fully closed (covering the screen); enter anim will open them
  gsap.set(strips, { scaleY: 1, transformOrigin: 'top center' });
}

/** Reveal — strips retract upward, staggered */
function playEnter(onComplete) {
  return gsap.timeline({ onComplete })
    .set(curtainEl, { pointerEvents: 'none' })
    .to(strips, {
      scaleY: 0,
      duration: 1.05,
      ease: 'expo.inOut',
      stagger: {
        each: 0.065,
        from: 'start',
      },
      transformOrigin: 'top center',
    });
}

/** Cover — strips sweep down to fill screen, staggered */
function playExit(onComplete) {
  return gsap.timeline({ onComplete })
    .set(curtainEl, { pointerEvents: 'all' })
    .set(strips, { scaleY: 0, transformOrigin: 'bottom center' })
    .to(strips, {
      scaleY: 1,
      duration: 0.85,
      ease: 'expo.inOut',
      stagger: {
        each: 0.055,
        from: 'start',
      },
      transformOrigin: 'bottom center',
    });
}

/* ─── Link interception ─── */
function interceptLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      !isSameOrigin(link.href)
    ) return;

    // Don't animate same-page reloads
    try {
      const dest = new URL(link.href);
      const curr = new URL(window.location.href);
      if (dest.pathname === curr.pathname && dest.search === curr.search) return;
    } catch (_) {}

    e.preventDefault();
    playExit(() => {
      window.location.assign(link.href);
    });
  });
}

function isSameOrigin(href) {
  try { return new URL(href).origin === window.location.origin; } catch { return false; }
}


/* ═══════════════════════════════════════════════
   CUSTOM MAGNETIC CURSOR
═══════════════════════════════════════════════ */
let cursorDot, cursorRing;
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;
let rafId;

function buildCursor() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  cursorDot = document.createElement('div');
  cursorDot.className = 'ln-cursor-dot';

  cursorRing = document.createElement('div');
  cursorRing.className = 'ln-cursor-ring';

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  // Hide default cursor
  document.documentElement.style.cursor = 'none';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.05, ease: 'none' });
  });

  // Lerp the ring for silky lag
  function loopRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    gsap.set(cursorRing, { x: ringX - 20, y: ringY - 20 });
    rafId = requestAnimationFrame(loopRing);
  }
  loopRing();

  // Magnetic attraction to interactive elements
  const targets = 'a, button, .btn, .card, .sidebar-link, .nav-link';

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(targets);
    if (el) {
      cursorRing.classList.add('ln-cursor-ring--active');
      cursorDot.classList.add('ln-cursor-dot--active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest(targets);
    if (el) {
      cursorRing.classList.remove('ln-cursor-ring--active');
      cursorDot.classList.remove('ln-cursor-dot--active');
    }
  });

  document.addEventListener('mousedown', () => cursorRing.classList.add('ln-cursor-ring--click'));
  document.addEventListener('mouseup',   () => cursorRing.classList.remove('ln-cursor-ring--click'));
}


/* ═══════════════════════════════════════════════
   LENIS SMOOTH SCROLL
═══════════════════════════════════════════════ */
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

  // Expose so other scripts can pause (e.g. mobile menu open)
  window.__lenis = lenis;
}


/* ═══════════════════════════════════════════════
   SCROLL-TRIGGERED REVEALS
═══════════════════════════════════════════════ */
function initScrollReveal() {
  // Cards
  gsap.utils.toArray('.card, .sidebar-link, .chapter-title, .section-title').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // Hero text lines — stagger each word span if present, else the whole block
  const heroHeading = document.querySelector('.hero h1, .chapter-title');
  if (heroHeading) {
    gsap.fromTo(heroHeading,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out', delay: 0.5 }
    );
  }

  // Horizontal marquee stripe (decorative) — only if nav bar is visible
  const header = document.querySelector('.header');
  if (header) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        if (self.direction === -1) header.classList.remove('scrolled');
      },
    });
  }
}


/* ═══════════════════════════════════════════════
   TEXT SCRAMBLE on nav links
═══════════════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';

function scramble(el) {
  const original = el.dataset.originalText || el.innerText;
  el.dataset.originalText = original;

  let iteration = 0;
  const maxIter = original.length * 2;
  clearInterval(el._scrambleTimer);

  el._scrambleTimer = setInterval(() => {
    el.innerText = original
      .split('')
      .map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < iteration / 2) return original[idx];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    if (iteration >= maxIter) {
      clearInterval(el._scrambleTimer);
      el.innerText = original;
    }
    iteration++;
  }, 28);
}

function initLinkHover() {
  document.querySelectorAll('.nav-link, .sidebar-link').forEach((link) => {
    link.addEventListener('mouseenter', () => scramble(link));
  });
}
