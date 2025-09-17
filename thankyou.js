/* ===== EBELA STYLE — Thank You page ===== */
document.getElementById('year').textContent = new Date().getFullYear();

function fmt(n){ return `$${n.toFixed(2)}`; }
const $ = (s,root=document)=> root.querySelector(s);

const id = new URLSearchParams(location.search).get('order');
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const order = orders.find(o => o.id === id);

if (!order){
  document.querySelector('.thankyou').innerHTML = `
    <div class="form-card">
      <h2>Order not found</h2>
      <p>We couldn't find this order. It may have expired or been removed.</p>
      <p><a class="btn btn-primary" href="products.html">Shop Now</a></p>
    </div>
  `;
} else {
  $('#tyOrder').textContent = `Order #${order.id}`;
  $('#tyShip').textContent = `${order.customer.firstName} ${order.customer.lastName}
  — ${order.customer.address}, ${order.customer.city}, ${order.customer.state || ''} ${order.customer.zip}, ${order.customer.country || ''}`;

  const ul = $('#tyItems');
  ul.innerHTML = '';
  order.items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    const line = it.price * (it.qty || 1);
    li.innerHTML = `
      <img class="ci-img" src="${it.img}" alt="${it.name}">
      <div class="ci-info">
        <h3 class="ci-title">${it.name}</h3>
        ${it.size || it.color ? `<p class="ci-meta">${it.size ? 'Size: '+it.size : ''} ${it.color ? 'Color: '+it.color : ''}</p>`: ''}
        <p class="ci-price">$${it.price.toFixed(2)} × ${it.qty || 1}</p>
      </div>
      <div class="ci-line">${fmt(line)}</div>
    `;
    ul.appendChild(li);
  });

  $('#tySub').textContent = fmt(order.subtotal);
  $('#tyShipCost').textContent = fmt(order.shipping);
  $('#tyTotal').textContent = fmt(order.total);
}
