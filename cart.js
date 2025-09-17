/* ========= EBELA STYLE — Cart Page ========= */

const list = document.getElementById('cartList');
const empty = document.getElementById('emptyCart');
const wrap = document.getElementById('cartWrap');
const subEl = document.getElementById('subTotal');
const grandEl = document.getElementById('grandTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

document.getElementById('year').textContent = new Date().getFullYear();

function fmt(n){ return `$${n.toFixed(2)}`; }

function render(){
  const cart = getCart();
  if (!cart.length){
    empty.hidden = false; wrap.hidden = true; updateHeaderCount(); return;
  }
  empty.hidden = true; wrap.hidden = false;

  list.innerHTML = '';
  let subtotal = 0;

  cart.forEach((it, idx) => {
    const line = it.price * (it.qty || 1);
    subtotal += line;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img class="ci-img" src="${it.img}" alt="${it.name}">
      <div class="ci-info">
        <h3 class="ci-title">${it.name}</h3>
        ${it.size || it.color ? `<p class="ci-meta">${it.size ? 'Size: '+it.size : ''} ${it.color ? 'Color: '+it.color : ''}</p>`: ''}
        <p class="ci-price">${fmt(it.price)}</p>
        <div class="ci-actions">
          <div class="qty">
            <button type="button" class="qty-btn" data-idx="${idx}" data-step="-1" aria-label="Decrease">−</button>
            <input class="ci-qty" data-idx="${idx}" type="number" min="1" value="${it.qty || 1}">
            <button type="button" class="qty-btn" data-idx="${idx}" data-step="1" aria-label="Increase">+</button>
          </div>
          <button type="button" class="btn btn-sm remove" data-idx="${idx}">Remove</button>
        </div>
      </div>
      <div class="ci-line">${fmt(line)}</div>
    `;
    list.appendChild(li);
  });

  subEl.textContent = fmt(subtotal);
  grandEl.textContent = fmt(subtotal); // tax/shipping not included
  updateHeaderCount();
}

list.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  const rem = e.target.closest('.remove');
  let cart = getCart();

  if (btn){
    const i = Number(btn.dataset.idx);
    const step = Number(btn.dataset.step);
    cart[i].qty = Math.max(1, (cart[i].qty || 1) + step);
    setCart(cart); render(); return;
  }
  if (rem){
    const i = Number(rem.dataset.idx);
    cart.splice(i,1);
    setCart(cart); render(); return;
  }
});

list.addEventListener('change', (e) => {
  const qtyInput = e.target.closest('.ci-qty');
  if (!qtyInput) return;
  let cart = getCart();
  const i = Number(qtyInput.dataset.idx);
  cart[i].qty = Math.max(1, Number(qtyInput.value || 1));
  setCart(cart); render();
});

// Go to checkout
checkoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) return;
  location.href = 'checkout.html';
});

render();
