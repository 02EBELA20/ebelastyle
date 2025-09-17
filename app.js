/* ========== EBELA STYLE: Homepage JS ========== */

/**
 * Helpers for cart in localStorage
 */
const CART_KEY = 'ebela_cart';

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function setCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateHeaderCount();
}
function updateHeaderCount(){
  const countEl = document.getElementById('headerCartCount');
  if (!countEl) return;
  const items = getCart();
  const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
  countEl.textContent = totalQty;
}

/**
 * 1) Mobile navigation toggle
 */
const menuBtn = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Close drawer when link clicked (nice UX)
  mobileNav.querySelectorAll('.js-close-nav').forEach(a =>
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

/**
 * 2) Header elevation on scroll
 */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  const elev = (window.scrollY || window.pageYOffset) > 8;
  header.classList.toggle('elevated', elev);
});

/**
 * 3) Desktop mega-menu (Shop)
 */
const shopItem = document.querySelector('.has-dropdown');
if (shopItem) {
  const trigger = shopItem.querySelector('.nav-link');
  const panel = shopItem.querySelector('.mega');

  const open = (v) => {
    shopItem.classList.toggle('open', v);
    trigger.setAttribute('aria-expanded', String(v));
  };

  // Toggle on button click
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    open(!shopItem.classList.contains('open'));
  });

  // Close if click outside
  document.addEventListener('click', (e) => {
    if (!shopItem.contains(e.target)) open(false);
  });

  // Keyboard support
  shopItem.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { open(false); trigger.focus(); }
  });

  // Optional: hover open for pointer devices
  let hoverTimer;
  shopItem.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover)').matches) {
      clearTimeout(hoverTimer); open(true);
    }
  });
  shopItem.addEventListener('mouseleave', () => {
    if (window.matchMedia('(hover: hover)').matches) {
      hoverTimer = setTimeout(() => open(false), 120);
    }
  });
}

/**
 * 4) Mobile accordion inside drawer (Shop)
 */
document.querySelectorAll('.mobile-acc .acc-btn').forEach(btn => {
  const panelId = btn.getAttribute('aria-controls');
  const li = btn.closest('.mobile-acc');
  btn.addEventListener('click', () => {
    const isOpen = li.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
});

/**
 * 5) Simple hero slider (no libraries)
 */
(function slider(){
  const slider = document.querySelector('[data-slider]');
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('[data-prev]');
  const nextBtn = slider.querySelector('[data-next]');
  const dotsWrap = slider.querySelector('[data-dots]');

  let index = 0;

  // Build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  });

  function render(){
    slides.forEach((s,i)=> s.classList.toggle('is-active', i===index));
    dotsWrap.querySelectorAll('button').forEach((d,i)=>{
      d.setAttribute('aria-selected', i===index ? 'true' : 'false');
    });
  }

  function go(i){
    index = (i + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener('click', ()=> go(index - 1));
  nextBtn.addEventListener('click', ()=> go(index + 1));

  // Auto-play every 6s (stop on first user interaction)
  let auto = setInterval(()=> go(index + 1), 6000);
  [prevBtn, nextBtn, dotsWrap].forEach(el => {
    el.addEventListener('click', ()=> { if(auto){ clearInterval(auto); auto = null; } }, { once:true });
  });

  render();
})();

/**
 * 6) Add-to-cart buttons on homepage
 */
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const sku = btn.dataset.sku;
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price || 0);
    const img = btn.dataset.img;

    const cart = getCart();
    const found = cart.find(i => i.sku === sku);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ sku, name, price, img, qty: 1 });
    }
    setCart(cart);

    // Simple feedback
    btn.textContent = 'Added ✓';
    setTimeout(() => (btn.textContent = 'Add to Cart'), 1200);
  });
});

// Footer year + initial count
document.getElementById('year').textContent = new Date().getFullYear();
updateHeaderCount();
