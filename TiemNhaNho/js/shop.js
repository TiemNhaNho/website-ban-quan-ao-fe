import * as apis from './api.js'
// expose global
window.addToCart = async function (variantId, quantity = 1) {
  //const customerId = Number(localStorage.getItem("customer_id")) //use this for when user login
  //for test
  const customerId = 2

  if (!customerId || !variantId) {
    console.error("Missing customerId or variantId", customerId, variantId)
    return
  }

  await apis.addToCart(customerId, variantId, quantity)
  // redirect to cart page
  window.location.href = "cart.html"
}

function renderProduct(product, product_variant, product_image) {
  const variantId = product_variant?.variant_id || product_variant?.id
  const priceOut = product_variant?.price_out ?? 0

  return `
    <div class="product-item col-lg-4 col-md-6 col-sm-6">
      <div class="image-holder">
        <img 
          src="${product_image?.image_url}" 
          alt="${product.product_name}" 
          class="product-image">
      </div>

      <div class="cart-concern">
        <div class="cart-button d-flex justify-content-between align-items-center">
          <button 
            type="button" 
            class="btn-wrap cart-link d-flex align-items-center"
            onclick="addToCart(${variantId}, 1)">
            add to cart <i class="icon icon-arrow-io"></i>
          </button>
        </div>
      </div>

      <div class="product-detail">
        <h3 class="product-title">
          <a href="single-product.html?id=${product.product_id}">
            ${product.product_name}
          </a>
        </h3>
        <div class="item-price text-primary">
          $${priceOut.toFixed(2)}
        </div>
      </div>
    </div>
  `
}


async function loadProducts() {
  const container = document.getElementById("product-list")
  try {
    const productsRes = await apis.getProducts()
    const variantsRes = await apis.getProductVariants()
    const imagesRes = await apis.getProductImages()

    const products = productsRes.data ?? productsRes
    const variants = variantsRes.data ?? variantsRes
    const images = imagesRes.data ?? imagesRes

    container.innerHTML = products.map(product => {
      const variant = variants.find(v => v.product_id === product.product_id)
      const image = images.find(i => i.product_id === product.product_id)
      return renderProduct(product, variant, image)
    }).join("")
  } catch (err) {
    console.error(err)
    container.innerHTML = "<p>Không tải được sản phẩm</p>"
  }
}


loadProducts()
