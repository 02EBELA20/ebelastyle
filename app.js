/* =========================
   EBELA STYLE — shared core (fixed)
   ========================= */

/* ---------- USER / AUTH helpers (demo storage) ---------- */
function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
function setUser(u) { localStorage.setItem('user', JSON.stringify(u)); }
function isLogged() { const u = getUser(); return !!(u && u.loggedIn); }
function signOut() { localStorage.removeItem('user'); }

/* simplistic users storage for demo (DO NOT USE in production) */
function readUsers() { try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; } }
function writeUsers(list) { localStorage.setItem('users', JSON.stringify(list)); }

function signIn({ email, password }) {
  const users = readUsers();
  const u = users.find(x => x.email === email.trim());
  if (!u || u.password !== password) throw new Error('Invalid email or password.');
  setUser({ id: u.id, name: u.name, email: u.email, loggedIn: true });
  return u;
}
function signUp({ name, email, password }) {
  const users = readUsers();
  if (users.some(x => x.email === email.trim())) throw new Error('This email is already registered.');
  const u = { id: Date.now(), name: name.trim(), email: email.trim(), password };
  users.push(u); writeUsers(users);
  setUser({ id: u.id, name: u.name, email: u.email, loggedIn: true });
  return u;
}

/* ---------- HEADER: ensure Account link exists ---------- */
function ensureAccountLink() {
  const nav = document.querySelector('.main-nav .nav-list');
  if (nav && !nav.querySelector('#accountLink')) {
    const li = document.createElement('li');
    li.className = 'nav-account';
    li.innerHTML = `<a href="account.html" id="accountLink">Sign In</a>`;
    nav.appendChild(li);
  }
  const mnav = document.querySelector('#mobileNav ul');
  if (mnav && !mnav.querySelector('#mAccountLink')) {
    const li = document.createElement('li');
    li.className = 'mobile-account';
    li.innerHTML = `<a href="account.html" id="mAccountLink" class="js-close-nav">Sign In</a>`;
    mnav.appendChild(li);
  }
  updateAuthLink();
}
function updateAuthLink() {
  const a1 = document.getElementById('accountLink');
  const a2 = document.getElementById('mAccountLink');
  const u = getUser();
  const label = u && u.loggedIn ? 'Account' : 'Sign In';
  if (a1) a1.textContent = label;
  if (a2) a2.textContent = label;
}
document.addEventListener('DOMContentLoaded', ensureAccountLink);
window.addEventListener('storage', updateAuthLink);

/* ---------- CART count helper ---------- */
function readCart() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } }
function updateCartCount(cart = readCart()) {
  const el = document.querySelector('[data-cart-count]') || document.querySelector('.cart-count');
  if (el) el.textContent = cart.reduce((n, i) => n + (i.qty || 0), 0);
}
document.addEventListener('DOMContentLoaded', () => updateCartCount());

/* expose simple cart add (reused on PDP) */
function addToCartLine(line) {
  const cart = readCart();
  const key = `${line.sku}|${line.color||''}|${line.size||''}`;
  const found = cart.find(i => `${i.sku}|${i.color||''}|${i.size||''}` === key);
  if (found) found.qty += line.qty || 1;
  else cart.push({ ...line, qty: line.qty || 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount(cart);

  const btn = document.getElementById('pdpAddBtn');
  if (btn) {
    const t = btn.textContent;
    btn.disabled = true; btn.textContent = 'Added ✓';
    setTimeout(()=>{btn.disabled=false; btn.textContent=t;}, 900);
  }
}
window.__CART__ = { addToCartLine };

/* =========================================================
   ADD TO CART — BULLETPROOF GLOBAL DELEGATION
   მუშაობს: Home/Most Popular, Products grid, PDP.
   არ საჭიროებს სპეციალურ data-ატრიბუტებს (მაგრამ რომ ქონდეს — უკეთესია).
   ========================================================= */

/* Helpers to extract SKU anywhere */
function parseSkuFromHref(href) {
  if (!href) return '';
  try {
    const url = new URL(href, location.href);
    return url.searchParams.get('sku') || '';
  } catch { return ''; }
}
function findSku(scope, btn) {
  // 1) explicit data-sku on button
  if (btn && btn.dataset && btn.dataset.sku) return btn.dataset.sku;

  // 2) data-sku on card/container
  const host = btn ? btn.closest('[data-sku]') : null;
  if (host && host.dataset.sku) return host.dataset.sku;

  // 3) any nested element with data-sku
  const nest = (scope || document).querySelector('[data-sku]');
  if (nest && nest.dataset.sku) return nest.dataset.sku;

  // 4) details/product link: product.html?sku=...
  const link = (scope || document).querySelector('a[href*="product.html"]')
           || (btn ? btn.parentElement?.querySelector('a[href*="product.html"]') : null);
  const skuFromLink = parseSkuFromHref(link?.getAttribute('href'));
  if (skuFromLink) return skuFromLink;

  return '';
}
function findQty(scope, btn) {
  if (btn?.dataset?.qty) {
    const v = Number(btn.dataset.qty);
    if (v > 0) return v;
  }
  const byName = scope?.querySelector?.('[name="qty"], [name="quantity"]');
  if (byName) return Math.max(1, Number(byName.value || 1));
  const inQty = scope?.querySelector?.('.qty input');
  if (inQty) return Math.max(1, Number(inQty.value || 1));
  return 1;
}
function looksLikeAddButton(el) {
  if (!el) return false;
  if (el.matches('[data-add-to-cart], .js-add-to-cart, .add-to-cart, .btn-add, [data-action="add"]')) return true;
  const txt = (el.textContent || '').trim().toLowerCase();
  return txt === 'add to cart' || txt === 'add';
}

/* The actual delegation */
document.addEventListener('click', (e) => {
  const clickable = e.target.closest('button, a');
  if (!clickable) return;

  // only handle if it "looks like" an Add to Cart
  if (!looksLikeAddButton(clickable)) return;

  // don't navigate
  e.preventDefault();
  e.stopPropagation();

  // scope = product card / pdp form
  const scope =
    clickable.closest('[data-pdp], .product-detail, .product-card, li, article, section') || document;

  const sku   = findSku(scope, clickable);
  const qty   = findQty(scope, clickable);
  const color = scope.querySelector?.('[name="color"]')?.value || clickable.dataset?.color || '';
  const size  = scope.querySelector?.('[name="size"]')?.value  || clickable.dataset?.size  || '';

  if (!sku) { console.warn('Add to Cart: missing SKU'); return; }

  addToCartLine({ sku, qty, color, size });

  // tiny toast
  const t = document.createElement('div');
  t.textContent = 'Added to cart';
  t.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
    'background:#111;color:#fff;border:1px solid #2a2a2a;padding:10px 14px;' +
    'border-radius:10px;z-index:9999';
  document.body.appendChild(t); setTimeout(()=>t.remove(), 1100);
});

/* ---------- ACCOUNT PAGE controller ---------- */
function bindAccountPage() {
  const authSection = document.getElementById('authSection');
  const accountView = document.getElementById('accountView');
  if (!authSection && !accountView) return; // not on account.html

  const loginCard = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const goRegister = document.getElementById('goRegister');
  const goLogin = document.getElementById('goLogin');

  function showAuth() {
    authSection.removeAttribute('hidden');
    accountView?.setAttribute('hidden', '');
    loginCard.hidden = false;
    registerCard.hidden = true;
    updateAuthLink();
  }
  function showRegister() {
    authSection.removeAttribute('hidden');
    accountView?.setAttribute('hidden', '');
    loginCard.hidden = true;
    registerCard.hidden = false;
  }
  function showAccount() {
    authSection.setAttribute('hidden', '');
    accountView?.removeAttribute('hidden');
    const u = getUser();
    document.querySelectorAll('.user-name').forEach(el => el.textContent = (u?.name || u?.email || '—'));
    updateAuthLink();
  }

  if (isLogged()) showAccount(); else showAuth();

  goRegister?.addEventListener('click', showRegister);
  goLogin?.addEventListener('click', showAuth);

  document.getElementById('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email')||'').trim();
    const password = String(fd.get('password')||'');
    const err = document.getElementById('loginErr');
    err.textContent = '';
    try { signIn({ email, password }); showAccount(); }
    catch (ex) { err.textContent = ex.message || 'Sign in failed.'; }
  });

  document.getElementById('registerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name')||'').trim();
    const email = String(fd.get('email')||'').trim();
    const password = String(fd.get('password')||'');
    const password2 = String(fd.get('password2')||'');
    const err = document.getElementById('regErr');
    err.textContent = '';
    if (password !== password2) { err.textContent = 'Passwords do not match.'; return; }
    try { signUp({ name, email, password }); showAccount(); }
    catch (ex) { err.textContent = ex.message || 'Registration failed.'; }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => { signOut(); showAuth(); });

  const manageBtn = document.getElementById('manageOrdersBtn');
  const bulkPanel = document.getElementById('bulkPanel');
  manageBtn?.addEventListener('click', () => { bulkPanel.hidden = false; manageBtn.hidden = true; document.querySelector('.account-orders')?.classList.add('is-managing'); });
  document.getElementById('bulkCancel')?.addEventListener('click', () => { bulkPanel.hidden = true; manageBtn.hidden = false; document.querySelector('.account-orders')?.classList.remove('is-managing'); });
}
document.addEventListener('DOMContentLoaded', bindAccountPage);

/* ---------- HERO SLIDER (auto-play + pause on hover/focus) ---------- */
function initHeroSlider() {
  const root = document.querySelector('.hero-slider');
  if (!root) return;
  const slides = [...root.querySelectorAll('.slide')];
  if (!slides.length) return;

  const dotsWrap = root.querySelector('.dots') || (() => {
    const d = document.createElement('div'); d.className = 'dots'; root.appendChild(d); return d;
  })();

  let i = slides.findIndex(s => s.classList.contains('is-active'));
  if (i < 0) i = 0;

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    [...dotsWrap.children].forEach((d, idx) => {
      d.setAttribute('aria-selected', String(idx === i));
      d.classList.toggle('is-active', idx === i);
    });
  }

  dotsWrap.innerHTML = '';
  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('aria-selected', String(idx === i));
    b.addEventListener('click', () => { show(idx); restart(); });
    dotsWrap.appendChild(b);
  });
  show(i);

  root.querySelector('.slider-btn.prev')?.addEventListener('click', () => { show(i - 1); restart(); });
  root.querySelector('.slider-btn.next')?.addEventListener('click', () => { show(i + 1); restart(); });

  let x0 = null;
  root.addEventListener('pointerdown', e => { x0 = e.clientX; });
  root.addEventListener('pointerup', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });

  // --- AUTOPLAY ---
  const INTERVAL = 5000; // ms
  let timer = null;
  function play(){ stop(); timer = setInterval(() => show(i + 1), INTERVAL); }
  function stop(){ if (timer) { clearInterval(timer); timer = null; } }
  function restart(){ play(); }

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', play);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());

  play();
}
document.addEventListener('DOMContentLoaded', initHeroSlider);
