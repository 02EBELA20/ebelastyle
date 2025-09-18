/* ===== EBELA STYLE — Checkout (LocalStorage) ===== */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; } }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c||[])); }
function getUser(){ try { return JSON.parse(localStorage.getItem('user')||'null'); } catch { return null; } }
function setOrders(arr){ localStorage.setItem('orders', JSON.stringify(arr)); }
function getOrders(){ try { return JSON.parse(localStorage.getItem('orders')||'[]'); } catch { return []; } }
function money(n){ return `$${(n||0).toFixed(2)}`; }

function updateHeaderCount(){
  const n = getCart().reduce((s,i)=> s+(i.qty||1), 0);
  const el = $('#headerCartCount'); if (el) el.textContent = String(n);
}

function renderItems(){
  const items = getCart();
  const wrap = $('#summaryItems');
  wrap.innerHTML = '';

  if (!items.length){
    wrap.innerHTML = `<div class="cart-empty"><p>No items in cart.</p><a class="btn btn-primary btn-sm" href="products.html">Start shopping</a></div>`;
    return;
  }
  items.forEach(it=>{
    const li = document.createElement('div');
    li.className = 'cart-item';
    li.innerHTML = `
      <img class="ci-img" src="${it.img}" alt="${it.name}">
      <div class="ci-info">
        <h4 class="ci-title" style="margin:0;">${it.name}</h4>
        ${it.size || it.color ? `<p class="ci-meta">${it.size? 'Size: '+it.size:''} ${it.color? 'Color: '+it.color:''}</p>`:''}
        <p class="ci-price">${money(it.price)} × ${it.qty||1}</p>
      </div>
      <div class="ci-line">${money(it.price*(it.qty||1))}</div>
    `;
    wrap.appendChild(li);
  });
}

/* ----- totals / coupons / shipping ----- */
const state = {
  subtotal: 0,
  discount: 0,
  shipping: 0,
  coupon: ''
};

function calcSubtotal(){
  return getCart().reduce((s,i)=> s + (i.price * (i.qty||1)), 0);
}

function calcShipping(country, method){
  const base = (country && country.toLowerCase() !== 'united states') ? 15 : 8;
  const extra = (method === 'express') ? 7 : 0; // express adds +7
  return base + extra;
}

function applyCoupon(code, subtotal, shipping){
  const c = (code||'').trim().toUpperCase();
  if (!c) return {discount: 0, shipping};

  // rules
  if (c === 'WELCOME10'){
    return {discount: +(subtotal * 0.10).toFixed(2), shipping};
  }
  if (c === 'SAVE15' && subtotal >= 100){
    return {discount: +(subtotal * 0.15).toFixed(2), shipping};
  }
  if (c === 'FREESHIP'){
    return {discount: 0, shipping: 0};
  }
  return {invalid: true, discount: 0, shipping};
}

function recompute(){
  const items = getCart();
  if (!items.length){ renderItems(); updateHeaderCount(); return; }

  const country = $('#country').value;
  const shipMethod = $('input[name="ship"]:checked').value;
  const coupon = $('#coupon').value;

  const subtotal = calcSubtotal();
  let shipping = calcShipping(country, shipMethod);
  let {discount, invalid, shipping: shipAfter} = applyCoupon(coupon, subtotal, shipping);
  if (typeof shipAfter === 'number') shipping = shipAfter;

  // free shipping threshold
  if (subtotal >= 120 && coupon.toUpperCase() !== 'FREESHIP') shipping = 0;

  state.subtotal = subtotal;
  state.discount = discount;
  state.shipping = shipping;
  state.coupon = coupon;

  // UI
  $('#tSubtotal').textContent = money(subtotal);
  $('#tDiscount').textContent = `-${money(discount).replace('$','')}`;
  $('#tShipping').textContent = money(shipping);
  const total = Math.max(0, subtotal - discount + shipping);
  $('#tTotal').textContent = money(total);

  // show coupon error
  const err = $('#couponErr');
  err.textContent = invalid ? 'Invalid coupon. Try WELCOME10, SAVE15 (≥ $100) or FREESHIP.' : '';
}

function prefillFromUser(){
  const u = getUser(); if (!u) return;
  const fields = ['firstName','lastName','email','phone','address','city','state','zip','country'];
  fields.forEach(k=>{
    const el = document.getElementById(k);
    if (el && !el.value) el.value = u[k] || (k==='country' ? 'United States' : '');
  });
}

function validate(form){
  let ok = true;
  form.querySelectorAll('.err').forEach(e => e.textContent = '');
  const must = ['firstName','lastName','email','address','city','country'];
  must.forEach(id=>{
    const el = document.getElementById(id);
    if (!el || !String(el.value).trim()){
      ok = false;
      const err = el.nextElementSibling; if (err) err.textContent = 'Required';
    }
  });
  const email = $('#email').value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)){ ok=false; $('#email').nextElementSibling.textContent='Invalid email'; }
  return ok;
}

/* ----- place order ----- */
$('#checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const cart = getCart();
  if (!cart.length){ location.href='cart.html'; return; }
  if (!validate(e.target)) return;

  const fd = new FormData(e.target);
  const customer = {};
  ['firstName','lastName','email','phone','address','city','state','zip','country'].forEach(k=>{
    customer[k] = String(fd.get(k)||'').trim();
  });
  // persist into user profile if logged in
  try {
    const u = JSON.parse(localStorage.getItem('user')||'null');
    if (u && u.loggedIn){
      Object.assign(u, customer);
      localStorage.setItem('user', JSON.stringify(u));
    }
  } catch {}

  recompute(); // ensure state is fresh
  const total = Math.max(0, state.subtotal - state.discount + state.shipping);

  const order = {
    id: 'E' + Date.now(),
    createdAt: new Date().toISOString(),
    items: cart.map(i => ({...i})),
    subtotal: +state.subtotal.toFixed(2),
    discount: +state.discount.toFixed(2),
    shipping: +state.shipping.toFixed(2),
    total: +total.toFixed(2),
    coupon: state.coupon || '',
    customer
  };

  const orders = getOrders();
  orders.push(order);
  setOrders(orders);

  // clear cart and go to thank you
  setCart([]);
  updateHeaderCount();
  location.href = `thankyou.html?order=${order.id}`;
});

/* ----- init ----- */
document.addEventListener('DOMContentLoaded', ()=>{
  updateHeaderCount();
  renderItems();
  prefillFromUser();
  recompute();

  $('#country').addEventListener('input', recompute);
  $$('input[name="ship"]').forEach(r => r.addEventListener('change', recompute));
  $('#coupon').addEventListener('input', ()=>{ $('#couponErr').textContent=''; });
});
