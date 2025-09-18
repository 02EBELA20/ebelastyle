/* =========================================================
   EBELA STYLE — Account page (Orders management)
   - Render orders from localStorage
   - Reorder -> adds items back to cart
   - Delete single order
   - Manage mode: select multiple, Delete Selected, Archive Selected
   - Archived in localStorage.orders_archived
   ========================================================= */

(function () {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ----- Storage helpers ----- */
  function readLS(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function getUser() { return readLS('user', null); }

  function getOrders() {
    let orders = readLS('orders', null);
    if (!orders) {
      const u = getUser();
      orders = (u && Array.isArray(u.orders)) ? u.orders : [];
      writeLS('orders', orders);
    }
    return Array.isArray(orders) ? orders : [];
  }
  function saveOrders(orders) {
    writeLS('orders', orders);
    const u = getUser(); if (u) { u.orders = orders; writeLS('user', u); }
  }

  function getArchived() { return readLS('orders_archived', []); }
  function saveArchived(arr) { writeLS('orders_archived', arr || []); }

  function getCart() {
    return readLS('cart', []) || readLS('cartItems', []); // for backwards compatibility
  }
  function saveCart(items) {
    writeLS('cart', items);
    updateCartCountSafe();
  }
  function updateCartCountSafe() {
    const el = $('#headerCartCount'); if (!el) return;
    const q = (getCart() || []).reduce((s,i)=>s + (Number(i.qty)||0), 0);
    el.textContent = q;
  }

  function fmtMoney(n){ return `$${(Number(n)||0).toFixed(2)}`; }
  function fmtDate(iso){ try { return new Date(iso).toLocaleString(); } catch { return iso; } }

  const ordersRoot = $('#ordersList');
  const section    = ordersRoot ? ordersRoot.closest('.account-orders') : null;

  /* ----- Rendering ----- */
  function orderRowHTML(o, managing=false){
    const itemsCount = o.items.reduce((s,it)=>s + (Number(it.qty)||0), 0);
    const idSafe = String(o.id).replace(/[^a-zA-Z0-9_-]/g,'');
    const itemsHTML = o.items.map(it => `
      <li class="order-line">
        <img src="${it.img || ''}" alt="" class="order-thumb" loading="lazy">
        <div class="order-line-info">
          <div class="order-line-title">${it.name}</div>
          <div class="order-line-meta">Qty ${it.qty} · ${fmtMoney(it.price)}</div>
        </div>
        <div class="order-line-total">${fmtMoney(it.price * it.qty)}</div>
      </li>
    `).join('');

    return `
      <article class="order-card" data-order-id="${idSafe}">
        <header class="order-head">
          <div style="display:flex; align-items:center; gap:.4rem;">
            <input type="checkbox" class="order-select" ${managing?'':'hidden'}>
            <div class="order-id">
              <div class="order-id-line">Order <strong>#${idSafe}</strong></div>
              <div class="order-date">${fmtDate(o.dateISO)} — ${itemsCount} item(s)</div>
            </div>
          </div>
          <div class="order-total">${fmtMoney(o.total)}</div>
        </header>

        <div class="order-actions">
          <button class="btn btn-ghost btn-sm js-view" aria-expanded="false" aria-controls="items-${idSafe}" type="button">View items</button>
          <button class="btn btn-sm js-reorder" type="button">Reorder</button>
          <button class="btn btn-sm btn-danger js-delete" type="button">Delete</button>
        </div>

        <ul id="items-${idSafe}" class="order-items" hidden>
          ${itemsHTML}
        </ul>
      </article>
    `;
  }

  function renderOrders() {
    if (!ordersRoot) return;
    const managing = section && section.classList.contains('is-managing');
    const orders = getOrders().slice().sort((a,b)=> (new Date(b.dateISO)) - (new Date(a.dateISO)));
    ordersRoot.innerHTML = orders.length
      ? orders.map(o => orderRowHTML(o, managing)).join('')
      : `<p class="muted">No orders yet.</p>`;
  }

  /* ----- Single actions ----- */
  function toggleItems(card){
    const btn = card.querySelector('.js-view');
    const list = card.querySelector('.order-items');
    if (!btn || !list) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    list.hidden = expanded;
    btn.textContent = expanded ? 'View items' : 'Hide items';
  }

  function reorderOrder(card){
    const id = card.dataset.orderId;
    const orders = getOrders();
    const found = orders.find(o => String(o.id) === String(id));
    if (!found) return;

    const cart = getCart();
    found.items.forEach(it => {
      const i = cart.findIndex(c => c.sku === it.sku);
      if (i >= 0) cart[i].qty = (Number(cart[i].qty)||0) + (Number(it.qty)||0);
      else cart.push({ sku: it.sku, name: it.name, price: it.price, qty: it.qty, img: it.img });
    });
    saveCart(cart);
    alert('Items added to your cart.');
  }

  function deleteOrder(card){
    const id = card.dataset.orderId;
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;

    const updated = getOrders().filter(o => String(o.id) !== String(id));
    saveOrders(updated);
    card.remove();
    if (!updated.length) ordersRoot.innerHTML = `<p class="muted">No orders yet.</p>`;
  }

  /* ----- Manage mode / bulk ----- */
  const btnManage  = $('.js-bulk-toggle');
  const bulkPanel  = $('.orders-toolbar .bulk-panel');
  const chkAll     = $('#selectAll');
  const btnDelSel  = $('#bulkDelete');
  const btnArchSel = $('#bulkArchive');
  const btnDone    = $('#bulkDone');

  function setManageMode(on){
    if (!section) return;
    section.classList.toggle('is-managing', !!on);
    if (bulkPanel) bulkPanel.hidden = !on;
    renderOrders();
  }

  function getSelectedIds(){
    return $$('.order-card', ordersRoot)
      .filter(card => card.querySelector('.order-select')?.checked)
      .map(card => card.dataset.orderId);
  }

  function bulkDelete(ids){
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} order(s)? This cannot be undone.`)) return;
    const keep = getOrders().filter(o => !ids.includes(String(o.id)));
    saveOrders(keep);
    renderOrders();
  }

  function bulkArchive(ids){
    if (!ids.length) return;
    const orders = getOrders();
    const archive = getArchived();
    const move = orders.filter(o => ids.includes(String(o.id)));
    const keep  = orders.filter(o => !ids.includes(String(o.id)));
    saveOrders(keep);
    saveArchived(archive.concat(move));
    alert(`${move.length} order(s) archived.`);
    renderOrders();
  }

  /* ----- Bind DOM ----- */
  function bind(){
    if (ordersRoot) {
      ordersRoot.addEventListener('click', (e) => {
        const card = e.target.closest('.order-card'); if (!card) return;
        if (e.target.closest('.js-view'))    toggleItems(card);
        else if (e.target.closest('.js-reorder')) reorderOrder(card);
        else if (e.target.closest('.js-delete'))  deleteOrder(card);
      });
    }

    if (btnManage) {
      btnManage.addEventListener('click', () => {
        const on = !(section && section.classList.contains('is-managing'));
        setManageMode(on);
      });
    }
    if (btnDone) btnDone.addEventListener('click', () => setManageMode(false));
    if (chkAll)  chkAll.addEventListener('change', () => {
      $$('.order-select', ordersRoot).forEach(ch => ch.checked = chkAll.checked);
    });
    if (btnDelSel) btnDelSel.addEventListener('click', () => bulkDelete(getSelectedIds()));
    if (btnArchSel) btnArchSel.addEventListener('click', () => bulkArchive(getSelectedIds()));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOrders();
    bind();
    updateCartCountSafe();
  });

  /* ----- API stubs for future backend -----
     // get -> fetch('/api/orders').then(...)
     // delete -> fetch('/api/orders', {method:'DELETE', body: JSON.stringify({ids})})
     // archive -> fetch('/api/orders/archive', {method:'POST', body: JSON.stringify({ids})})
  ------------------------------------------- */
})();
