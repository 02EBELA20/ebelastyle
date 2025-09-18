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

  // parse price like "$29.00"
  function parsePrice(txt) {
    const n = Number(String(txt || '').replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  // try to extract SKU from nearest link "product.html?sku=..."
  function extractSKU(el) {
    const link = el && el.querySelector('a[href*="product.html?"]');
    if (!link) return '';
    const u = new URL(link.getAttribute('href'), location.origin);
    return u.searchParams.get('sku') || '';
  }

  // Build cart item from a button (very robust)
  function makeCartItemFromButton(btn) {
    // 1) primary data: data-* on the button
    let sku   = btn.dataset.sku   || '';
    let name  = btn.dataset.name  || '';
    let price = btn.dataset.price ? Number(btn.dataset.price) : NaN;
    let img   = btn.dataset.img   || '';
    let size  = btn.dataset.size  || '';
    let color = btn.dataset.color || '';
    let qty   = btn.dataset.qty   ? parseInt(btn.dataset.qty, 10) : NaN;

    // 2) fallback: read from the surrounding product card
    const card = btn.closest('.product-card') || btn.closest('[data-card]');
    if (card) {
      if (!name)  name  = card.querySelector('.product-title')?.textContent?.trim() || name;
      if (isNaN(price)) price = parsePrice(card.querySelector('.product-price')?.textContent);
      if (!img)   img   = card.querySelector('img')?.getAttribute('src') || img;
      if (!sku)   sku   = card.dataset.sku || extractSKU(card);
    }

    // 3) fallback: product page (gallery)
    if (!img) {
      const hero = document.querySelector('.gallery .hero-img img') ||
                   document.querySelector('.product-media img');
      if (hero) img = hero.getAttribute('src');
    }
    if (!name)  name  = document.querySelector('[data-p-title]')?.textContent?.trim() || name;
    if (isNaN(price)) price = parsePrice(document.querySelector('[data-p-price]')?.textContent);

    // 4) selections on product page
    size  = size  || document.getElementById('selectSize')?.value  || '';
    color = color || document.getElementById('selectColor')?.value || '';
    if (isNaN(qty)) {
      const q = document.getElementById('qtyInput');
      qty = q ? Math.max(1, parseInt(q.value || '1', 10)) : 1;
    }
    if (!sku) sku = name ? `no-sku:${name}` : 'sku';

    return {
      sku, name,
      price: Number(price) || 0,
      img, size, color,
      qty: Math.max(1, Number(qty) || 1),
    };
  }

  // merge rule: sku+size+color
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

      // UI feedback
      btn.classList.add('is-added');
      setTimeout(() => btn.classList.remove('is-added'), 600);
    } catch (err) {
      console.error('[AddToCart] failed:', err);
      alert('Could not add to cart. Check console for details.');
    }
  });

  // expose util (optional)
  window.__ebela = { readCart, writeCart, updateHeaderCount, money };
})();
