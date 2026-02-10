
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const root = document.documentElement;
  const strip = document.querySelector('.pages-strip');
  const pages = Array.from(document.querySelectorAll('.page[data-page]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!strip || pages.length === 0) {
    console.warn('[spa] strip/pages not found');
    return;
  }

  /* =========================
     CONFIG
  ========================= */
  const PAGE_CLASSES = ['is-home', 'is-portfolio', 'is-blog', 'is-about', 'is-inner'];
  
  /* =========================
     HELPERS
  ========================= */
  function setBodyPageClass(pageId) {
    PAGE_CLASSES.forEach(c => body.classList.remove(c));
    body.classList.add(`is-${pageId}`);

    if (pageId !== 'home') body.classList.add('is-inner');
    else body.classList.remove('is-inner');
  }

  function setActiveNav(pageId) {
    document.querySelectorAll('.nav-pill').forEach(btn => {
      btn.classList.toggle('nav-pill--active', btn.dataset.target === pageId);
    });
  }

  function setActivePage(pageId) {
    pages.forEach(p =>
      p.classList.toggle('is-active', p.dataset.page === pageId)
    );
  }

  function applyStagger(pageId) {
    const page = pages.find(p => p.dataset.page === pageId);
    if (!page) return;

    const list = page.querySelectorAll('.video-card, .lesson-card');
    if (!list.length) return;

    page.classList.remove('is-enter');
    list.forEach((el, i) => {
      el.style.setProperty('--stagger', i);
    });

    requestAnimationFrame(() => {
      page.classList.add('is-enter');
    });
  }

  function setScene(pageId, index) {
    root.dataset.scene = pageId;
    root.style.setProperty('--page-index', index);
  }

  /* =========================
     CORE NAVIGATION
  ========================= */
  function goToPage(pageId, { instant = false } = {}) {
    const index = pages.findIndex(p => p.dataset.page === pageId);
    if (index === -1) return;

    setScene(pageId, index);

    // управление transition
    strip.style.transition = instant ? 'none' : 'transform .55s cubic-bezier(.19,1,.22,1)';

const current = document.querySelector('.page.is-active')?.dataset.page || 'home';
const isLeavingHome = current === 'home' && pageId !== 'home';
const isGoingHome = current !== 'home' && pageId === 'home';

const lamp = document.querySelector('.inner-lamp');

// прячем хром только если реально пересекаем границу home <-> inner
if (isLeavingHome || isGoingHome) {
  body.classList.add('chrome-hidden');
}

    // двигаем ленту
    strip.style.transform = `translateX(${-index * 100}%)`;

    setBodyPageClass(pageId);
    setActiveNav(pageId);
    setActivePage(pageId);
    applyStagger(pageId);

    // после завершения слайда — показываем хром (если не home)
    const onDone = () => {
      strip.removeEventListener('transitionend', onDone);

// показываем хром только если пришли на inner из home
if (isLeavingHome) {
  body.classList.remove('chrome-hidden');
}

// --- Lamp control ---
if (lamp) {
  if (pageId === 'home') {
    lamp.classList.remove('is-on');
  } else {
    // позиция лампы = текущая страница
    // index: 0 home, 1 portfolio, 2 blog, 3 about
    lamp.style.left = `${index * 100}%`;

    // "включение" с микрозадержкой, чтобы совпало с ощущением перехода
    lamp.classList.remove('is-on');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lamp.classList.add('is-on'));
    });
  }
}

// если пришли на home — оставляем скрытым (там он и должен быть скрыт)
if (pageId === 'home') {
  body.classList.add('chrome-hidden');
}

      // перепривязка автоскролла
      if (window.__bindChromeScroller) {
        const active = document.querySelector('.page.is-active');
        const scroller = active?.querySelector('.page-body') || active;
        window.__bindChromeScroller(scroller);
      }
    };

    strip.addEventListener('transitionend', onDone, { once: true });

    // вернуть transition, если instant
if (instant) {
  requestAnimationFrame(() => {
    strip.style.transition = 'transform .55s cubic-bezier(.19,1,.22,1)';
    if (pageId === 'home') body.classList.add('chrome-hidden');
    else body.classList.remove('chrome-hidden');
  });
}
  }

  /* =========================
     EVENT DELEGATION (кнопки)
  ========================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-goto');
    if (!btn) return;

    e.preventDefault();
    const target = btn.dataset.target;
    if (!target) return;

    goToPage(target);
  });

  /* =========================
     START PAGE
  ========================= */
  let startPage = 'home';
  if (body.classList.contains('is-portfolio')) startPage = 'portfolio';
  if (body.classList.contains('is-blog')) startPage = 'blog';
  if (body.classList.contains('is-about')) startPage = 'about';

  goToPage(startPage, { instant: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      body.classList.add('fonts-ready');
    });
  } else {
    body.classList.add('fonts-ready');
  }

  window.addEventListener('load', () => {
    body.classList.remove('is-loading');
    body.classList.add('is-loaded');
  });

  // fallback if load event is delayed
  setTimeout(() => {
    body.classList.remove('is-loading');
    body.classList.add('is-loaded');
  }, 2200);

  /* =========================
     CINEMA PARALLAX
  ========================= */
  const isMobile = window.matchMedia('(max-width: 900px)');
  if (!reduceMotion.matches && !isMobile.matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function onPointer(event) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const xNorm = (event.clientX / w) - 0.5;
      const yNorm = (event.clientY / h) - 0.5;

      targetX = clamp(xNorm * 2, -1, 1);
      targetY = clamp(yNorm * 2, -1, 1);
    }

    function onOrientation(event) {
      if (event.beta == null || event.gamma == null) return;
      const x = clamp((event.gamma || 0) / 35, -1, 1);
      const y = clamp((event.beta || 0) / 35, -1, 1);
      targetX = x;
      targetY = y;
    }

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      root.style.setProperty('--parallax-x', currentX.toFixed(3));
      root.style.setProperty('--parallax-y', currentY.toFixed(3));

      requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrientation, true);
    tick();
  }
});

/* =========================
   AUTO-HIDE CHROME ON SCROLL
========================= */
(function setupChromeAutoHide() {
  const THRESHOLD = 12;
  let lastY = 0;
  let acc = 0;
  let currentScroller = null;

  function bindTo(scroller) {
    if (!scroller || scroller === currentScroller) return;

    currentScroller = scroller;
    lastY = scroller.scrollTop || 0;
    acc = 0;

    scroller.addEventListener('scroll', () => {
      const y = scroller.scrollTop || 0;
      const dy = y - lastY;
      lastY = y;

      if (y <= 2) {
        document.body.classList.remove('chrome-hidden');
        acc = 0;
        return;
      }

      acc += dy;

      if (acc > THRESHOLD) {
        document.body.classList.add('chrome-hidden');
        acc = 0;
      } else if (acc < -THRESHOLD) {
        document.body.classList.remove('chrome-hidden');
        acc = 0;
      }
    }, { passive: true });
  }

  window.__bindChromeScroller = bindTo;
})();


(function initVideoModalUniversal() {
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoModalFrame');
  const dialog = modal?.querySelector('.modal__dialog');
  const backdrop = modal?.querySelector('.modal__backdrop');

  const mYear  = document.getElementById('videoModalYear');
  const mTitle = document.getElementById('videoModalTitle');
  const mDesc  = document.getElementById('videoModalDesc');

  if (!modal || !frame) {
    console.warn('[modal] #videoModal or #videoModalFrame not found');
    return;
  }

  let currentList = [];
  let currentIndex = -1;
  let moved = false;
  let startY = 0;
  const MOVE_THRESHOLD = 8;

  function stopVideo() { frame.src = ''; }

  function withAutoplay(url) {
    if (!url) return '';
    if (/autoplay=1/.test(url)) return url;
    return url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
  }

  function getSourceRect(el) {
    const source = el.querySelector('.video-thumb') || el.querySelector('.lesson-thumb') || el;
    return source.getBoundingClientRect();
  }

  function animateOpenFrom(el) {
    if (!dialog) return;
    const srcRect = getSourceRect(el);

    modal.classList.add('is-open');
    modal.classList.remove('is-closing');

    dialog.style.transition = 'none';
    dialog.style.opacity = '0';

    const dialogRect = dialog.getBoundingClientRect();
    const dx = (srcRect.left + srcRect.width / 2) - (dialogRect.left + dialogRect.width / 2);
    const dy = (srcRect.top + srcRect.height / 2) - (dialogRect.top + dialogRect.height / 2);
    const scale = Math.min(1, srcRect.width / dialogRect.width);

    modal.dataset.dx = String(dx);
    modal.dataset.dy = String(dy);
    modal.dataset.scale = String(scale);

    dialog.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;

    requestAnimationFrame(() => {
      dialog.style.transition = 'transform .45s cubic-bezier(.22,.61,.36,1), opacity .35s ease';
      dialog.style.transform = 'translate(-50%, -50%) scale(1)';
      dialog.style.opacity = '1';
    });
  }

  function animateClose() {
    if (!dialog) return;
    const dx = parseFloat(modal.dataset.dx || '0');
    const dy = parseFloat(modal.dataset.dy || '0');
    const scale = parseFloat(modal.dataset.scale || '0.9');

    modal.classList.add('is-closing');
    dialog.style.transition = 'transform .35s cubic-bezier(.22,.61,.36,1), opacity .25s ease';
    dialog.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;
    dialog.style.opacity = '0';
  }

  function openEl(el, index) {
  currentIndex = index;

  const url = (el.dataset.video || '').trim();

  const year  = (el.dataset.year  || el.querySelector('.video-year,.lesson-kicker')?.textContent || '').trim();
  const title = (el.dataset.title || el.querySelector('.video-title,.lesson-title,h2,h3')?.textContent || '').trim();
  const desc  = (el.dataset.desc  || el.querySelector('.video-desc,.lesson-desc,p')?.textContent || '').trim();

  if (mYear)  mYear.textContent = year;
  if (mTitle) mTitle.textContent = title;
  if (mDesc)  mDesc.textContent = desc;

  // 1) сначала открываем модалку
  animateOpenFrom(el);
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // 2) потом (на следующий кадр) ставим src
  stopVideo();
  requestAnimationFrame(() => {
    // важно: иногда помогает "пересоздать" src строго после display:block
    frame.src = url;
  });
}

  function openByIndex(i) {
    if (!currentList.length) return;
    if (i < 0) i = currentList.length - 1;
    if (i >= currentList.length) i = 0;
    openEl(currentList[i], i);
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    animateClose();
    modal.setAttribute('aria-hidden', 'true');

    const onEnd = () => {
      modal.classList.remove('is-open', 'is-closing');
      dialog.style.transition = '';
      dialog.style.transform = '';
      dialog.style.opacity = '';
      stopVideo();
      document.body.classList.remove('modal-open');
    };

    dialog.addEventListener('transitionend', onEnd, { once: true });
  }

  function next() { openByIndex(currentIndex + 1); }
  function prev() { openByIndex(currentIndex - 1); }

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0]?.clientY || 0;
    moved = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0]?.clientY || 0;
    if (Math.abs(y - startY) > MOVE_THRESHOLD) moved = true;
  }, { passive: true });

  // ---------------------------
  // CLICK HANDLER (Portfolio + Blog)
  // ---------------------------
  document.addEventListener('click', (e) => {
    if (moved) return;
    // 1) BLOG: lesson-card
    const lessonCard = e.target.closest('#blog-lessons .lesson-card[data-video]');
    if (lessonCard) {
      const wrap = document.getElementById('blog-lessons');
      if (!wrap) return;

      currentList = Array.from(wrap.querySelectorAll('.lesson-card[data-video]'))
        .filter(el => (el.dataset.video || '').trim().length > 0);

      const idx = currentList.indexOf(lessonCard);
      if (idx === -1) return;

      openEl(lessonCard, idx);
      return;
    }

    // 2) PORTFOLIO: video-card (учитываем фильтр .is-hidden)
    const card = e.target.closest('#portfolio-grid .video-card[data-video]');
    if (card) {
      const grid = document.getElementById('portfolio-grid');
      if (!grid) return;

      currentList = Array.from(grid.querySelectorAll('.video-card[data-video]'))
        .filter(el => !el.classList.contains('is-hidden'))
        .filter(el => (el.dataset.video || '').trim().length > 0);

      const idx = currentList.indexOf(card);
      if (idx === -1) return;

      openEl(card, idx);
      return;
    }
  });

  // ---------------------------
  // MODAL CONTROLS
  // ---------------------------
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
    if (e.target.closest('[data-modal-next]')) next();
    if (e.target.closest('[data-modal-prev]')) prev();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();

(function initPortfolioFilters() {
  const grid = document.getElementById('portfolio-grid');
  const filters = document.getElementById('portfolio-filters');
  if (!grid || !filters) {
    console.warn('[filters] #portfolio-grid or #portfolio-filters not found');
    return;
  }

  function norm(s) {
    return (s || '').toString().trim().toLowerCase();
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const filter = norm(btn.dataset.filter || 'all');

    // active state
    filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    // show/hide cards
    grid.querySelectorAll('.video-card').forEach(card => {
      const cat = norm(card.dataset.category || '');
      const ok = (filter === 'all') || cat.includes(filter);
      card.classList.toggle('is-hidden', !ok);
    });
  });
})();


// mobileScrollDarken removed: it caused unintended auto-navigation on scroll
