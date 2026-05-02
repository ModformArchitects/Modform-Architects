/* ════════════════════════════════════════════════════════════
   Ar.Shrishtika — Architecture & Design Studio
   Main JavaScript — v3
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ── Project data (for lightbox) ─────────────────────────── */
const PROJECTS = [
  {
    name: 'Jal Villa',
    slug: 'jal-villa',
    category: 'Residential',
    location: 'Alibaug, Maharashtra',
    year: '2023',
    area: '620 sqm',
    status: 'Completed',
    images: [
      'assets/projects/residence-01.jpeg',
      'assets/projects/residence-02.jpeg',
      'assets/projects/residence-03.jpeg',
    ],
    desc: 'Jal Villa is a waterfront retreat on the Alibaug coastline, designed around the monsoon. The building\'s massing — three interlocking volumes on a laterite plinth — responds to the tidal rhythm and the morning sun. Raw concrete, reclaimed teak, and local Konkan stone form a palette that weathers beautifully against the salt air. A central courtyard channels the southwest monsoon breeze through every room.',
  },
  {
    name: 'Vayu Tower',
    slug: 'vayu-tower',
    category: 'Commercial',
    location: 'BKC, Mumbai',
    year: '2022',
    area: '24,000 sqm',
    status: 'Completed',
    images: [
      'assets/projects/residence-02.jpeg',
      'assets/projects/residence-04.jpeg',
      'assets/projects/residence-05.jpeg',
    ],
    desc: 'A 22-storey mixed-use tower in the Bandra–Kurla Complex, Vayu Tower integrates Grade-A office, retail, and a public atrium within a contemporary envelope informed by the Indian jali screen. The double-skin facade reduces solar heat gain by 38% without compromising views. A sky garden on the 14th floor acts as a social and ecological threshold — open to the city above the monsoon haze.',
  },
  {
    name: 'Aranya Cultural Centre',
    slug: 'aranya-centre',
    category: 'Cultural',
    location: 'Bengaluru',
    year: '2022',
    area: '3,800 sqm',
    status: 'Completed',
    images: [
      'assets/projects/residence-03.jpeg',
      'assets/projects/residence-01.jpeg',
      'assets/projects/residence-05.jpeg',
    ],
    desc: 'Aranya Cultural Centre is a home for Bengaluru\'s performing and visual arts. Organised around a banyan-shaded courtyard — a deliberate echo of the traditional Indian agora — the building uses rough basalt walls to absorb Karnataka\'s heat while high clerestory windows flood galleries with northern diffused light. The 480-seat auditorium is tuned for Carnatic vocal and Bharatanatyam performance.',
  },
  {
    name: 'Haveli Twelve',
    slug: 'haveli-twelve',
    category: 'Residential',
    location: 'Jaipur, Rajasthan',
    year: '2021',
    area: '880 sqm',
    status: 'Completed',
    images: [
      'assets/projects/residence-04.jpeg',
      'assets/projects/residence-03.jpeg',
      'assets/projects/residence-01.jpeg',
    ],
    desc: 'Haveli Twelve reinterprets the Rajasthani haveli typology for contemporary family living. Set in a lane in Jaipur\'s old city, the house reveals its interior gradually — a threshold, a baithak, an inner courtyard, and finally the private quarters beyond. Hand-cut Dholpur stone, carved jali screens, and lime-plastered vaults honour local craft while carrying modern infrastructure invisibly.',
  },
  {
    name: 'Ganga Riverfront Precinct',
    slug: 'ganga-precinct',
    category: 'Urban',
    location: 'Varanasi, UP',
    year: '2021',
    area: '6.4 ha masterplan',
    status: 'In Progress',
    images: [
      'assets/projects/residence-05.jpeg',
      'assets/projects/residence-02.jpeg',
      'assets/projects/residence-02.jpeg',
    ],
    desc: 'A participatory masterplan for a 6.4-hectare stretch of Varanasi\'s ghats, developed with residents, priests, and the Varanasi Municipal Corporation. The proposal enhances the ritual life of the river while improving flood resilience, pedestrian access, and sanitation. Four phases over twelve years — preserving the layered temporal character of the ghats while making them safer for the millions who use them each year.',
  },
  {
    name: 'Lattice Hub',
    slug: 'lattice-hub',
    category: 'Commercial',
    location: 'Hyderabad, Telangana',
    year: '2020',
    area: '5,200 sqm',
    status: 'Completed',
    images: [
      'assets/projects/residence-02.jpeg',
      'assets/projects/residence-04.jpeg',
      'assets/projects/residence-03.jpeg',
    ],
    desc: 'Lattice Hub is a technology campus in HITEC City designed around community, craft, and concentration. The facade — a deep concrete lattice inspired by Hyderabadi stone carving — reduces heat gain while casting geometric shadow patterns that move through the interior over the day. Inside: alcoves, open terraces, a central street, and a rooftop amphitheatre replace open-plan uniformity.',
  },
];

/* ══════════════════════════════════════════════════════════
   THEME TOGGLE
   ══════════════════════════════════════════════════════════ */
(function initTheme() {
  const html = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  const saved = localStorage.getItem('arshristika-theme') || 'dark';
  html.dataset.theme = saved;

  btn && btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('arshristika-theme', next);
  });
})();

/* ══════════════════════════════════════════════════════════
   UNIFIED RAF-THROTTLED SCROLL DISPATCHER
   (one listener, one rAF per frame — no jank from stacked handlers)
   ══════════════════════════════════════════════════════════ */
const _scrollCbs = [];
let   _scrollRaf = false;
function onScroll(fn) { _scrollCbs.push(fn); }
window.addEventListener('scroll', () => {
  if (_scrollRaf) return;
  _scrollRaf = true;
  requestAnimationFrame(() => {
    const sy = window.scrollY;
    _scrollCbs.forEach(fn => fn(sy));
    _scrollRaf = false;
  });
}, { passive: true });

/* ══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════════ */
(function initProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  onScroll(sy => { bar.style.width = (sy / (maxScroll() || 1) * 100) + '%'; });
})();

/* ══════════════════════════════════════════════════════════
   SCROLLSPY — active nav link
   ══════════════════════════════════════════════════════════ */
(function initScrollspy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
})();

/* ══════════════════════════════════════════════════════════
   VISITOR TRACKING
   ══════════════════════════════════════════════════════════ */
(function trackVisit() {
  try {
    const visitors = JSON.parse(localStorage.getItem('ars_visitors') || '[]');
    visitors.push({
      id: Date.now(),
      ts: new Date().toISOString(),
      page: location.pathname,
      ref: document.referrer || 'direct',
      ua: navigator.userAgent,
    });
    if (visitors.length > 500) visitors.splice(0, visitors.length - 500);
    localStorage.setItem('ars_visitors', JSON.stringify(visitors));
  } catch (_) {}
})();

/* ══════════════════════════════════════════════════════════
   LENIS SMOOTH SCROLL
   ══════════════════════════════════════════════════════════ */
let lenis;
(function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    syncTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      lenis.scrollTo(target, { offset: -navH, duration: 1.4 });
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   LOADER
   ══════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  if (!loader) return;

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { fill.style.width = '100%'; });

  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initReveal();
  }, 1700);
})();

/* ══════════════════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  const cursorLbl = document.getElementById('cursorLabel');
  if (!cursor || !window.matchMedia('(hover: hover)').matches) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
    cursorLbl.style.left = mx + 'px';
    cursorLbl.style.top  = my + 'px';
  });

  (function tick() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseover', e => {
    const el = e.target;
    if (el.closest('.project-card')) {
      document.body.classList.add('cursor-view');
      document.body.classList.remove('cursor-hover');
      cursorLbl.textContent = 'VIEW';
    } else if (el.closest('a, button, .filter-btn, .client-logo, .service-item, .t-dot, .lb-thumb')) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-view');
      cursorLbl.textContent = '';
    }
  });
  document.addEventListener('mouseout', e => {
    const el = e.target;
    if (el.closest('.project-card, a, button, .filter-btn, .client-logo, .service-item, .t-dot, .lb-thumb')) {
      document.body.classList.remove('cursor-hover', 'cursor-view');
      cursorLbl.textContent = '';
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   NAV — scroll + mobile toggle
   ══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!nav) return;

  onScroll(sy => { nav.classList.toggle('scrolled', sy > 60); });

  toggle && toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links && links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle && toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-line');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initReveal);

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOutExpo(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   MAGNETIC BUTTONS
   ══════════════════════════════════════════════════════════ */
(function initMagnetic() {
  const magnets = document.querySelectorAll('.magnetic');
  if (!window.matchMedia('(hover: hover)').matches) return;

  magnets.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const x      = e.clientX - rect.left - rect.width  / 2;
      const y      = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ══════════════════════════════════════════════════════════
   PROJECT FILTER
   ══════════════════════════════════════════════════════════ */
(function initFilter() {
  const filterWrap = document.getElementById('projectFilter');
  const grid       = document.getElementById('projectsGrid');
  if (!filterWrap || !grid) return;

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    grid.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('filtered-out', filter !== 'all' && card.dataset.category !== filter);
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   LIGHTBOX
   ══════════════════════════════════════════════════════════ */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const content  = document.getElementById('lightboxContent');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox) return;

  function open(idx) {
    const p = PROJECTS[idx];
    if (!p) return;

    content.innerHTML = `
      <div class="lb-grid">
        <div class="lb-images">
          <div class="lb-img-main">
            <img src="${p.images[0]}" alt="${p.name}" id="lbMainImg" />
          </div>
          <div class="lb-img-thumbs">
            ${p.images.map((src, i) => `
              <div class="lb-thumb" data-src="${src}" data-active="${i === 0}">
                <img src="${src}" alt="${p.name} view ${i + 1}" loading="lazy" />
              </div>
            `).join('')}
          </div>
        </div>
        <div class="lb-info">
          <p class="lb-eyebrow">${p.category}</p>
          <h2 class="lb-title">${p.name}</h2>
          <div class="lb-meta">
            <div class="lb-meta-item"><span class="lb-meta-label">Location</span><span class="lb-meta-val">${p.location}</span></div>
            <div class="lb-meta-item"><span class="lb-meta-label">Year</span><span class="lb-meta-val">${p.year}</span></div>
            <div class="lb-meta-item"><span class="lb-meta-label">Area</span><span class="lb-meta-val">${p.area}</span></div>
            <div class="lb-meta-item"><span class="lb-meta-label">Status</span><span class="lb-meta-val">${p.status}</span></div>
          </div>
          <p class="lb-desc">${p.desc}</p>
        </div>
      </div>
    `;

    content.querySelectorAll('.lb-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const mainImg = document.getElementById('lbMainImg');
        if (mainImg) mainImg.src = thumb.dataset.src;
        content.querySelectorAll('.lb-thumb').forEach(t => t.dataset.active = 'false');
        thumb.dataset.active = 'true';
      });
    });

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('filtered-out')) return;
      const idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx)) open(idx);
    });
  });

  closeBtn && closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ══════════════════════════════════════════════════════════
   TESTIMONIALS SLIDER
   ══════════════════════════════════════════════════════════ */
(function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial');
  const dots   = document.querySelectorAll('.t-dot');
  const prev   = document.getElementById('tPrev');
  const next   = document.getElementById('tNext');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function startAuto() { timer = setInterval(() => goTo(current + 1), 6000); }
  function stopAuto()  { clearInterval(timer); }

  prev && prev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  next && next.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(parseInt(dot.dataset.idx, 10));
      startAuto();
    });
  });

  const slider = document.getElementById('testimonialsSlider');
  if (slider) {
    let startX = 0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });
  }

  startAuto();
})();

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — EmailJS + localStorage lead capture
   ──────────────────────────────────────────────────────────
   Fill these three vars after creating a contact template
   in your EmailJS account (template vars: from_name,
   from_email, phone, project_type, message, reply_to).
   See README.md for full instructions.
   ══════════════════════════════════════════════════════════ */
var FORM_PUBLIC_KEY  = '';   // same Public Key as admin.js
var FORM_SERVICE_ID  = '';   // same Service ID as admin.js
var FORM_TEMPLATE_ID = '';   // new template e.g. 'template_contact'

(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  if (FORM_PUBLIC_KEY && typeof emailjs !== 'undefined') {
    emailjs.init(FORM_PUBLIC_KEY);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn  = form.querySelector('.form-submit');
    const span = btn.querySelector('span');
    btn.classList.add('loading');
    span.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form));
    const lead = {
      id: Date.now(),
      ts: new Date().toISOString(),
      source: 'website_form',
      status: 'new',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      project: data.project || '',
      message: data.message || '',
    };

    try {
      const leads = JSON.parse(localStorage.getItem('ars_leads') || '[]');
      leads.unshift(lead);
      localStorage.setItem('ars_leads', JSON.stringify(leads));
    } catch (_) {}

    function onSuccess() {
      btn.classList.remove('loading');
      span.textContent = 'Message Sent ✓';
      btn.style.background = '#4caf50';
      if (window.innerWidth < 768) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(function() {
        span.textContent = 'Send Message';
        btn.style.background = '';
        form.reset();
      }, 3000);
    }

    function onError() {
      btn.classList.remove('loading');
      span.textContent = 'Saved — email offline';
      btn.style.background = '#e07050';
      setTimeout(function() {
        span.textContent = 'Send Message';
        btn.style.background = '';
      }, 3000);
    }

    if (FORM_SERVICE_ID && FORM_TEMPLATE_ID && typeof emailjs !== 'undefined') {
      emailjs.send(FORM_SERVICE_ID, FORM_TEMPLATE_ID, {
        from_name:    lead.name,
        from_email:   lead.email,
        phone:        lead.phone,
        project_type: lead.project,
        message:      lead.message,
        reply_to:     lead.email,
        to_email:     'shrishtikapal6@gmail.com',
      }).then(onSuccess, onError);
    } else {
      setTimeout(onSuccess, 900);
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   OPTIONAL CLIENT ACCESS — soft login + gated planning info
   ══════════════════════════════════════════════════════════ */
(function initClientAccess() {
  const form       = document.getElementById('clientLoginForm');
  const loginView  = document.getElementById('clientLoginView');
  const portalView = document.getElementById('clientPortalView');
  const welcome    = document.getElementById('clientWelcome');
  const errorEl    = document.getElementById('clientFormError');
  const chatBtn    = document.getElementById('clientChatBtn');
  const contactBtn = document.getElementById('clientContactBtn');
  const logoutBtn  = document.getElementById('clientLogoutBtn');
  if (!form || !loginView || !portalView) return;

  const CUSTOMER_KEY  = 'ars_customer_profile';
  const CUSTOMERS_KEY = 'ars_customer_profiles';
  const LEADS_KEY     = 'ars_leads';

  function getSavedProfile() {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function setNavState(active) {
    const link = document.querySelector('.nav-link[href="#client-access"], .nav-link[href="client-login.html"]');
    if (link) link.textContent = active ? 'Client Area' : 'Client Login';
  }

  function showPortal(profile) {
    loginView.hidden = true;
    portalView.hidden = false;
    setNavState(true);
    if (welcome) {
      const firstName = String(profile.name || 'Client').trim().split(/\s+/)[0];
      welcome.textContent = 'Welcome, ' + firstName;
    }
  }

  function showLogin() {
    portalView.hidden = true;
    loginView.hidden = false;
    setNavState(false);
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(profile));

      const profiles = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
      profiles.unshift(profile);
      if (profiles.length > 200) profiles.splice(200);
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(profiles));

      const leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      leads.unshift({
        id: profile.id,
        ts: profile.ts,
        source: 'client_login',
        status: 'new',
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        project: profile.interest || profile.stage || 'Client access',
        message: 'Client access profile. Stage: ' + (profile.stage || 'Not shared') + '. Interest: ' + (profile.interest || 'Not shared') + '.',
      });
      if (leads.length > 500) leads.splice(500);
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch (_) {}
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (errorEl) errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));
    const profile = {
      id: Date.now(),
      ts: new Date().toISOString(),
      source: 'client_access',
      name: String(data.name || '').trim(),
      phone: String(data.phone || '').trim(),
      email: String(data.email || '').trim(),
      stage: data.stage || '',
      interest: data.interest || '',
    };

    if (!profile.name) {
      if (errorEl) errorEl.textContent = 'Please enter your name to continue.';
      return;
    }
    if (!profile.phone && !profile.email) {
      if (errorEl) errorEl.textContent = 'Please share either an email or phone number for follow-up.';
      return;
    }

    saveProfile(profile);
    showPortal(profile);
  });

  chatBtn && chatBtn.addEventListener('click', function() {
    const bubble = document.getElementById('chatBubble');
    const win = document.getElementById('chatbotWindow');
    if (bubble && (!win || !win.classList.contains('open'))) bubble.click();
  });

  contactBtn && contactBtn.addEventListener('click', function() {
    const contact = document.getElementById('contact');
    if (!contact) {
      window.location.href = 'index.html#contact';
      return;
    }
    if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(contact, { duration: 1.2 });
    else contact.scrollIntoView({ behavior: 'smooth' });
  });

  logoutBtn && logoutBtn.addEventListener('click', function() {
    try { localStorage.removeItem(CUSTOMER_KEY); } catch (_) {}
    form.reset();
    showLogin();
  });

  const saved = getSavedProfile();
  if (saved && saved.name) showPortal(saved);
  else showLogin();
})();

/* ══════════════════════════════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  onScroll(function(sy) { btn.classList.toggle('visible', sy > 600); });
  btn.addEventListener('click', function() {
    if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════════════
   HERO REVEAL (after loader)
   ══════════════════════════════════════════════════════════ */
(function heroReveal() {
  setTimeout(() => {
    document.querySelectorAll('.reveal-line').forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), i * 130);
    });
  }, 1800);
})();

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL fallback
   ══════════════════════════════════════════════════════════ */
if (typeof Lenis === 'undefined') {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   CHATBOT — friendly lead capture + quick actions
   ══════════════════════════════════════════════════════════ */
(function initChatbot() {
  const root      = document.getElementById('chatbot');
  const bubble    = document.getElementById('chatBubble');
  const labelBtn  = document.getElementById('chatLaunchLabel');
  const win       = document.getElementById('chatbotWindow');
  const closeBtn  = document.getElementById('chatbotClose');
  const msgs      = document.getElementById('chatbotMessages');
  const inputWrap = document.getElementById('chatInputWrap');
  const input     = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');
  if (!bubble || !win || !msgs || !inputWrap || !input || !sendBtn) return;

  let isOpen  = false;
  let started = false;
  let step    = 'idle';
  let activeOptions = null;
  let lead    = freshLead();

  function freshLead() {
    return { intent: '', name: '', phone: '', email: '', service: '', project: '' };
  }

  function escText(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openChat() {
    isOpen = true;
    root && root.classList.add('chat-open');
    win.classList.add('open');
    win.setAttribute('aria-hidden', 'false');
    if (!started) {
      started = true;
      setTimeout(startFlow, 250);
    }
  }

  function closeChat() {
    isOpen = false;
    root && root.classList.remove('chat-open');
    win.classList.remove('open');
    win.setAttribute('aria-hidden', 'true');
  }

  bubble.addEventListener('click', function() { isOpen ? closeChat() : openChat(); });
  labelBtn && labelBtn.addEventListener('click', function() { isOpen ? closeChat() : openChat(); });
  closeBtn && closeBtn.addEventListener('click', closeChat);

  function scrollBottom() { msgs.scrollTop = msgs.scrollHeight; }

  function clearOptions() {
    if (activeOptions && activeOptions.parentNode) activeOptions.parentNode.removeChild(activeOptions);
    activeOptions = null;
  }

  function addMsg(html, type) {
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg--' + type;
    d.innerHTML = '<div class="chat-msg-bubble">' + html + '</div>';
    msgs.appendChild(d);
    scrollBottom();
  }

  function addUserText(text) {
    addMsg(escText(text), 'user');
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scrollBottom();
    return el;
  }

  function botSay(html, extraDelay) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        const typing = showTyping();
        setTimeout(function() {
          typing.remove();
          addMsg(html, 'bot');
          resolve();
        }, 520);
      }, extraDelay || 0);
    });
  }

  function setInput(active, placeholder) {
    inputWrap.style.display = active ? 'flex' : 'none';
    if (active) {
      input.placeholder = placeholder || 'Type here...';
      input.value = '';
      setTimeout(function() { input.focus(); }, 60);
    }
  }

  function showOptions(opts, onPick) {
    clearOptions();
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    opts.forEach(function(opt) {
      const label = typeof opt === 'string' ? opt : opt.label;
      const value = typeof opt === 'string' ? opt : opt.value;
      const tone  = typeof opt === 'string' ? ''  : (opt.tone || '');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-option-btn' + (tone ? ' chat-option-btn--' + tone : '');
      btn.textContent = label;
      btn.addEventListener('click', function() {
        clearOptions();
        addUserText(label);
        onPick(value, label);
      });
      wrap.appendChild(btn);
    });
    msgs.appendChild(wrap);
    activeOptions = wrap;
    scrollBottom();
  }

  function showActionButtons() {
    clearOptions();
    const actions = document.createElement('div');
    actions.className = 'chat-done-actions';

    const whatsapp = document.createElement('a');
    whatsapp.className = 'chat-done-btn chat-done-btn--primary';
    whatsapp.href = 'https://wa.me/919452861841?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20your%20architecture%20services.';
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.textContent = 'Open WhatsApp';

    const contact = document.createElement('button');
    contact.type = 'button';
    contact.className = 'chat-done-btn';
    contact.textContent = 'Contact Form';
    contact.addEventListener('click', function() {
      closeChat();
      const cf = document.getElementById('contact');
      if (cf) {
        if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(cf, { duration: 1.2 });
        else cf.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html#contact';
      }
    });

    const restart = document.createElement('button');
    restart.type = 'button';
    restart.className = 'chat-done-btn chat-done-btn--ghost';
    restart.textContent = 'Start Over';
    restart.addEventListener('click', resetFlow);

    actions.appendChild(whatsapp);
    actions.appendChild(contact);
    actions.appendChild(restart);
    msgs.appendChild(actions);
    scrollBottom();
  }

  async function startFlow() {
    step = 'menu';
    setInput(false);
    await botSay('Hi, I am the <strong>Studio Assistant</strong>. What would you like to do?', 120);
    showMainMenu();
  }

  function showMainMenu() {
    step = 'menu';
    setInput(false);
    showOptions([
      { label: 'Share project brief', value: 'brief', tone: 'primary' },
      { label: 'Book a consultation', value: 'consultation' },
      { label: 'See services', value: 'services' },
      { label: 'WhatsApp directly', value: 'whatsapp' },
    ], handleIntent);
  }

  async function handleIntent(intent) {
    lead.intent = intent;
    if (intent === 'services') {
      await botSay('We can help with <strong>Architectural Design</strong>, <strong>Interior Design</strong>, <strong>Vastu Consultation</strong>, sustainable planning, and turnkey execution.', 160);
      await botSay('Would you like to share a quick brief so the studio can guide you better?', 160);
      showOptions([
        { label: 'Yes, share brief', value: 'brief', tone: 'primary' },
        { label: 'Back to menu', value: 'menu' },
      ], function(value) {
        if (value === 'brief') askService();
        else showMainMenu();
      });
      return;
    }

    if (intent === 'whatsapp') {
      await botSay('Sure. You can message the studio directly on WhatsApp, or leave a short brief here first.', 160);
      showActionButtons();
      return;
    }

    if (intent === 'consultation') {
      lead.service = 'Consultation';
      await botSay('Good choice. I will collect a few details so the team can prepare before calling you.', 160);
      askName();
      return;
    }

    askService();
  }

  async function askService() {
    step = 'service';
    setInput(false);
    await botSay('Which service fits your requirement best?', 140);
    showOptions([
      { label: 'Residential Design', value: 'Residential Design', tone: 'primary' },
      { label: 'Interior Design', value: 'Interior Design' },
      { label: 'Vastu Consultation', value: 'Vastu Consultation' },
      { label: 'Turnkey Execution', value: 'Turnkey Execution' },
      { label: 'Commercial / Office', value: 'Commercial / Office' },
      { label: 'Not sure yet', value: 'Not sure yet' },
    ], function(value) {
      lead.service = value;
      askProject();
    });
  }

  async function askProject() {
    step = 'project';
    setInput(false);
    await botSay('Tell me a little about the project. Location, plot/flat size, timeline, or style references are enough.', 140);
    setInput(true, 'e.g. 3BHK in Pune, 1500 sqft...');
  }

  async function askName() {
    step = 'name';
    setInput(false);
    await botSay('Who should the studio contact?', 120);
    setInput(true, 'Your name');
  }

  async function askContact() {
    step = 'contact';
    setInput(false);
    const name = lead.name ? ', <strong>' + escText(lead.name.split(/\s+/)[0]) + '</strong>' : '';
    await botSay('Thanks' + name + '. What is the best WhatsApp number or email for follow-up?', 120);
    setInput(true, '+91 number or email');
  }

  async function confirmLead() {
    step = 'confirm';
    setInput(false);
    await botSay(
      '<strong>Quick check:</strong><br>' +
      'Service: ' + escText(lead.service || 'Not sure yet') + '<br>' +
      'Brief: ' + escText(lead.project || 'Not shared') + '<br>' +
      'Contact: ' + escText(lead.phone || lead.email || 'Not shared'),
      120
    );
    showOptions([
      { label: 'Submit enquiry', value: 'submit', tone: 'primary' },
      { label: 'Edit brief', value: 'edit' },
      { label: 'Start over', value: 'restart' },
    ], function(value) {
      if (value === 'submit') finish();
      else if (value === 'edit') askProject();
      else resetFlow();
    });
  }

  async function finish() {
    step = 'done';
    setInput(false);
    saveLead();
    await botSay('Done. Your enquiry has been saved for the studio team. You can also continue on WhatsApp for a faster response.', 160);
    showActionButtons();
  }

  function resetFlow() {
    clearOptions();
    msgs.innerHTML = '';
    lead = freshLead();
    started = true;
    startFlow();
  }

  function saveLead() {
    try {
      const contact = lead.phone || lead.email || '';
      const leads = JSON.parse(localStorage.getItem('ars_leads') || '[]');
      leads.unshift({
        id: Date.now(),
        ts: new Date().toISOString(),
        source: 'chatbot',
        status: 'new',
        name: lead.name || 'Website visitor',
        email: contact.indexOf('@') > -1 ? contact : '',
        phone: contact.indexOf('@') > -1 ? '' : contact,
        project: lead.service || lead.intent || 'Website enquiry',
        message: lead.project || 'No brief shared.',
      });
      if (leads.length > 500) leads.splice(500);
      localStorage.setItem('ars_leads', JSON.stringify(leads));
    } catch (_) {}
  }

  function handleSend() {
    const val = input.value.trim();
    if (!val) return;
    clearOptions();
    addUserText(val);

    if (step === 'project') {
      lead.project = val;
      setInput(false);
      setTimeout(askName, 220);
    } else if (step === 'name') {
      lead.name = val;
      setInput(false);
      setTimeout(askContact, 220);
    } else if (step === 'contact') {
      if (val.length < 5) {
        botSay('That looks a little short. Please share a WhatsApp number or email so the team can reach you.', 80);
        input.value = '';
        return;
      }
      if (val.indexOf('@') > -1) lead.email = val;
      else lead.phone = val;
      setInput(false);
      setTimeout(confirmLead, 220);
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   PARALLAX — hero image
   ══════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const vh = window.innerHeight;
  onScroll(sy => {
    if (sy < vh) heroImg.style.transform = `scale(1.07) translateY(${sy * 0.12}px)`;
  });
})();

/* ══════════════════════════════════════════════════════════
   PROJECT CARD — stagger index
   ══════════════════════════════════════════════════════════ */
(function staggerCards() {
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.setProperty('--i', i);
  });
})();

/* ══════════════════════════════════════════════════════════
   ABOUT — PHOTO OVERLAY LIGHTBOX
   ══════════════════════════════════════════════════════════ */
(function initPhotoOverlay() {
  const overlay    = document.getElementById('photoOverlay');
  const overlayImg = document.getElementById('photoOverlayImg');
  const overlayCap = document.getElementById('photoOverlayCaption');
  const closeBtn   = document.getElementById('photoOverlayClose');
  if (!overlay) return;

  function openOverlay(src, caption) {
    overlayImg.src = src;
    overlayImg.alt = caption || '';
    overlayCap.textContent = caption || '';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  document.querySelectorAll('.about-img-clickable').forEach(function(wrap) {
    wrap.addEventListener('click', function() {
      openOverlay(wrap.dataset.src, wrap.dataset.caption);
    });
  });

  closeBtn && closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeOverlay(); });
})();

/* ══════════════════════════════════════════════════════════
   COOKIE CONSENT BANNER
   ══════════════════════════════════════════════════════════ */
(function initCookieConsent() {
  var COOKIE_KEY = 'ars_cookie_consent';
  var banner     = document.getElementById('cookieBanner');
  var acceptBtn  = document.getElementById('cookieAccept');
  var declineBtn = document.getElementById('cookieDecline');
  if (!banner) return;

  if (!localStorage.getItem(COOKIE_KEY)) {
    setTimeout(function() { banner.classList.add('visible'); }, 1800);
  }

  function dismiss(value) {
    localStorage.setItem(COOKIE_KEY, value);
    banner.classList.remove('visible');
  }

  acceptBtn  && acceptBtn.addEventListener('click',  function() { dismiss('accepted'); });
  declineBtn && declineBtn.addEventListener('click', function() { dismiss('declined'); });
})();

/* ══════════════════════════════════════════════════════════
   LAZY IMAGE LOAD
   ══════════════════════════════════════════════════════════ */
(function initLazyImages() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => obs.observe(img));
})();
