/**
 * Petite Maison (Брест) — Static Script (shared across V1, V2, V3)
 * Centralized YCLIENTS/social links, mobile drawer, lazy video, Lightbox <dialog>,
 * plus V2 room switcher and V3 lookbook filter & rental estimator.
 */

'use strict';

/* Укажите реальные ссылки студии один раз здесь — они обновятся во всех 3 версиях сайта */
const SITE_LINKS = {
  yclients: 'https://yclients.com/',
  instagram: 'https://instagram.com/',
  telegram: 'https://t.me/',
  phoneHref: 'tel:+375291234567',
  phoneText: '+375 (29) 123-45-67'
};

document.addEventListener('DOMContentLoaded', () => {
  applySiteLinks();
  initHeader();
  initVideoPlayer();
  initLightbox();
  initRoomSwitcher();
  initLookbookFilter();
  initEstimator();
});

function applySiteLinks() {
  document.querySelectorAll('[data-link]').forEach((el) => {
    const key = el.dataset.link;
    if (key === 'phone') {
      el.href = SITE_LINKS.phoneHref;
      if (el.textContent.trim().startsWith('+')) {
        el.textContent = SITE_LINKS.phoneText;
      }
    } else if (SITE_LINKS[key]) {
      el.href = SITE_LINKS[key];
    }
  });
}

function initHeader() {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');

  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });
  }
}

function initVideoPlayer() {
  const video = document.getElementById('studioVideo');
  const overlay = document.getElementById('videoOverlay');
  if (!video) return;

  // Fallback for browsers without native HTMLMediaElement loading="lazy"
  if (!Object.hasOwn(HTMLMediaElement.prototype, 'loading') && video.getAttribute('loading') === 'lazy') {
    if (video.hasAttribute('poster')) {
      video.dataset.poster = video.getAttribute('poster');
      video.removeAttribute('poster');
    }
    video.querySelectorAll('source').forEach((srcEl) => {
      if (srcEl.hasAttribute('src')) {
        srcEl.dataset.src = srcEl.getAttribute('src');
        srcEl.removeAttribute('src');
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (video.dataset.poster) {
          video.poster = video.dataset.poster;
          delete video.dataset.poster;
        }
        video.querySelectorAll('source[data-src]').forEach((srcEl) => {
          srcEl.src = srcEl.dataset.src;
          delete srcEl.dataset.src;
        });
        video.load();
        obs.unobserve(video);
      }
    }, { rootMargin: '200px 0px' });

    observer.observe(video);
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (video.paused) {
        video.play().then(() => overlay.classList.add('hidden')).catch(() => {});
      } else {
        video.pause();
        overlay.classList.remove('hidden');
      }
    });
    video.addEventListener('play', () => overlay.classList.add('hidden'));
    video.addEventListener('pause', () => overlay.classList.remove('hidden'));
    video.addEventListener('ended', () => overlay.classList.remove('hidden'));
  }
}

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  if (!modal || !imgEl) return;

  document.querySelectorAll('[data-lightbox-src]').forEach((card) => {
    card.addEventListener('click', () => {
      const src = card.dataset.lightboxSrc;
      const alt = card.dataset.lightboxAlt || '';
      if (!src) return;
      imgEl.src = src;
      imgEl.alt = alt;
      if (captionEl) captionEl.textContent = alt;
      modal.showModal();
    });
  });

  modal.querySelectorAll('[data-dialog-close]').forEach((btn) => {
    btn.addEventListener('click', () => modal.close());
  });

  // Fallback for browsers without closedby="any" (e.g. Safari)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      const inside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!inside) modal.close();
    });
  }

  modal.addEventListener('close', () => {
    imgEl.src = '';
    imgEl.alt = '';
    if (captionEl) captionEl.textContent = '';
  });
}

/* V2: Interactive "Залы и свет" Zone Switcher */
function initRoomSwitcher() {
  const tabs = document.querySelectorAll('[data-room-tab]');
  const panels = document.querySelectorAll('[data-room-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.roomTab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.roomPanel !== target;
      });
    });
  });
}

/* V3: Interactive Lookbook Filter */
function initLookbookFilter() {
  const buttons = document.querySelectorAll('[data-filter-btn]');
  const items = document.querySelectorAll('.lookbook-item[data-category]');
  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filterBtn;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      items.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
    });
  });
}

/* V3: Interactive Rental Format & Hours Estimator */
function initEstimator() {
  const formatBtns = document.querySelectorAll('[data-est-format]');
  const hourBtns = document.querySelectorAll('[data-est-hours]');
  const outFormat = document.getElementById('estSummaryFormat');
  const outPrice = document.getElementById('estSummaryPrice');
  const outNote = document.getElementById('estSummaryNote');
  const outIncluded = document.getElementById('estSummaryIncluded');
  if (!formatBtns.length || !hourBtns.length) return;

  const state = {
    label: 'Фотосъёмка',
    rate: 60,
    hours: 2,
    included: 'Естественный свет, камин, зеркало, балкон с цветами и гримёрная зона.'
  };

  function render() {
    let total = state.rate * state.hours;
    const hasDiscount = state.hours >= 4;
    if (hasDiscount) total = Math.round(total * 0.95);
    const hWord = state.hours === 1 ? 'час' : state.hours <= 4 ? 'часа' : 'часов';

    if (outFormat) outFormat.textContent = `${state.label} · ${state.hours} ${hWord}`;
    if (outPrice) outPrice.textContent = `от ${total} BYN`;
    if (outNote) {
      outNote.textContent = hasDiscount
        ? 'С учётом скидки 5% на аренду от 4 часов. Точное время и оплата — в YCLIENTS.'
        : 'Актуальные слоты, регистрация и онлайн-оплата — напрямую в YCLIENTS.';
    }
    if (outIncluded) outIncluded.textContent = state.included;
  }

  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      formatBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      state.label = btn.dataset.estFormat || 'Фотосъёмка';
      state.rate = parseFloat(btn.dataset.estRate || '60');
      state.included = btn.dataset.estIncluded || state.included;
      render();
    });
  });

  hourBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      hourBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      state.hours = parseInt(btn.dataset.estHours || '2', 10);
      render();
    });
  });

  render();
}
