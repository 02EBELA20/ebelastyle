/* ===== EBELA STYLE — Account (localStorage demo auth + profile + reorder) ===== */

document.getElementById('year').textContent = new Date().getFullYear();

const authViews = document.getElementById('authViews');
const accountView = document.getElementById('accountView');
const accName = document.getElementById('accName');
const accEmail = document.getElementById('accEmail');
const accAvatar = document.getElementById('accAvatar');
const ordersWrap = document.getElementById('ordersWrap');

function getUser(){ try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function isLogged(){ const u = getUser(); return !!(u && u.loggedIn); }
function fmt(n){ return `$${n.toFixed(2)}`; }

/* ========== ORDERS ========== */
function renderOrders(){
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (!orders.length){
    ordersWrap.innerHTML = `
      <div class="empty-state">
        <p class="muted" style="margin:0 0 8px;">No orders yet.</p>
        <a href="products.html" class="btn btn-primary btn-sm">Start shopping</a>
      </div>`;
    return;
  }
  const list = document.createElement('ul');
  list.className = 'cart-list';
  orders.slice().reverse().forEach(o => {
    const itemsCount = o.items.reduce((s,i)=> s+(i.qty||1), 0);
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="ci-info" style="grid-column: span 2;">
        <h3 class="ci-title">Order #${o.id}</h3>
        <p class="ci-meta">${new Date(o.createdAt).toLocaleString()} — ${itemsCount} item(s)</p>
        <details class="pdp-details">
          <summary>View items</summary>
          <ul class="cart-list" style="margin-top:8px;">
            ${o.items.map(it => `
              <li class="cart-item">
                <img class="ci-img" src="${it.img}" alt="${it.name}">
                <div class="ci-info">
                  <h4 class="ci-title">${it.name}</h4>
                  ${it.size || it.color ? `<p class="ci-meta">${it.size ? 'Size: '+it.size : ''} ${it.color ? 'Color: '+it.color : ''}</p>` : ''}
                  <p class="ci-price">${fmt(it.price)} × ${it.qty || 1}</p>
                </div>
                <div class="ci-line">${fmt(it.price*(it.qty||1))}</div>
              </li>
            `).join('')}
          </ul>
        </details>
        <div class="order-actions" style="margin-top:8px;">
          <button class="btn btn-sm btn-primary" data-reorder="${o.id}">Reorder</button>
        </div>
      </div>
      <div class="ci-line">${fmt(o.total)}</div>
    `;
    list.appendChild(li);
  });
  ordersWrap.innerHTML = '';
  ordersWrap.appendChild(list);
}

/* ========== PROFILE ========== */
function initial(str=''){
  const s = String(str||'').trim();
  return s ? s[0].toUpperCase() : 'U';
}
function fillProfileForm(){
  const u = getUser(); if (!u) return;
  const map = {
    firstName: 'pfFirst', lastName: 'pfLast', email: 'pfEmail', phone: 'pfPhone',
    address: 'pfAddress', city: 'pfCity', state: 'pfState', zip: 'pfZip', country: 'pfCountry'
  };
  Object.entries(map).forEach(([key,id])=>{
    const el = document.getElementById(id);
    if (el) el.value = u[key] || '';
  });
}
document.getElementById('profileForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const u = getUser(); if (!u) return;
  const email = String(fd.get('email')||'').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)){
    e.target.querySelector('#pfEmail + .err').textContent = 'Invalid email';
    return;
  }
  ['firstName','lastName','email','phone','address','city','state','zip','country'].forEach(k=>{
    u[k] = String(fd.get(k) || '').trim();
  });
  setUser(u);
  render(); // refresh greeting
});

/* ========== RENDER ========== */
function render(){
  if (isLogged()){
    const u = getUser();
    authViews.hidden = true;
    accountView.hidden = false;
    accName.textContent = u.firstName || 'User';
    accEmail.textContent = u.email || '';
    accAvatar.textContent = initial(u.firstName);
    fillProfileForm();
    renderOrders();
  } else {
    authViews.hidden = false;
    accountView.hidden = true;
  }
  updateAuthLink && updateAuthLink(); // refresh header greeting
}
render();

/* ---------- Sign In ---------- */
document.getElementById('signinForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = String(fd.get('email')||'').trim().toLowerCase();
  const pass = String(fd.get('password')||'').trim();

  const u = getUser();
  const emailErr = e.target.querySelector('#siEmail + .err');
  const passErr = e.target.querySelector('#siPass + .err');
  emailErr.textContent = ''; passErr.textContent = '';

  if (!u || u.email !== email){
    emailErr.textContent = 'Account not found. Please sign up.';
    return;
  }
  if (u.password !== pass){
    passErr.textContent = 'Wrong password.';
    return;
  }
  u.loggedIn = true;
  setUser(u);
  render();
});

/* ---------- Sign Up ---------- */
document.getElementById('signupForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const firstName = String(fd.get('firstName')||'').trim();
  const lastName = String(fd.get('lastName')||'').trim();
  const email = String(fd.get('email')||'').trim().toLowerCase();
  const pass = String(fd.get('password')||'').trim();
  const pass2 = String(fd.get('password2')||'').trim();

  const errs = {
    first: e.target.querySelector('#suFirst + .err'),
    last: e.target.querySelector('#suLast + .err'),
    email: e.target.querySelector('#suEmail + .err'),
    pass: e.target.querySelector('#suPass + .err'),
    pass2: e.target.querySelector('#suPass2 + .err')
  };
  Object.values(errs).forEach(el => el.textContent = '');

  if (!firstName) return (errs.first.textContent = 'Required');
  if (!lastName) return (errs.last.textContent = 'Required');
  if (!/^\S+@\S+\.\S+$/.test(email)) return (errs.email.textContent = 'Invalid email');
  if (pass.length < 4) return (errs.pass.textContent = 'Min 4 chars');
  if (pass !== pass2) return (errs.pass2.textContent = 'Passwords do not match');

  const user = { firstName, lastName, email, password: pass, loggedIn: true };
  setUser(user);
  render();
});

/* ---------- Log out ---------- */
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  const u = getUser();
  if (u){ u.loggedIn = false; setUser(u); }
  render();
});

/* ---------- Reorder ---------- */
ordersWrap.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-reorder]');
  if (!btn) return;
  const orderId = btn.dataset.reorder;
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // merge with existing cart
  const cart = getCart();
  order.items.forEach(it => {
    const idx = cart.findIndex(c => c.sku === it.sku && c.size === it.size && c.color === it.color);
    if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + (it.qty || 1);
    else cart.push({...it});
  });
  setCart(cart);
  updateHeaderCount();
  location.href = 'cart.html';
});

/* ====== CART helpers (from app.js pattern) ====== */
function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; } }
function setCart(arr){ localStorage.setItem('cart', JSON.stringify(arr || [])); }
function updateHeaderCount(){
  const c = getCart(); const n = c.reduce((s,i)=> s+(i.qty||1), 0);
  const el = document.getElementById('headerCartCount'); if (el) el.textContent = String(n);
}
