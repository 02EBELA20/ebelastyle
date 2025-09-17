/* ===== EBELA STYLE — Checkout (localStorage based) ===== */

const list = document.getElementById('coList');
const subEl = document.getElementById('coSub');
const shipEl = document.getElementById('coShip');
const totalEl = document.getElementById('coTotal');
const form = document.getElementById('checkoutForm');

document.getElementById('year').textContent = new Date().getFullYear();

function fmt(n){ return `$${n.toFixed(2)}`; }
function shippingCost(method){ return method === 'express' ? 15 : 5; }

function renderSummary(){
  const cart = getCart();
  if (!cart.length){
    // if empty, push back to products
    location.href = 'products.html';
    return;
  }

  list.innerHTML = '';
  let subtotal = 0;
  cart.forEach(it => {
    const line = it.price * (it.qty || 1);
    subtotal += line;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img class="ci-img" src="${it.img}" alt="${it.name}">
      <div class="ci-info">
        <h3 class="ci-title">${it.name}</h3>
        ${it.size || it.color ? `<p class="ci-meta">${it.size ? 'Size: '+it.size : ''} ${it.color ? 'Color: '+it.color : ''}</p>`: ''}
        <p class="ci-price">${fmt(it.price)} × ${it.qty || 1}</p>
      </div>
      <div class="ci-line">${fmt(line)}</div>
    `;
    list.appendChild(li);
  });

  const shipMethod = (new FormData(form).get('shipping')) || 'standard';
  const ship = shippingCost(shipMethod);
  const total = subtotal + ship;

  subEl.textContent = fmt(subtotal);
  shipEl.textContent = fmt(ship);
  totalEl.textContent = fmt(total);
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'shipping') renderSummary();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Simple validation
  const fd = new FormData(form);
  const required = ['firstName','lastName','email','address','city','zip'];
  let valid = true;

  required.forEach(name => {
    const el = form.querySelector(`[name="${name}"]`);
    const err = el.parentElement.querySelector('.err');
    if (!String(fd.get(name) || '').trim()){
      valid = false;
      if (err) err.textContent = 'Required';
      el.classList.add('field-error');
    } else {
      if (err) err.textContent = '';
      el.classList.remove('field-error');
    }
  });

  // email format
  const em = fd.get('email');
  if (em && !/^\S+@\S+\.\S+$/.test(em)){
    valid = false;
    const el = form.querySelector('#email');
    const err = el.parentElement.querySelector('.err');
    if (err) err.textContent = 'Invalid email';
    el.classList.add('field-error');
  }

  if (!valid) return;

  const cart = getCart();
  let subtotal = cart.reduce((s,i)=> s + i.price * (i.qty || 1), 0);
  const shipMethod = fd.get('shipping') || 'standard';
  const ship = shippingCost(shipMethod);
  const total = subtotal + ship;

  // Create order
  const order = {
    id: 'EB' + Date.now(),
    createdAt: new Date().toISOString(),
    items: cart,
    subtotal, shipping: ship, shipMethod,
    total,
    customer: {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      email: fd.get('email'),
      phone: fd.get('phone') || '',
      address: fd.get('address'),
      city: fd.get('city'),
      state: fd.get('state') || '',
      zip: fd.get('zip'),
      country: fd.get('country') || ''
    },
    payment: { method: fd.get('payment') || 'card' }
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  setCart([]); // clear cart
  location.href = `thankyou.html?order=${encodeURIComponent(order.id)}`;
});

// initial
renderSummary();
