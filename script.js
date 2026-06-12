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
  initDynamicData();
  initModals();
  initAdminDashboard();
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
  '%c⚽ MUSCB — Manchester United Supporters Club Bengaluru %c\nBengaluru\'s Red Devils | GGMU',
  'background: #C10000; color: white; font-weight: bold; font-size: 14px; padding: 6px 12px; border-radius: 4px;',
  'color: #888; font-size: 12px;'
);

// ════════════════════════════════════════════════
// V3 DYNAMIC DATA, MODALS & ADMIN DASHBOARD
// ════════════════════════════════════════════════

let siteData = {
  screenings: {
    featured: {
      competition: "Premier League",
      homeTeam: "MAN UTD",
      awayTeam: "TBD",
      date: "Date & Time TBA",
      venue: "Bengaluru Venue TBA",
      rsvpLink: "https://tr.ee/LWCkHGoM0q",
      instaLink: "https://tr.ee/LWCkHGoM0q",
      posterUrl: "images/screening2.jpg"
    }
  },
  announcements: [
    { id: 1, badge: "Pinned", title: "OUM Memberships Now Open", description: "Become an Official United Member today. Join MUSCB and be part of the official supporter community in Bengaluru. Registration is open now.", link: "https://tr.ee/yYmx1pF_Zm" },
    { id: 2, badge: "Screening", title: "Next Match Screening", description: "Details for the next United screening will be announced on our Instagram and WhatsApp community. Stay connected for venue and timing updates.", link: "https://tr.ee/LWCkHGoM0q" },
    { id: 3, badge: "Event", title: "Upcoming Fan Meetup", description: "United Fans Assemble is coming. RSVP through our link or WhatsApp. All MUSCB members and Manchester United fans in Bengaluru are welcome.", link: "https://tr.ee/yYmx1pF_Zm" }
  ],
  gallery: [
    { id: 1, imageUrl: "images/gallery1.jpg", title: "Fan Meetup", type: "tall" },
    { id: 2, imageUrl: "images/gallery1.jpg", title: "Match Celebration", type: "standard" },
    { id: 3, imageUrl: "images/screening2.jpg", title: "Match Screening", type: "standard" },
    { id: 4, imageUrl: "images/football_team.jpg", title: "MUSCB FC", type: "wide" }
  ]
};

let verifiedPassword = '';

// ─── DYNAMIC DATA LOADING ───────────────────────
async function initDynamicData() {
  // Try loading from localStorage first to keep it instant
  const cachedData = localStorage.getItem('muscb_site_data');
  if (cachedData) {
    try {
      siteData = JSON.parse(cachedData);
      renderAllContent();
    } catch (e) {
      console.error('Error parsing cached data', e);
    }
  }

  // Fetch fresh data from API
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const freshData = await res.json();
      siteData = freshData;
      // Cache locally
      localStorage.setItem('muscb_site_data', JSON.stringify(siteData));
      renderAllContent();
      
      // Update Admin UI status if logged in
      const statusText = document.getElementById('db-status-text');
      const indicator = document.querySelector('.status-indicator');
      if (statusText && indicator) {
        statusText.textContent = "Live Synced";
        indicator.className = "status-indicator live";
      }
    }
  } catch (err) {
    console.warn('API unavailable, falling back to cache/defaults:', err);
    // Render defaults if no cache existed
    if (!cachedData) {
      renderAllContent();
    }
  }
}

function renderAllContent() {
  renderScreenings(siteData.screenings);
  renderAnnouncements(siteData.announcements);
  renderGallery(siteData.gallery);
}

// ─── RENDERING FUNCTIONS ────────────────────────
function renderScreenings(screenings) {
  const container = document.getElementById('screenings-dynamic-container');
  if (!container) return;

  const featured = screenings.featured;
  container.innerHTML = `
    <div class="screening-card featured-screening" data-animate="fade-up">
      <div class="screening-badge">🔴 Upcoming Screening</div>
      <div class="screening-poster">
        <img src="${featured.posterUrl}" alt="Match Screening Poster" onerror="this.src='images/screening2.jpg'" loading="lazy" />
        <div class="screening-poster-overlay">
          <div class="screening-competition">${featured.competition}</div>
          <div class="screening-matchup">
            <span class="team-home">${featured.homeTeam}</span>
            <span class="vs">VS</span>
            <span class="team-away">${featured.awayTeam}</span>
          </div>
        </div>
      </div>
      <div class="screening-details">
        <div class="screening-info-row">
          <div class="screening-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${featured.date}
          </div>
          <div class="screening-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${featured.venue}
          </div>
        </div>
        <div class="screening-actions">
          <a href="${featured.rsvpLink}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" id="screening-rsvp-btn">RSVP Now</a>
          <a href="${featured.instaLink}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" id="screening-insta-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Instagram
          </a>
        </div>
      </div>
    </div>

    <div class="screening-card" data-animate="fade-up" data-delay="80">
      <div class="screening-badge upcoming">🏆 Season Screenings</div>
      <div class="screening-info-block">
        <h3>Every Match. Every Competition.</h3>
        <p>We screen Premier League, FA Cup, Champions League / Europa League matches throughout the season.</p>
        <ul class="screening-list">
          <li>⚽ Premier League matchdays</li>
          <li>🏆 FA Cup rounds</li>
          <li>🇪🇺 European nights</li>
          <li>🛡️ Community Shield & Cups</li>
          <li>🍺 Carabao Cup fixtures</li>
        </ul>
        <a href="${featured.rsvpLink}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" id="screening-updates-btn">
          Get Screening Updates
        </a>
      </div>
    </div>

    <div class="screening-card" data-animate="fade-up" data-delay="160">
      <div class="screening-badge">📍 Venue Info</div>
      <div class="screening-info-block">
        <h3>Central Bengaluru Locations</h3>
        <p>MUSCB screenings are held at partner venues in Bengaluru, typically in central locations for easy access.</p>
        <ul class="screening-list">
          <li>🍻 Partner sports bars & venues</li>
          <li>🚗 Accessible city-center locations</li>
          <li>📢 Venue confirmed per screening</li>
          <li>📸 Check Instagram for updates</li>
        </ul>
        <a href="${featured.instaLink}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" id="screening-community-btn">
          Join Community for Updates
        </a>
      </div>
    </div>
  `;
}

function renderAnnouncements(announcements) {
  const container = document.getElementById('announcements-dynamic-container');
  if (!container) return;

  container.innerHTML = announcements.map((ann, i) => {
    let badgeClass = 'event-badge';
    let iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    
    if (ann.badge === 'Pinned') {
      badgeClass = 'pin-badge';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>';
    } else if (ann.badge === 'Screening') {
      badgeClass = 'upcoming-badge';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8,21 12,17 16,21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
    } else if (ann.badge === 'Football') {
      badgeClass = 'football-badge';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/></svg>';
    } else if (ann.badge === 'Giveaway') {
      badgeClass = 'giveaway-badge';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
    } else if (ann.badge === 'Community') {
      badgeClass = 'community-badge';
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }

    return `
      <div class="announcement-card ${ann.badge === 'Pinned' ? 'pinned' : ''}" data-animate="fade-up" data-delay="${i * 80}">
        <div class="announcement-badge ${badgeClass}">${ann.badge}</div>
        <div class="announcement-icon">${iconSvg}</div>
        <h3>${ann.title}</h3>
        <p>${ann.description}</p>
        <a href="${ann.link}" target="_blank" rel="noopener" class="announcement-link">More Details &rarr;</a>
      </div>
    `;
  }).join('');
}

function renderGallery(gallery) {
  const container = document.getElementById('gallery-dynamic-container');
  if (!container) return;

  container.innerHTML = gallery.map((item) => {
    let typeClass = '';
    if (item.type === 'tall') typeClass = 'tall';
    else if (item.type === 'wide') typeClass = 'wide';

    return `
      <div class="gallery-item ${typeClass}" tabindex="0" role="button" aria-label="View gallery image">
        <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='images/stadium_hero.jpg'" loading="lazy" />
        <div class="gallery-overlay">
          <span>${item.title}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── APP MODALS SYSTEM ──────────────────────────
function initModals() {
  // Intercept trigger links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#meetups' || href === '#football' || href === '#community') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = `${href.substring(1)}-modal`;
        const modal = document.getElementById(modalId);
        if (modal) openModal(modal);
      });
    }
  });

  // Modal setup (Open/Close triggers)
  const modals = document.querySelectorAll('.app-modal');
  modals.forEach(modal => {
    // Background click close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });

    // Close button click close
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  // Esc key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.app-modal.open');
      if (openModalEl) closeModal(openModalEl);
    }
  });
}

function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('open');
  // Check if any other modal is open before unlocking body scroll
  if (!document.querySelector('.app-modal.open')) {
    document.body.style.overflow = '';
  }
}

// ─── ADMIN DASHBOARD OPERATIONS ────────────────
function initAdminDashboard() {
  const loginModal = document.getElementById('admin-login-modal');
  const dashModal = document.getElementById('admin-dashboard-modal');
  const navBtn = document.getElementById('navbar-admin-btn');
  const footBtn = document.getElementById('footer-admin-btn');
  const logoutBtn = document.getElementById('admin-logout-btn');

  const closeLoginBtn = document.getElementById('close-admin-login');
  const closeDashBtn = document.getElementById('close-admin-dashboard');

  const loginSubmit = document.getElementById('submit-login-btn');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error-msg');

  // Trigger Open
  const triggerLogin = (e) => {
    e.preventDefault();
    if (verifiedPassword) {
      openModal(dashModal);
      populateDashboard();
    } else {
      openModal(loginModal);
      passwordInput.value = '';
      loginError.textContent = '';
      passwordInput.focus();
    }
  };

  if (navBtn) navBtn.addEventListener('click', triggerLogin);
  if (footBtn) footBtn.addEventListener('click', triggerLogin);

  // Close wrappers
  if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
  if (closeDashBtn) closeDashBtn.addEventListener('click', () => closeModal(dashModal));

  // Submit Password Check
  const verifyPassword = () => {
    const pass = passwordInput.value;
    if (pass === 'reddevils2026') {
      verifiedPassword = pass;
      closeModal(loginModal);
      setTimeout(() => {
        openModal(dashModal);
        populateDashboard();
      }, 300);
    } else {
      loginError.textContent = 'Invalid Password. Please try again.';
      // Shake animation
      passwordInput.style.borderColor = '#ff4d4d';
      passwordInput.animate([
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' }
      ], { duration: 300 });
    }
  };

  if (loginSubmit) loginSubmit.addEventListener('click', verifyPassword);
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyPassword();
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      verifiedPassword = '';
      closeModal(dashModal);
    });
  }

  // Dashboard Tabs Switcher
  const tabs = document.querySelectorAll('.dash-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetPaneId = `tab-${tab.dataset.tab}`;
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      document.getElementById(targetPaneId).classList.add('active');
    });
  });

  // Bind direct image uploaders
  bindImageUpload('screen-file-input', 'screen-upload-status', 'screen-poster', 'screen-poster-preview');
  bindImageUpload('gal-file-input', 'gal-upload-status', 'gal-url', 'gal-poster-preview');

  // Bind form submissions
  const screeningForm = document.getElementById('admin-screening-form');
  if (screeningForm) {
    screeningForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteData.screenings.featured = {
        competition: document.getElementById('screen-comp').value,
        homeTeam: document.getElementById('screen-home').value,
        awayTeam: document.getElementById('screen-away').value,
        date: document.getElementById('screen-date').value,
        venue: document.getElementById('screen-venue').value,
        rsvpLink: document.getElementById('screen-rsvp').value,
        instaLink: document.getElementById('screen-insta').value,
        posterUrl: document.getElementById('screen-poster').value || 'images/screening2.jpg'
      };
      saveData();
    });
  }

  const annForm = document.getElementById('admin-announcement-form');
  if (annForm) {
    annForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newAnn = {
        id: Date.now(),
        title: document.getElementById('ann-title').value,
        badge: document.getElementById('ann-badge').value,
        description: document.getElementById('ann-desc').value,
        link: document.getElementById('ann-link').value
      };
      siteData.announcements.push(newAnn);
      saveData();
      annForm.reset();
      populateAnnouncementsList();
    });
  }

  const galForm = document.getElementById('admin-gallery-form');
  if (galForm) {
    galForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newImg = {
        id: Date.now(),
        imageUrl: document.getElementById('gal-url').value || 'images/stadium_hero.jpg',
        title: document.getElementById('gal-title').value,
        type: document.getElementById('gal-type').value
      };
      siteData.gallery.push(newImg);
      saveData();
      galForm.reset();
      
      // Reset preview
      const preview = document.getElementById('gal-poster-preview');
      if (preview) preview.innerHTML = 'No Photo Selected';
      const statusEl = document.getElementById('gal-upload-status');
      if (statusEl) {
        statusEl.textContent = 'Select a photo from your device.';
        statusEl.style.color = 'var(--white-50)';
      }
      
      populateGalleryList();
    });
  }
}

// Populate Dash fields
function populateDashboard() {
  const featured = siteData.screenings.featured;
  document.getElementById('screen-comp').value = featured.competition;
  document.getElementById('screen-home').value = featured.homeTeam;
  document.getElementById('screen-away').value = featured.awayTeam;
  document.getElementById('screen-date').value = featured.date;
  document.getElementById('screen-venue').value = featured.venue;
  document.getElementById('screen-rsvp').value = featured.rsvpLink;
  document.getElementById('screen-insta').value = featured.instaLink;
  document.getElementById('screen-poster').value = featured.posterUrl;

  const preview = document.getElementById('screen-poster-preview');
  if (preview && featured.posterUrl) {
    preview.innerHTML = `<img src="${featured.posterUrl}" alt="Current Poster" />`;
  }

  populateAnnouncementsList();
  populateGalleryList();
}

// Image Upload Helper
function bindImageUpload(fileInputId, statusId, hiddenInputId, previewId) {
  const fileInput = document.getElementById(fileInputId);
  const statusEl = document.getElementById(statusId);
  const hiddenInput = document.getElementById(hiddenInputId);
  const previewEl = document.getElementById(previewId);

  if (!fileInput) return;

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (statusEl) {
      statusEl.textContent = 'Reading photo...';
      statusEl.style.color = 'var(--gold)';
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      
      if (statusEl) {
        statusEl.textContent = 'Uploading to database...';
      }

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: verifiedPassword,
            fileName: file.name,
            fileData: base64Data
          })
        });

        const result = await response.json();

        if (result.success && result.url) {
          hiddenInput.value = result.url;
          if (previewEl) {
            previewEl.innerHTML = `<img src="${result.url}" alt="Uploaded preview" />`;
          }
          if (statusEl) {
            statusEl.textContent = 'Upload success! Ready to save.';
            statusEl.style.color = '#2ecc71';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = 'Upload failed: ' + (result.error || 'API Error');
            statusEl.style.color = '#ff4d4d';
          }
        }
      } catch (err) {
        console.error('Upload network error:', err);
        if (statusEl) {
          statusEl.textContent = 'Upload error: check connection.';
          statusEl.style.color = '#ff4d4d';
        }
      }
    };

    reader.onerror = () => {
      if (statusEl) {
        statusEl.textContent = 'Failed to read photo file.';
        statusEl.style.color = '#ff4d4d';
      }
    };

    reader.readAsDataURL(file);
  });
}

// Announcements Admin List
function populateAnnouncementsList() {
  const container = document.getElementById('admin-announcements-list');
  if (!container) return;

  container.innerHTML = siteData.announcements.map(ann => `
    <div class="admin-list-item">
      <div class="admin-item-info">
        <span class="admin-item-title">[${ann.badge}] ${ann.title}</span>
        <span class="admin-item-subtitle">${ann.description}</span>
      </div>
      <button class="btn-delete" onclick="deleteAnnouncement(${ann.id})" title="Delete Announcement">&times;</button>
    </div>
  `).join('');
}

// Gallery Admin List
function populateGalleryList() {
  const container = document.getElementById('admin-gallery-list');
  if (!container) return;

  container.innerHTML = siteData.gallery.map(img => `
    <div class="admin-list-item">
      <div class="admin-item-info">
        <span class="admin-item-title">${img.title}</span>
        <span class="admin-item-subtitle">${img.imageUrl}</span>
      </div>
      <button class="btn-delete" onclick="deleteGalleryImage(${img.id})" title="Delete Image">&times;</button>
    </div>
  `).join('');
}

// Global functions for inline delete buttons
window.deleteAnnouncement = function(id) {
  siteData.announcements = siteData.announcements.filter(ann => ann.id !== id);
  saveData();
  populateAnnouncementsList();
};

window.deleteGalleryImage = function(id) {
  siteData.gallery = siteData.gallery.filter(img => img.id !== id);
  saveData();
  populateGalleryList();
};

// Save Data Call
async function saveData() {
  const statusMsg = document.getElementById('admin-status-message');
  if (statusMsg) {
    statusMsg.className = 'admin-status-msg info';
    statusMsg.textContent = 'Saving changes...';
  }

  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: verifiedPassword,
        data: siteData
      })
    });

    const result = await response.json();

    if (result.success) {
      // Save locally
      localStorage.setItem('muscb_site_data', JSON.stringify(siteData));
      renderAllContent();

      if (statusMsg) {
        statusMsg.className = 'admin-status-msg success';
        statusMsg.textContent = result.localOnly 
          ? 'Saved browser local cache! (Set GITHUB_PAT on Vercel for DB)' 
          : 'Successfully saved and synced to database!';
      }
    } else {
      if (statusMsg) {
        statusMsg.className = 'admin-status-msg error';
        statusMsg.textContent = 'Error: ' + (result.error || 'Failed to save');
      }
    }
  } catch (err) {
    console.error('Error saving data:', err);
    // Fallback: save locally
    localStorage.setItem('muscb_site_data', JSON.stringify(siteData));
    renderAllContent();
    if (statusMsg) {
      statusMsg.className = 'admin-status-msg success';
      statusMsg.textContent = 'Offline backup saved locally in browser!';
    }
  }
}

