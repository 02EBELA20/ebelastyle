/* =========================
   EBELA STYLE — Products page
   Filters + Sort + URL sync + Mobile drawer
   ========================= */

(() => {

  // Shortcuts
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const toNum = v => (v === '' || v === null || v === undefined) ? null : Number(v);

  // Elements
  const elGrid      = $('#grid');
  const elCountLine = $('#countLine');
  const elChips     = $('#activeChips');
  const elSort      = $('#sortBy');

  const fCat   = $('#fCategory');
  const fColor = $('#fColor');
  const fSize  = $('#fSize');
  const fMin   = $('#fMin');
  const fMax   = $('#fMax');
  const fQ     = $('#fSearch');

  const openBtn  = $('#filtersOpen');
  const closeBtn = $('#filtersClose');
  const panel    = $('.filters');

  if (!Array.isArray(window.PRODUCTS)) {
    console.error('data/products.js not loaded.');
    if (elCountLine) elCountLine.textContent = 'Failed to load products.';
    return;
  }

  // Base data
  const ALL = window.PRODUCTS.slice();

  // Derived options
  const ALL_COLORS = [...new Set(ALL.flatMap(p => p.colors || []))].sort();
  const ALL_SIZES  = [...new Set(ALL.flatMap(p => p.sizes  || []))].sort((a,b)=>{
    const order = ['XS','S','M','L','XL','XXL']; // naive
    return (order.indexOf(a)+1 || 999) - (order.indexOf(b)+1 || 999);
  });
  const PRICE_MAX_AUTO = Math.max(...ALL.map(p => p.price || 0)) || 300;
  const PRICE_MAX_NICE = Math.ceil(PRICE_MAX_AUTO / 10) * 10;

  // Fill color/size selects once
  function fillOptions(sel, values){
    const frag = document.createDocumentFragment();
    values.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      frag.appendChild(o);
    });
    sel.appendChild(frag);
  }
  fillOptions(fColor, ALL_COLORS);
  fillOptions(fSize,  ALL_SIZES);
  fMin.placeholder = '0';
  fMax.placeholder = String(PRICE_MAX_NICE);

  // State ↔ URL
  const url = new URL(location.href);
  const qs  = url.searchParams;
  const state = {
    category: qs.get('category') || '',
    color:    qs.get('color')    || '',
    size:     qs.get('size')     || '',
    min:      toNum(qs.get('min')),
    max:      toNum(qs.get('max')),
    q:        qs.get('q')        || '',
    sort:     qs.get('sort')     || 'pop',
    tag:      qs.get('tag')      || ''
  };

  function applyStateToUI(){
    fCat.value   = state.category;
    fColor.value = state.color;
    fSize.value  = state.size;
    fMin.value   = state.min ?? '';
    fMax.value   = state.max ?? '';
    fQ.value     = state.q;
    elSort.value = state.sort;
  }
  function writeStateToURL(){
    const u = new URL(location.href);
    const sp = u.searchParams;
    const set = (k,v) => (v !== '' && v !== null) ? sp.set(k, v) : sp.delete(k);
    set('category', state.category);
    set('color',    state.color);
    set('size',     state.size);
    set('min',      state.min);
    set('max',      state.max);
    set('q',        state.q);
    set('sort',     state.sort);
    set('tag',      state.tag);
    history.replaceState(null, '', u);
  }

  // Filter/Sort
  function applyFilters(data){
    let out = data;

    if (state.tag)      out = out.filter(p => (p.tags||[]).includes(state.tag));
    if (state.category) out = out.filter(p => p.category === state.category);
    if (state.color)    out = out.filter(p => (p.colors||[]).includes(state.color));
    if (state.size)     out = out.filter(p => (p.sizes||[]).includes(state.size));

    const min = (state.min === null || Number.isNaN(state.min)) ? 0       : state.min;
    const max = (state.max === null || Number.isNaN(state.max)) ? Infinity: state.max;
    out = out.filter(p => p.price >= min && p.price <= max);

    if (state.q) {
      const q = state.q.trim().toLowerCase();
      out = out.filter(p => p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q));
    }

    switch (state.sort) {
      case 'price-asc':  out.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': out.sort((a,b)=>b.price-a.price); break;
      case 'name-asc':   out.sort((a,b)=>a.name.localeCompare(b.name)); break;
      default: break; // 'pop' fallback
    }
    return out;
  }

  // Render
  function renderChips(){
    if (!elChips) return;
    const chips = [];
    const add = (label, key) => chips.push(`<span class="chip">${label}<button data-remove="${key}" aria-label="Remove">×</button></span>`);
    if (state.tag)      add(`Tag: ${state.tag}`, 'tag');
    if (state.category) add(state.category, 'category');
    if (state.color)    add(`Color: ${state.color}`, 'color');
    if (state.size)     add(`Size: ${state.size}`, 'size');
    if (state.min!==null) add(`Min $${state.min}`, 'min');
    if (state.max!==null) add(`Max $${state.max}`, 'max');
    if (state.q)        add(`“${state.q}”`, 'q');
    elChips.innerHTML = chips.join('');
    elChips.onclick = e => {
      const btn = e.target.closest('button[data-remove]');
      if (!btn) return;
      const key = btn.dataset.remove;
      state[key] = (key==='min' || key==='max') ? null : '';
      applyStateToUI(); writeStateToURL(); renderFromState();
    };
  }

  function cardHTML(p){
    const img = (p.images && p.images[0]) || 'assets/img/products/img/best2.jpg';
    return `
      <li>
        <article class="product-card">
          <a href="product.html?sku=${encodeURIComponent(p.sku)}" class="product-media">
            <figure>
              <img src="${img}" alt="${p.name}" loading="lazy" />
              <figcaption class="visually-hidden">${p.name}</figcaption>
            </figure>
          </a>
          <div class="product-info">
            <h3 class="product-title">${p.name}</h3>
            <p class="product-price">$${p.price.toFixed(2)}</p>
            <div class="product-actions">
              <button class="btn btn-sm add-to-cart"
                      data-sku="${p.sku}"
                      data-name="${p.name}"
                      data-price="${p.price}"
                      data-img="${img}">Add to Cart</button>
              <a class="btn btn-sm btn-ghost" href="product.html?sku=${encodeURIComponent(p.sku)}">Details</a>
            </div>
          </div>
        </article>
      </li>`;
  }

  function renderGrid(list){
    if (!elGrid) return;
    elGrid.innerHTML = list.map(cardHTML).join('') || '';
  }

  function renderFromState(){
    // sanitize price from inputs
    const minV = toNum(fMin.value);
    const maxV = toNum(fMax.value);
    state.min  = (minV === null || Number.isNaN(minV)) ? null : Math.max(0, minV);
    state.max  = (maxV === null || Number.isNaN(maxV)) ? null : Math.max(0, maxV);
    if (state.min !== null && state.max !== null && state.min > state.max) {
      const t = state.min; state.min = state.max; state.max = t;
      fMin.value = state.min; fMax.value = state.max;
    }

    const list = applyFilters(ALL);
    if (elCountLine) elCountLine.textContent = list.length ? `${list.length} product${list.length>1?'s':''}` : 'No products match';
    renderChips();
    renderGrid(list);
  }

  // Bind
  function bind(){
    openBtn?.addEventListener('click', ()=>panel?.classList.add('is-open'));
    closeBtn?.addEventListener('click',()=>panel?.classList.remove('is-open'));

    fCat.addEventListener('change',   e => { state.category = e.target.value; writeStateToURL(); renderFromState(); });
    fColor.addEventListener('change', e => { state.color    = e.target.value; writeStateToURL(); renderFromState(); });
    fSize.addEventListener('change',  e => { state.size     = e.target.value; writeStateToURL(); renderFromState(); });
    fMin.addEventListener('input',    () => { writeStateToURL(); renderFromState(); });
    fMax.addEventListener('input',    () => { writeStateToURL(); renderFromState(); });
    fQ.addEventListener('input',      e => { state.q = e.target.value; writeStateToURL(); renderFromState(); });
    elSort.addEventListener('change', e => { state.sort = e.target.value; writeStateToURL(); renderFromState(); });

    $('#clearFilters')?.addEventListener('click', () => {
      Object.assign(state, { category:'', color:'', size:'', min:null, max:null, q:'', sort: elSort.value, tag: state.tag });
      applyStateToUI(); writeStateToURL(); renderFromState();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    if (state.max !== null && (state.max < 5 || Number.isNaN(state.max))) state.max = null;
    applyStateToUI();
    bind();
    renderFromState();
  });

})();
