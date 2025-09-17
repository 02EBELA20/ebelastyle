/* ========= EBELA STYLE — Products Page (uses global CATALOG) ========= */

const grid = document.getElementById('productsGrid');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('filtersForm');
const clearBtn = document.getElementById('clearFilters');

const params = new URLSearchParams(location.search);
const q = (params.get('q') || '').trim().toLowerCase();
const tagParam = (params.get('tag') || '').toLowerCase();

function render(products){
  grid.innerHTML = '';
  if (!products.length){ emptyState.hidden = false; return; }
  emptyState.hidden = true;

  const fr = document.createDocumentFragment();
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <article class="product-card">
        <a class="product-media" href="product.html?sku=${encodeURIComponent(p.sku)}">
          <figure>
            <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
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
                    data-img="${p.images[0]}">Add to Cart</button>
            <a class="btn btn-sm btn-ghost" href="product.html?sku=${encodeURIComponent(p.sku)}">Details</a>
          </div>
        </div>
      </article>`;
    fr.appendChild(li);
  });
  grid.appendChild(fr);

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const { sku, name } = btn.dataset;
      const price = Number(btn.dataset.price || 0);
      const img = btn.dataset.img;
      const cart = getCart();
      const found = cart.find(i => i.sku === sku);
      if (found) found.qty += 1; else cart.push({ sku, name, price, img, qty: 1 });
      setCart(cart);
      btn.textContent = 'Added ✓'; setTimeout(()=> btn.textContent='Add to Cart', 1000);
    });
  });
}

function filterProducts(){
  const fd = new FormData(form);
  const cat = (fd.get('category') || '').toString();
  const colors = fd.getAll('color').map(String);
  const sizes = fd.getAll('size').map(String);
  const min = Number(fd.get('min') || 0);
  const max = Number(fd.get('max') || 0);
  const sort = (fd.get('sort') || 'relevance').toString();

  let items = CATALOG.slice();

  if (q) items = items.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q));
  if (tagParam) items = items.filter(p =>
    p.tags.map(t=>t.toLowerCase()).includes(tagParam) ||
    (tagParam === 'popular' && p.popular)
  );
  if (cat) items = items.filter(p => p.category === cat);
  if (colors.length) items = items.filter(p => colors.some(c => p.colors.includes(c)));
  if (sizes.length) items = items.filter(p => sizes.some(s => p.sizes.includes(s)));
  if (min) items = items.filter(p => p.price >= min);
  if (max) items = items.filter(p => p.price <= max);

  switch (sort){
    case 'price-asc': items.sort((a,b)=> a.price - b.price); break;
    case 'price-desc': items.sort((a,b)=> b.price - a.price); break;
    case 'newest': items.sort((a,b)=> (b.tags.includes('new')?1:0) - (a.tags.includes('new')?1:0)); break;
    case 'popular': items.sort((a,b)=> (b.popular?1:0) - (a.popular?1:0)); break;
  }
  render(items);
}

clearBtn.addEventListener('click', () => {
  form.reset();
  form.querySelector('input[name="category"][value=""]').checked = true;
  filterProducts();
});

form.addEventListener('submit', (e) => { e.preventDefault(); filterProducts(); });

function syncCategoryFromHash(){
  const h = location.hash.replace('#','');
  if (!h) return;
  const radio = form.querySelector(`input[name="category"][value="${h}"]`);
  if (radio){ radio.checked = true; filterProducts(); }
}
window.addEventListener('hashchange', syncCategoryFromHash);

document.getElementById('year').textContent = new Date().getFullYear();
syncCategoryFromHash();
filterProducts();
