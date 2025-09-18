/* ===== EBELA STYLE — Product page (gallery + lightbox) ===== */
(function () {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // read ?sku=
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku') || 'tee01';

  // tiny product DB (დამატე სურვილისამებრ შენი SKU-ები)
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
    best4: { name:'Minimal Sneakers', price:79, images:['assets/img/products/img/best4.jpg'] },
    ewl01: { name:'EWL Golden Graphic', price:32, images:['assets/img/products/img/ewl-golden-goose-april-benshosan-04-05c87c8cd8ac4835a49585763e0ef57e.jpeg'] },
  };

  const P = DB[sku] || DB.tee01;

  // Fill info
  const t = $('[data-p-title]');  if (t) t.textContent = P.name;
  const pr = $('[data-p-price]'); if (pr) pr.textContent = `$${P.price.toFixed(2)}`;

  // Build gallery (hero + thumbs)
  const heroWrap = $('.gallery .hero-img');
  const heroImg  = heroWrap?.querySelector('img');
  const thumbs   = $('.gallery .thumbs');

  if (heroImg && P.images.length) heroImg.src = P.images[0];
  if (thumbs) {
    thumbs.innerHTML = '';
    P.images.forEach((src, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb' + (i === 0 ? ' is-active' : '');
      b.innerHTML = `<img src="${src}" alt="${P.name} ${i+1}">`;
      b.addEventListener('click', () => {
        if (heroImg) heroImg.src = src;
        thumbs.querySelectorAll('.thumb').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        currentIndex = i; // keep in sync with lightbox
      });
      thumbs.appendChild(b);
    });
  }

  /* ---------- Lightbox (zoom on hero click) ---------- */
  let currentIndex = 0;
  function idxFromHero() {
    const curSrc = heroImg?.getAttribute('src');
    currentIndex = Math.max(0, P.images.findIndex(s => s === curSrc));
  }

  function buildLightbox() {
    let lb = $('#lightbox');
    if (lb) return lb;

    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML = `
      <button class="lb-btn" data-lb-close aria-label="Close">✕</button>
      <button class="lb-btn" data-lb-prev aria-label="Previous">‹</button>
      <img class="lightbox__img" alt="">
      <button class="lb-btn" data-lb-next aria-label="Next">›</button>
    `;
    document.body.appendChild(lb);

    // Close on overlay click (outside image)
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLB();
    });
    lb.querySelector('[data-lb-close]')?.addEventListener('click', closeLB);
    lb.querySelector('[data-lb-prev]')?.addEventListener('click', () => navLB(-1));
    lb.querySelector('[data-lb-next]')?.addEventListener('click', () => navLB(1));

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') navLB(-1);
      if (e.key === 'ArrowRight') navLB(1);
    });

    return lb;
  }

  function openLB() {
    const lb = buildLightbox();
    idxFromHero();
    updateLB();
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden'; // lock scroll
  }
  function closeLB() {
    const lb = $('#lightbox');
    if (!lb) return;
    lb.hidden = true;
    document.documentElement.style.overflow = '';
  }
  function navLB(step) {
    currentIndex = (currentIndex + step + P.images.length) % P.images.length;
    updateLB();
  }
  function updateLB() {
    const lbImg = $('#lightbox .lightbox__img');
    if (lbImg) lbImg.src = P.images[currentIndex];
  }

  heroWrap?.addEventListener('click', openLB);

  /* ---------- Sync Add-to-Cart dataset with selections ---------- */
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
