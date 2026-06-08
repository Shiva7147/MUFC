/* ════════════════════════════════════════════════
   MUSCB – Manchester United Supporters Club Bangalore
   Main JavaScript — Production Ready
   ════════════════════════════════════════════════ */

'use strict';

// ─── DOM READY ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initScrollAnimations();
  initHeroParticles();
  initSmoothScroll();
  initActiveNavLinks();
  initScrollIndicator();
});

// ─── NAVBAR ─────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function onScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── ACTIVE NAV LINK HIGHLIGHTING ───────────────
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

// ─── MOBILE HAMBURGER MENU ───────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('mobileOverlay');

  if (!hamburger || !navLinks) return;

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('mobile-open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ─── SMOOTH SCROLL ──────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });
}

// ─── SCROLL ANIMATIONS ───────────────────────────
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0');
        setTimeout(() => {
          el.classList.add('is-visible');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  animatedEls.forEach(el => observer.observe(el));

  // Stagger children in grids / lists
  document.querySelectorAll('.about-pillars, .football-grid, .community-grid, .announcements-grid').forEach(parent => {
    const children = parent.querySelectorAll('[data-animate]');
    children.forEach((child, i) => {
      if (!child.hasAttribute('data-delay')) {
        child.setAttribute('data-delay', String(i * 80));
      }
    });
  });
}

// ─── HERO PARTICLES ─────────────────────────────
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const colors = [
    'rgba(193, 0, 0, 0.6)',
    'rgba(193, 0, 0, 0.4)',
    'rgba(244, 196, 48, 0.5)',
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0.15)',
  ];

  const particleCount = window.innerWidth < 640 ? 14 : 28;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 10 + 8;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      left: ${x}%;
      bottom: ${Math.random() * 30}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;

    container.appendChild(p);
  }
}

// ─── SCROLL INDICATOR ───────────────────────────
function initScrollIndicator() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '1';
      indicator.style.pointerEvents = 'auto';
    }
  }, { passive: true });
}

// ─── GALLERY LIGHTBOX (basic) ────────────────────
(function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View gallery image');
  });
})();

// ─── TICKER PAUSE ON HOVER ───────────────────────
(function initTicker() {
  const ticker = document.querySelector('.ticker-track');
  if (!ticker) return;

  ticker.addEventListener('mouseenter', () => {
    ticker.style.animationPlayState = 'paused';
  });
  ticker.addEventListener('mouseleave', () => {
    ticker.style.animationPlayState = 'running';
  });
})();

// ─── PERFORMANCE: LAZY LOAD IMAGES ──────────────
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy load supported

  const images = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
})();

// ─── EMBLEM ORBIT PAUSE ON HOVER ────────────────
(function initEmblem() {
  const ring = document.querySelector('.emblem-ring.outer');
  if (!ring) return;

  ring.addEventListener('mouseenter', () => {
    ring.style.animationPlayState = 'paused';
  });
  ring.addEventListener('mouseleave', () => {
    ring.style.animationPlayState = 'running';
  });
})();

// ─── BUTTON RIPPLE EFFECT ────────────────────────
(function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple-expand 0.5s ease-out forwards;
        pointer-events: none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-expand {
      to {
        transform: translate(-50%, -50%) scale(60);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

// ─── ANNOUNCEMENT CARDS STAGGER ─────────────────
(function initAnnouncementStagger() {
  const cards = document.querySelectorAll('.announcement-card');
  cards.forEach((card, i) => {
    card.setAttribute('data-animate', 'fade-up');
    card.setAttribute('data-delay', String(i * 80));
  });
})();

// ─── MEETUP + SCREENING CARD STAGGER ────────────
(function initCardStagger() {
  const selectors = ['.meetup-card', '.screening-card', '.football-card', '.community-reason', '.link-card'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((card, i) => {
      if (!card.hasAttribute('data-animate')) {
        card.setAttribute('data-animate', 'fade-up');
        card.setAttribute('data-delay', String(i * 80));
      }
    });
  });
})();

// ─── CONSOLE SIGNATURE ──────────────────────────
console.log(
  '%c⚽ MUSCB — Manchester United Supporters Club Bangalore %c\nBengaluru\'s Red Devils | GGMU',
  'background: #C10000; color: white; font-weight: bold; font-size: 14px; padding: 6px 12px; border-radius: 4px;',
  'color: #888; font-size: 12px;'
);
