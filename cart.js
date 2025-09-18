/* ===== EBELA STYLE — Cart page (scoped) ===== */
(function () {
  const $ = (s, r=document)=>r.querySelector(s);

  function readCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; } }
  function writeCart(a){ localStorage.setItem('cart', JSON.stringify(a||[])); }
  function money(n){ return `$${(Number(n)||0).toFixed(2)}`; }

  function updateHeaderCount(){
    const n = readCart().reduce((s,i)=> s+(Number(i.qty)||1), 0);
    const el = document.getElementById('headerCartCount');
    if (el) el.textContent = String(n);
  }

  function render(){
    const items = readCart();
    const empty = $('#emptyCart');
    const wrap  = $('#cartWrap');
    const list  = $('#cartList');

    if (!empty || !wrap || !list) { console.warn('[Cart] markup IDs missing'); return; }

    if (!items.length){
      empty.hidden = false;
      wrap.hidden  = true;
      $('#subTotal').textContent  = '$0.00';
      $('#grandTotal').textContent = '$0.00';
      updateHeaderCount();
      return;
    }

    empty.hidden = true;
    wrap.hidden  = false;
    list.innerHTML = '';

    items.forEach((it, idx)=>{
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.idx = String(idx);
      li.innerHTML = `
        <img class="ci-img" src="${it.img || ''}" alt="${it.name || 'Product'}">
        <div class="ci-info">
          <h3 class="ci-title">${it.name || 'Product'}</h3>
          ${it.size || it.color ? `<p class="ci-meta">${it.size?`Size: ${it.size}`:''} ${it.color?`Color: ${it.color}`:''}</p>` : ''}
          <div class="ci-actions">
            <div class="qty">
              <button class="qty-btn" data-dec>-</button>
              <input class="qty-input" type="number" min="1" value="${it.qty||1}">
              <button class="qty-btn" data-inc>+</button>
            </div>
            <button class="btn btn-sm" data-remove>Remove</button>
          </div>
        </div>
        <div class="ci-line">${money(it.price * (it.qty||1))}</div>
      `;
      list.appendChild(li);
    });

    totals();
    updateHeaderCount();
  }

  function totals(){
    const items = readCart();
    const subtotal = items.reduce((s,i)=> s + (Number(i.price)*(Number(i.qty)||1)), 0);
    $('#subTotal').textContent  = money(subtotal);
    $('#grandTotal').textContent = money(subtotal);
  }

  // events
  document.addEventListener('click', (e)=>{
    const row = e.target.closest('.cart-item');
    const items = readCart();

    if (row && e.target.closest('[data-remove]')){
      const idx = +row.dataset.idx;
      items.splice(idx,1);
      writeCart(items);
      render();
      return;
    }

    if (row && (e.target.closest('[data-dec]') || e.target.closest('[data-inc]'))){
      const idx = +row.dataset.idx;
      const it = items[idx]; if (!it) return;
      if (e.target.closest('[data-dec]')) it.qty = Math.max(1, (Number(it.qty)||1) - 1);
      if (e.target.closest('[data-inc]')) it.qty = (Number(it.qty)||1) + 1;
      writeCart(items);
      row.querySelector('.qty-input').value = it.qty;
      row.querySelector('.ci-line').textContent = money(it.price * it.qty);
      totals(); updateHeaderCount();
    }
  });

  document.addEventListener('change', (e)=>{
    const input = e.target.closest('.qty-input'); if (!input) return;
    const row = e.target.closest('.cart-item'); const idx = +row.dataset.idx;
    const items = readCart(); const it = items[idx]; if (!it) return;
    it.qty = Math.max(1, parseInt(input.value || '1', 10));
    writeCart(items);
    row.querySelector('.ci-line').textContent = money(it.price * it.qty);
    totals(); updateHeaderCount();
  });

  document.addEventListener('DOMContentLoaded', render);
})();
