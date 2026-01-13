import * as apis from "./api.js";

let selectedVariant = null
let allVariants = []
let selectedColor = null
let selectedSize = null

async function loadProductDetail() {
  const productId = new URLSearchParams(window.location.search).get("id");
  if (!productId) return;

  try {
    /* ===============================
      PRODUCT INFO
    =============================== */
    const productRes = await apis.getProductsById(productId);
    const product = productRes.data;

    document.querySelector(".product-title").innerText = product.product_name;
    document.getElementById("p-description").innerText =
      product.description ?? "";

    /* ===============================
      REVIEWS → AVG RATING
    =============================== */
    const reviewRes = await apis.getAllReviewsByProductID(productId);
    const reviews = reviewRes.data || [];

    let avgRating = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
      avgRating = (total / reviews.length);
    }

    renderRating(avgRating, reviews.length);

    /* ===============================
    VARIANTS → COLORS & SIZES
    =============================== */
    const variantRes = await apis.getAllVariantsByProductID(productId);
    const variants = variantRes.data || [];
    allVariants = variants
    renderColors(variants);
    renderSizes(variants);


    /* DEFAULT SELECT */
    selectedVariant = allVariants[0]
    selectedColor = selectedVariant.color
    selectedSize = selectedVariant.size

    document.querySelector(".product-price strong").innerText =
      `${selectedVariant.price_out}K VND`

    document.querySelector(
      ".product-quantity .item-title strong"
    ).innerText = selectedVariant.stock_quantity

    /* HIGHLIGHT DEFAULT (JS THUẦN) */
    document
      .querySelectorAll(".color-toggle a")
      .forEach(a => {
        if (a.innerText.trim() === selectedColor) a.classList.add("active")
      })

    document
      .querySelectorAll(".swatch a")
      .forEach(a => {
        if (a.innerText.trim() === selectedSize) a.classList.add("active")
      })
    await renderProductImages(productId)  
    /* ===============================
      MISCS
    =============================== */
    const categoryRes = await apis.getCategoryByID(product.category_id);
    const category = categoryRes.data;

    document.querySelector(".product-quantity .item-title strong").innerText = variants[0].stock_quantity
    document.querySelector("#category-value").innerText = category.category_name

  } catch (err) {
    console.error("Load detail failed:", err);
  }
}

/* ===============================
   ⭐ RENDER RATING
================================ */
function renderRating(avg, count) {
  const container = document.querySelector(".rating-container");
  if (!container) return;

  container.innerHTML = "";

  const fullStars = Math.floor(avg);
  const hasHalf = avg % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("i");
    star.classList.add("icon");

    if (i <= fullStars) {
      star.classList.add("icon-star-full");
    } else if (i === fullStars + 1 && hasHalf) {
      star.classList.add("icon-star-half");
    } else {
      star.classList.add("icon-star-empty");
    }

    container.appendChild(star);
  }

  const countEl = document.createElement("span");
  countEl.className = "rating-count";
  countEl.innerText = ` (${avg}/5 · ${count} reviews)`;
  container.appendChild(countEl);
}
/* ===============================
   UPDATE SELECTED VARIANT
================================ */
function syncSelectedVariant() {
  if (!selectedColor || !selectedSize) return

  selectedVariant = allVariants.find(
    v => v.color === selectedColor && v.size === selectedSize
  )

  if (selectedVariant) {
    document.querySelector(".product-price strong").innerText =
      `${selectedVariant.price_out}K VND`

    document.querySelector(
      ".product-quantity .item-title strong"
    ).innerText = selectedVariant.stock_quantity
  }
}

/* ===============================
   🎨 RENDER COLORS
================================ */
// function renderColors(variants) {
//   const colorList = document.querySelector(".color-toggle .select-list");
//   if (!colorList) return;

//   const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
//   colorList.innerHTML = "";

//   colors.forEach(color => {
//     const li = document.createElement("li");
//     li.className = "select-item";
//     li.dataset.val = color;
//     li.innerHTML = `<a href="#">${color}</a>`;
//     colorList.appendChild(li);
//   });
// }
function renderColors(variants) {
  const list = document.querySelector(".color-toggle .select-list")
  list.innerHTML = ""

  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))]

  colors.forEach(color => {
    const li = document.createElement("li")
    li.className = "select-item"

    const a = document.createElement("a")
    a.href = "#"
    a.innerText = color

    a.onclick = e => {
      e.preventDefault()
      selectedColor = color

      list.querySelectorAll("a").forEach(el =>
        el.classList.remove("active")
      )
      a.classList.add("active")

      syncSelectedVariant()
    }

    li.appendChild(a)
    list.appendChild(li)
  })
}
/* ===============================
   RENDER PRODUCT IMAGES (SWIPER)
================================ */
async function renderProductImages(productId) {
  const res = await apis.getAllImagesByProductID(productId)
  const images = res.data || []

  const thumbWrapper = document.querySelector(".thumb-swiper .swiper-wrapper")
  const largeWrapper = document.querySelector(".large-swiper .swiper-wrapper")

  thumbWrapper.innerHTML = ""
  largeWrapper.innerHTML = ""

  images
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach(img => {
      /* THUMB */
      const thumbSlide = document.createElement("div")
      thumbSlide.className = "swiper-slide"
      thumbSlide.innerHTML = `<img src="${img.image_url}" alt="">`
      thumbWrapper.appendChild(thumbSlide)

      /* LARGE */
      const largeSlide = document.createElement("div")
      largeSlide.className = "swiper-slide"
      largeSlide.innerHTML = `<img src="${img.image_url}" alt="single-product">`
      largeWrapper.appendChild(largeSlide)
    })
}
/* ===============================
   📏 RENDER SIZES
================================ */
// function renderSizes(variants) {
//   const sizeList = document.querySelector(".swatch .select-list");
//   if (!sizeList) return;

//   const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
//   sizeList.innerHTML = "";

//   sizes.forEach(size => {
//     const li = document.createElement("li");
//     li.className = "select-item";
//     li.dataset.value = size;
//     li.innerHTML = `<a href="#">${size}</a>`;
//     sizeList.appendChild(li);
//   });
// }
function renderSizes(variants) {
  const list = document.querySelector(".swatch .select-list")
  list.innerHTML = ""

  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))]

  sizes.forEach(size => {
    const li = document.createElement("li")
    li.className = "select-item"

    const a = document.createElement("a")
    a.href = "#"
    a.innerText = size

    a.onclick = e => {
      e.preventDefault()
      selectedSize = size

      list.querySelectorAll("a").forEach(el =>
        el.classList.remove("active")
      )
      a.classList.add("active")

      syncSelectedVariant()
    }

    li.appendChild(a)
    list.appendChild(li)
  })
}


// function updateSelectedVariant({ color, size }) {
//   const selectedColor =
//     color ??
//     document.querySelector(".color-toggle .active a")?.innerText

//   const selectedSize =
//     size ??
//     document.querySelector(".swatch .active a")?.innerText

//   selectedVariant = allVariants.find(
//     v => v.color === selectedColor && v.size === selectedSize
//   )

//   if (selectedVariant) {
//     document.querySelector(".product-price strong").innerText =
//       `$${selectedVariant.price_out}`

//     document.querySelector(".product-quantity strong").innerText =
//       selectedVariant.stock_quantity
//   }
// }

window.addToCartFromDetail = async function () {
  if (!selectedVariant) return alert("Select color & size")

  const quantity = Number(document.getElementById("quantity").value) || 1
  const customerId = Number(localStorage.getItem("userId")) || 2

  await apis.addToCart(
    customerId,
    selectedVariant.variant_id,
    quantity
  )

  alert("Added to cart")
  window.location.href = "cart.html"
}

window.addEventListener("DOMContentLoaded", loadProductDetail)
