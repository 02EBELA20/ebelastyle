/* ===== EBELA STYLE — Common app logic (scoped, robust) ===== */
(function () {
  /* ---------- storage helpers ---------- */
  function readCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch { return []; }
  }
  function writeCart(arr) { localStorage.setItem('cart', JSON.stringify(arr || [])); }
  function updateHeaderCount() {
    const n = readCart().reduce((s, i) => s + (Number(i.qty) || 1), 0);
    const el = document.getElementById('headerCartCount');
    if (el) el.textContent = String(n);
  }
  function money(n){ return `$${(Number(n)||0).toFixed(2)}`; }

  /* ---------- DOM ready ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    updateHeaderCount();
    initHeroSliders();      // ← დავამატეთ სლაიდერი
  });

  /* ---------- mobile drawer ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#menuToggle');
    if (!btn) return;
    const nav = document.getElementById('mobileNav');
    const exp = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!exp));
    nav.classList.toggle('is-open', !exp);
  });
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.js-close-nav');
    if (!link) return;
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('menuToggle');
    nav && nav.classList.remove('is-open');
    btn && btn.setAttribute('aria-expanded', 'false');
  });

  /* ---------- desktop mega dropdown (Shop) ---------- */
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.has-dropdown > .nav-link');
    if (toggle) {
      const li = toggle.parentElement;
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      li.classList.toggle('is-open', !expanded);
      return;
    }
    // click outside -> close all
    document.querySelectorAll('.has-dropdown.is-open .nav-link').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.parentElement.classList.remove('is-open');
    });
  });

  /* ---------- Add to Cart (works from ALL pages) ---------- */

  function parsePrice(txt) {
    const n = Number(String(txt || '').replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function extractSKU(el) {
    const link = el && el.querySelector('a[href*="product.html?"]');
    if (!link) return '';
    const u = new URL(link.getAttribute('href'), location.origin);
    return u.searchParams.get('sku') || '';
  }
  function makeCartItemFromButton(btn) {
    let sku   = btn.dataset.sku   || '';
    let name  = btn.dataset.name  || '';
    let price = btn.dataset.price ? Number(btn.dataset.price) : NaN;
    let img   = btn.dataset.img   || '';
    let size  = btn.dataset.size  || '';
    let color = btn.dataset.color || '';
    let qty   = btn.dataset.qty   ? parseInt(btn.dataset.qty, 10) : NaN;

    const card = btn.closest('.product-card') || btn.closest('[data-card]');
    if (card) {
      if (!name)  name  = card.querySelector('.product-title')?.textContent?.trim() || name;
      if (isNaN(price)) price = parsePrice(card.querySelector('.product-price')?.textContent);
      if (!img)   img   = card.querySelector('img')?.getAttribute('src') || img;
      if (!sku)   sku   = card.dataset.sku || extractSKU(card);
    }
    if (!img) {
      const hero = document.querySelector('.gallery .hero-img img') ||
                   document.querySelector('.product-media img');
      if (hero) img = hero.getAttribute('src');
    }
    if (!name)  name  = document.querySelector('[data-p-title]')?.textContent?.trim() || name;
    if (isNaN(price)) price = parsePrice(document.querySelector('[data-p-price]')?.textContent);

    size  = size  || document.getElementById('selectSize')?.value  || '';
    color = color || document.getElementById('selectColor')?.value || '';
    if (isNaN(qty)) {
      const q = document.getElementById('qtyInput');
      qty = q ? Math.max(1, parseInt(q.value || '1', 10)) : 1;
    }
    if (!sku) sku = name ? `no-sku:${name}` : 'sku';

    return { sku, name, price: Number(price) || 0, img, size, color, qty: Math.max(1, Number(qty) || 1) };
  }
  function keyFor(x){ return [x.sku, x.size || '', x.color || ''].join('|'); }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    try {
      const item = makeCartItemFromButton(btn);
      const cart = readCart();
      const i = cart.findIndex(x => keyFor(x) === keyFor(item));
      if (i > -1) cart[i].qty += item.qty; else cart.push(item);
      writeCart(cart);
      updateHeaderCount();
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 600);
    } catch (err) {
      console.error('[AddToCart] failed:', err);
      alert('Could not add to cart. Check console for details.');
    }
  });

  /* ---------- HERO SLIDER (new) ---------- */
  function initHeroSliders() {
    document.querySelectorAll('[data-slider]').forEach(setupSlider);
  }

  function setupSlider(root) {
    const slides = Array.from(root.querySelectorAll('.slide'));
    if (slides.length <= 1) return; // nothing to slide
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    let dotsWrap  = root.querySelector('[data-dots]');
    if (!dotsWrap) {
      dotsWrap = document.createElement('div');
      dotsWrap.setAttribute('data-dots','');
      dotsWrap.className = 'dots';
      root.appendChild(dotsWrap);
    }

    let i = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    if (i === -1) i = 0;
    update();

    // build dots
    dotsWrap.innerHTML = '';
    slides.forEach((_, idx) => {
      const b = document.createElement('button');
      b.className = 'dot' + (idx === i ? ' is-active' : '');
      b.setAttribute('aria-label', `Go to slide ${idx+1}`);
      b.addEventListener('click', () => { i = idx; update(true); });
      dotsWrap.appendChild(b);
    });

    prevBtn && prevBtn.addEventListener('click', () => { i = (i - 1 + slides.length) % slides.length; update(true); });
    nextBtn && nextBtn.addEventListener('click', () => { i = (i + 1) % slides.length; update(true); });

    // autoplay (pause on hover)
    let timer = setInterval(next, 5000);
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', () => timer = setInterval(next, 5000));
    function next(){ i = (i + 1) % slides.length; update(); }

    function update(focusDot = false) {
      slides.forEach((s,idx)=> s.classList.toggle('is-active', idx === i));
      const dots = dotsWrap.querySelectorAll('.dot');
      dots.forEach((d,idx)=> d.classList.toggle('is-active', idx === i));
      if (focusDot && dots[i]) dots[i].focus({preventScroll:true});
    }
  }

  // expose util (optional)
  window.__ebela = { readCart, writeCart, updateHeaderCount, money };
})();
