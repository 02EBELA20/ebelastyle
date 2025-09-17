/* ========= EBELA STYLE — Product Details (uses global CATALOG) ========= */

const $ = (s,root=document)=> root.querySelector(s);
const $$ = (s,root=document)=> Array.from(root.querySelectorAll(s));

const params = new URLSearchParams(location.search);
const SKU = params.get('sku');

const product = CATALOG.find(p => p.sku === SKU) || CATALOG[0]; // fallback
document.getElementById('year').textContent = new Date().getFullYear();

function render(){
  if (!product){ document.body.innerHTML = "<p style='padding:24px'>Product not found.</p>"; return; }

  // Title, price, desc
  $('#pdpName').textContent = product.name;
  $('#pdpPrice').textContent = `$${product.price.toFixed(2)}`;
  $('#pdpDesc').textContent = product.desc;

  // Images
  const hero = $('#pdpHero');
  hero.src = product.images[0];
  hero.alt = product.name;

  const thumbs = $('#pdpThumbs');
  thumbs.innerHTML = '';
  product.images.forEach((src, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button class="thumb ${i===0?'is-active':''}" aria-label="View image ${i+1}">
      <img src="${src}" alt="${product.name} - ${i+1}" /></button>`;
    thumbs.appendChild(li);
  });
  thumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb'); if(!btn) return;
    $$('.thumb', thumbs).forEach(b=> b.classList.remove('is-active'));
    btn.classList.add('is-active');
    hero.src = btn.querySelector('img').src;
  });

  // Colors
  const colorsWrap = $('#pdpColors');
  product.colors.forEach(c => {
    const id = `color-${c}`;
    colorsWrap.insertAdjacentHTML('beforeend', `
      <label class="swatch" title="${c}">
        <input type="radio" name="color" value="${c}" ${c===product.colors[0]?'checked':''}>
        <span class="dot" data-color="${c}"></span> <span class="swatch-text">${c}</span>
      </label>`);
  });

  // Sizes
  const sizesWrap = $('#pdpSizes');
  product.sizes.forEach(s => {
    sizesWrap.insertAdjacentHTML('beforeend', `
      <label class="chip"><input type="radio" name="size" value="${s}" ${s===product.sizes[0]?'checked':''}> ${s}</label>
    `);
  });

  // Qty controls
  const qtyInput = $('#qty');
  $$('.qty-btn').forEach(b => {
    b.addEventListener('click', () => {
      const step = Number(b.dataset.step);
      qtyInput.value = Math.max(1, Number(qtyInput.value || 1) + step);
    });
  });

  // Add to cart
  $('#pdpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const color = fd.get('color');
    const size  = fd.get('size');
    const qty   = Math.max(1, Number(fd.get('qty') || 1));

    const cart = getCart();
    const key = `${product.sku}-${size}-${color}`;
    const found = cart.find(i => (i.key === key) || (i.sku === product.sku && i.size === size && i.color === color));

    if (found) found.qty += qty;
    else cart.push({
      key, sku: product.sku, name: product.name,
      price: product.price, img: product.images[0],
      size, color, qty
    });

    setCart(cart);

    const btn = $('#addBtn');
    btn.textContent = 'Added ✓';
    setTimeout(()=> btn.textContent = 'Add to Cart', 1000);
  });
}

render();
