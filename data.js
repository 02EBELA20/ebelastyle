// EBELA STYLE — Global catalog (edit/extend freely)
const CATALOG = [
  {
    sku: "tee01",
    name: "Golden Graphic Tee",
    price: 29,
    category: "tees",
    colors: ["black", "gold"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["new", "unisex"],
    popular: true,
    desc: "Soft cotton tee with premium golden print. Minimal fit for everyday wear.",
    images: [
      "assets/img/products/img/tee01-1.jpg",
      "assets/img/products/img/tee01-2.jpg",
      "assets/img/products/img/tee01-3.jpg"
    ]
  },
  {
    sku: "tee01b",
    name: "Golden Tee — Back Print",
    price: 29,
    category: "tees",
    colors: ["black", "gold"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["unisex"],
    popular: false,
    desc: "Back print edition of our Golden Tee.",
    images: ["assets/img/products/img/tee01-2.jpg"]
  },
  {
    sku: "tee01c",
    name: "Golden Tee — Detail",
    price: 29,
    category: "tees",
    colors: ["black", "gold"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["sale", "unisex"],
    popular: false,
    desc: "Close-up detail variant with refined texture.",
    images: ["assets/img/products/img/tee01-3.jpg"]
  },
  {
    sku: "hood01",
    name: "Classic Hoodie",
    price: 59,
    category: "hoodies",
    colors: ["grey", "black"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["popular", "unisex"],
    popular: true,
    desc: "Mid-weight fleece hoodie with relaxed comfort.",
    images: ["assets/img/products/img/best2.jpg"]
  },
  {
    sku: "pants01",
    name: "Relaxed Pants",
    price: 49,
    category: "pants",
    colors: ["black", "grey"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["new"],
    popular: true,
    desc: "Breathable relaxed pants ideal for daily movement.",
    images: ["assets/img/products/img/best3.jpg"]
  },
  {
    sku: "shoe01",
    name: "Minimal Sneakers",
    price: 79,
    category: "footwear",
    colors: ["white", "red"],
    sizes: ["M", "L", "XL"],
    tags: ["popular"],
    popular: true,
    desc: "Clean low-top sneakers built for comfort.",
    images: ["assets/img/products/img/best4.jpg"]
  },
  {
    sku: "ewl01",
    name: "EWL Golden Graphic",
    price: 32,
    category: "tees",
    colors: ["black", "gold"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["new", "unisex"],
    popular: false,
    desc: "EWL series tee with golden graphic.",
    images: [
      "assets/img/products/img/ewl-golden-goose-april-benshosan-04-05c87c8cd8ac4835a49585763e0ef57e.jpeg"
    ]
  }
];

// make available globally
window.CATALOG = CATALOG;
