/**
 * Margway Institute – script.js
 * Production-ready JS: nav, lang switch, carousel, FAQ, form, scroll effects
 */

'use strict';

/* =====================================================
   UTILITY
   ===================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =====================================================
   LANGUAGE SYSTEM
   ===================================================== */

let currentLang = 'en';

const langConfig = {
  en: { label: 'हिन्दी', htmlLang: 'en', dir: 'ltr' },
  hi: { label: 'English', htmlLang: 'hi', dir: 'ltr' },
};

function applyLanguage(lang) {
  const config = langConfig[lang];
  document.documentElement.lang = config.htmlLang;
  document.documentElement.dir = config.dir;

  // Update toggle label to show "switch to" option
  const toggleLabel = $('#langLabel');
  if (toggleLabel) toggleLabel.textContent = config.label;

  // Swap all data-en / data-hi attributes
  $$('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (!text) return;

    // Preserve child elements — only update textContent / placeholders
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else if (el.children.length === 0) {
      el.textContent = text;
    } else {
      // For mixed-content elements, swap aria-label if present
      if (el.hasAttribute('aria-label')) {
        el.setAttribute('aria-label', text);
      }
    }
  });

  currentLang = lang;
  try { localStorage.setItem('mw_lang', lang); } catch (e) { /* ignore */ }
}

function initLanguage() {
  const btn = $('#langToggle');
  if (!btn) return;

  // Restore preference
  let saved = 'en';
  try { saved = localStorage.getItem('mw_lang') || 'en'; } catch (e) { /* ignore */ }
  if (saved !== 'en') applyLanguage(saved);

  btn.addEventListener('click', () => {
    const next = currentLang === 'en' ? 'hi' : 'en';
    applyLanguage(next);
  });
}

/* =====================================================
   NAVBAR
   ===================================================== */

function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  if (!navbar) return;

  // Scroll state
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    // Close on link click
    $$('.nav-link', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active link on scroll
  const sections = $$('section[id]');
  const navAnchors = $$('.nav-link');

  const highlightNav = () => {
    const scrollY = window.scrollY + 90;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
}

/* =====================================================
   BACK TO TOP
   ===================================================== */

function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =====================================================
   SCROLL REVEAL
   ===================================================== */

function initScrollReveal() {
  const revealTargets = $$('.program-card, .why-card, .story-card, .about-card, .faq-item, .contact-item');

  revealTargets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* =====================================================
   TESTIMONIALS CAROUSEL
   ===================================================== */

function initCarousel() {
  const track = $('#storiesTrack');
  const prevBtn = $('#storiesPrev');
  const nextBtn = $('#storiesNext');
  const dotsContainer = $('#storiesDots');
  if (!track) return;

  const cards = $$('.story-card', track);
  let current = 0;
  let autoplayTimer = null;

  // Determine visible count based on viewport
  const getVisible = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  let visibleCount = getVisible();
  const total = cards.length;
  const maxIdx = () => total - visibleCount;

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const dotCount = maxIdx() + 1;
    for (let i = 0; i < dotCount; i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === current ? ' active' : '');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(btn);
    }
  }

  function updateDots() {
    $$('.dot', dotsContainer).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function getCardWidth() {
    if (!cards[0]) return 0;
    const gap = 24;
    const containerWidth = track.parentElement.offsetWidth;
    return (containerWidth - gap * (visibleCount - 1)) / visibleCount;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx()));
    const cardW = getCardWidth();
    const offset = current * (cardW + 24);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    // Resize cards
    cards.forEach(c => {
      c.style.minWidth = cardW + 'px';
    });
  }

  function next() { goTo(current >= maxIdx() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIdx() : current - 1); }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 5000);
  }

  function stopAutoplay() { clearInterval(autoplayTimer); }

  prevBtn && prevBtn.addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });

  // Touch / swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAutoplay(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    startAutoplay();
  });

  function init() {
    visibleCount = getVisible();
    buildDots();
    goTo(current);
    startAutoplay();
  }

  window.addEventListener('resize', () => {
    visibleCount = getVisible();
    buildDots();
    goTo(Math.min(current, maxIdx()));
  });

  init();
}

/* =====================================================
   FAQ ACCORDION
   ===================================================== */

function initFAQ() {
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-q', item);
    const ans = $('.faq-a', item);
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      $$('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = b.closest('.faq-item').querySelector('.faq-a');
        if (a) a.classList.remove('open');
      });

      // Open this one if was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        ans.classList.add('open');
      }
    });
  });
}

/* =====================================================
   BOOK DEMO FORM
   ===================================================== */

function initForm() {
  const form = $('#demoForm');
  const successEl = $('#formSuccess');
  if (!form) return;

  const requiredFields = $$('[required]', form);

  function validateField(field) {
    const empty = !field.value.trim();
    field.classList.toggle('error', empty);
    return !empty;
  }

  function validatePhone(input) {
    const val = input.value.replace(/\D/g, '');
    const valid = val.length >= 10;
    input.classList.toggle('error', !valid);
    return valid;
  }

  // Live validation on blur
  requiredFields.forEach(field => {
    field.addEventListener('blur', () => {
      if (field.id === 'phone') validatePhone(field);
      else validateField(field);
    });

    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        if (field.id === 'phone') validatePhone(field);
        else validateField(field);
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    requiredFields.forEach(field => {
      if (field.id === 'phone') {
        if (!validatePhone(field)) valid = false;
      } else {
        if (!validateField(field)) valid = false;
      }
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = currentLang === 'hi' ? 'भेजा जा रहा है…' : 'Sending…';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      form.hidden = true;
      if (successEl) successEl.hidden = false;

      // WhatsApp notification (optional deep link)
      const name = $('#studentName', form)?.value || '';
      const phone = $('#phone', form)?.value || '';
      const cls = $('#studentClass', form)?.value || '';
      const stream = $('#streamInterest', form)?.value || '';
      const city = $('#city', form)?.value || '';

      const msg = encodeURIComponent(
        `📚 *New Demo Booking – Margway Institute*\n\n` +
        `👤 Student: ${name}\n📱 Phone: ${phone}\n🏫 Class: ${cls}\n` +
        `🎯 Stream: ${stream}\n📍 City: ${city}`
      );

      // Optionally open WhatsApp with pre-filled message (uncomment to enable):
      // window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');

    }, 1200);
  });
}

/* =====================================================
   SMOOTH SCROLL POLYFILL (for older Safari)
   ===================================================== */

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* =====================================================
   COUNTER ANIMATION (for hero stats)
   ===================================================== */

function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    const value = Math.round(start + (target - start) * ease);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const stats = $$('.stat-num');
  const targets = [2000, 10, 98];
  const suffixes = ['+', '+', '%'];
  let animated = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      stats.forEach((el, i) => {
        animateCounter(el, targets[i], suffixes[i]);
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  const heroStats = $('.hero-stats');
  if (heroStats) observer.observe(heroStats);
}

/* =====================================================
   INIT
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavbar();
  initBackToTop();
  initScrollReveal();
  initCarousel();
  initFAQ();
  initForm();
  initSmoothScroll();
  initCounters();

  console.log('%c🧭 Margway Institute – margway.com', 'color:#FF9500;font-weight:bold;font-size:14px');
});
