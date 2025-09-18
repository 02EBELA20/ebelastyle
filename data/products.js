/* ========= Client-side product DB =========
   How to add a new product:
   - Copy an object, change sku, name, price
   - category: one of ["tees","hoodies","pants","footwear"]
   - colors/sizes: arrays for filters
   - tags: e.g. ["new","popular","sale","unisex"]
   - images: at least 1 path (relative to project root)
*/
window.PRODUCTS = [
  {
    sku: "tee01",
    name: "Golden Graphic Tee",
    price: 29,
    category: "tees",
    colors: ["black","gold","white"],
    sizes: ["XS","S","M","L","XL"],
    tags: ["new","unisex"],
    images: [
      "assets/img/products/img/tee01-1.jpg",
      "assets/img/products/img/tee01-2.jpg",
      "assets/img/products/img/tee01-3.jpg"
    ],
    desc: "Ultra-soft cotton tee with gold print. Everyday essential."
  },
  {
    sku: "best2",
    name: "Classic Hoodie",
    price: 59,
    category: "hoodies",
    colors: ["grey","black"],
    sizes: ["S","M","L","XL"],
    tags: ["popular"],
    images: ["assets/img/products/img/best2.jpg"],
    desc: "Mid-weight fleece hoodie with relaxed comfort."
  },
  {
    sku: "best3",
    name: "Relaxed Pants",
    price: 49,
    category: "pants",
    colors: ["black","grey"],
    sizes: ["S","M","L","XL"],
    tags: ["popular"],
    images: ["assets/img/products/img/best3.jpg"],
    desc: "Breathable relaxed pants ideal for daily movement."
  },
  {
    sku: "best4",
    name: "Minimal Sneakers",
    price: 79,
    category: "footwear",
    colors: ["white","black"],
    sizes: ["M","L","XL"],
    tags: ["popular","unisex"],
    images: ["assets/img/products/img/best4.jpg"],
    desc: "Clean low-top sneakers built for comfort."
  },
  {
    sku: "ewl01",
    name: "EWL Golden Graphic",
    price: 32,
    category: "tees",
    colors: ["black","gold"],
    sizes: ["S","M","L","XL"],
    tags: ["new","unisex"],
    images: [
      "assets/img/products/img/ewl-golden-goose-april-benshosan-04-05c87c8cd8ac4835a49585763e0ef57e.jpeg"
    ],
    desc: "EWL series tee with golden graphic."
  }
];
