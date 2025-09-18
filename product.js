/* ===== EBELA STYLE — Product page (scoped) ===== */
(function () {
  const $  = (s, r=document)=>r.querySelector(s);

  // read ?sku=
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku') || 'tee01';

  // small product map (დაამატე სურვილისამებრ)
  const DB = {
    tee01: {
      name: 'Golden Graphic Tee',
      price: 29,
      images: [
        'assets/img/products/img/tee01-1.jpg',
        'assets/img/products/img/tee01-2.jpg',
        'assets/img/products/img/tee01-3.jpg',
      ],
    },
    best2: { name:'Classic Hoodie', price:59, images:['assets/img/products/img/best2.jpg'] },
    best3: { name:'Relaxed Pants',  price:49, images:['assets/img/products/img/best3.jpg'] },
    best4: { name:'Minimal Sneakers',price:79, images:['assets/img/products/img/best4.jpg'] },
    ewl01: { name:'EWL Golden Graphic', price:32, images:['assets/img/products/img/ewl-golden-goose-april-benshosan-04-05c87c8cd8ac4835a49585763e0ef57e.jpeg'] },
  };

  const P = DB[sku] || DB.tee01;

  // Fill title/price
  const t = $('[data-p-title]');  if (t) t.textContent = P.name;
  const pr = $('[data-p-price]'); if (pr) pr.textContent = `$${P.price.toFixed(2)}`;

  // Build gallery
  const heroImg = $('.gallery .hero-img img');
  const thumbs  = $('.gallery .thumbs');
  if (heroImg && P.images.length) heroImg.src = P.images[0];
  if (thumbs) {
    thumbs.innerHTML = '';
    P.images.forEach((src, i) => {
      const b = document.createElement('button');
      b.className = 'thumb' + (i === 0 ? ' is-active' : '');
      b.innerHTML = `<img src="${src}" alt="${P.name} ${i + 1}">`;
      b.addEventListener('click', () => {
        if (heroImg) heroImg.src = src;
        thumbs.querySelectorAll('.thumb').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
      });
      thumbs.appendChild(b);
    });
  }

  // Sync Add-to-Cart dataset with selections
  const addBtn   = document.querySelector('.add-to-cart');
  const sizeSel  = document.getElementById('selectSize');
  const colorSel = document.getElementById('selectColor');
  const qtyInp   = document.getElementById('qtyInput');

  function syncBtn() {
    if (!addBtn) return;
    addBtn.dataset.sku   = sku;
    addBtn.dataset.name  = P.name;
    addBtn.dataset.price = String(P.price);
    addBtn.dataset.img   = P.images[0] || '';
    addBtn.dataset.size  = sizeSel?.value || '';
    addBtn.dataset.color = colorSel?.value || '';
    addBtn.dataset.qty   = qtyInp?.value || '1';
  }
  ['change','input'].forEach(ev=>{
    sizeSel  && sizeSel.addEventListener(ev, syncBtn);
    colorSel && colorSel.addEventListener(ev, syncBtn);
    qtyInp   && qtyInp.addEventListener(ev, syncBtn);
  });
  document.addEventListener('DOMContentLoaded', syncBtn);
})();
