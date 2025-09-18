/* =========================
   EBELA STYLE — Product page
   ========================= */

(function () {
  const params = new URL(location.href).searchParams;
  const sku = params.get('sku');

  const DB = (window.PRODUCTS || []);
  const product = DB.find(p => p.sku === sku);

  // ელემენტები
  const $hero  = document.getElementById('heroImg');
  const $thumbs= document.getElementById('thumbs');
  const $title = document.getElementById('pdpTitle');
  const $price = document.getElementById('pdpPrice');
  const $selColor = document.getElementById('selColor');
  const $selSize  = document.getElementById('selSize');
  const $selQty   = document.getElementById('selQty');
  const $addBtn   = document.getElementById('pdpAddBtn');

  if (!product) {
    // ვერ ვიპოვეთ SKU — მარტივი მესიჯი
    if ($title) $title.textContent = 'Product not found';
    if ($hero) $hero.alt = 'Not found';
    return;
  }

  // შევსება
  $title.textContent = product.title || product.name || 'Product';
  const price = Number(product.price || 0);
  $price.textContent = `$${price.toFixed(2)}`;

  // მთავარი ფოტო
  const imgs = product.images && product.images.length ? product.images : [product.image].filter(Boolean);
  if ($hero) $hero.src = imgs[0] || '';

  // თამბების რენდერი
  if ($thumbs) {
    $thumbs.innerHTML = '';
    imgs.forEach((src, idx) => {
      const btn = document.createElement('button');
      btn.className = 'thumb' + (idx === 0 ? ' is-active' : '');
      btn.type = 'button';
      btn.innerHTML = `<img src="${src}" alt="">`;
      btn.addEventListener('click', () => {
        if ($hero) $hero.src = src;
        [...$thumbs.querySelectorAll('.thumb')].forEach(el => el.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
      $thumbs.appendChild(btn);
    });
  }

  // Color options
  const colors = product.colors && product.colors.length ? product.colors : ['black','white','grey'];
  $selColor.innerHTML = colors.map(c => `<option value="${c}">${c[0].toUpperCase()+c.slice(1)}</option>`).join('');

  // Size options
  const sizes = product.sizes && product.sizes.length ? product.sizes : ['S','M','L'];
  $selSize.innerHTML = sizes.map(s => `<option value="${s}">${s}</option>`).join('');

  // Add to Cart
  $addBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    const color = $selColor.value || '';
    const size  = $selSize.value  || '';
    const qty   = Math.max(1, parseInt($selQty.value || '1', 10));

    window.__CART__.addToCartLine({
      sku: product.sku,
      name: product.title || product.name || 'Item',
      price,
      img: imgs[0] || '',
      color, size, qty
    });
  });
})();
