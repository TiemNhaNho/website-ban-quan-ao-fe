import * as apis from './api.js'

// for test
const CUSTOMER_ID = 2;

window.changeQty = async function (cartId, delta) {
  const btn = event.currentTarget
  const input = btn.parentElement.querySelector("input")
  if (!input) return

  let qty = parseInt(input.value, 10)
  if (isNaN(qty)) qty = 1

  qty += parseInt(delta, 10)
  if (qty < 1) qty = 1
  input.value = qty

  try {
    await window.updateCartItemQuantity(cartId, qty)
    window.location.reload()
  } catch (err) {
    console.error(err)
    alert("Cập nhật thất bại")
  }
}

window.deleteCartItem = async function (itemId) {
  await apis.deleteCartItem(itemId)
  loadCartItemsById(CUSTOMER_ID)
}

function renderCartItem(cart, product_image, product_variant, product) {
  return `
    <div class="cart-item border-bottom padding-small">
      <div class="row">
        <div class="col-lg-4 col-md-3">
          <div class="row cart-info d-flex flex-wrap">
            <div class="col-lg-5">
              <div class="card-image">
                <img 
                  src="${product_image?.image_url}" 
                  alt="${product?.product_name}" 
                  class="img-fluid">
              </div>
            </div>
            <div class="col-lg-4">
              <div class="card-detail">
                <h3 class="card-title">
                  <a href="#">
                    ${product?.product_name}
                  </a>
                </h3>
                <div class="card-price">
                  <span class="money text-primary">
                    ${product_variant?.price_out ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 col-md-7">
          <div class="qty-number d-flex align-items-center">
            <button onclick="changeQty(${cart.cart_id}, -1)">-</button>
            <input type="text" value="${cart.quantity}" min="1">
            <button onclick="changeQty(${cart.cart_id}, 1)">+</button>
          </div>
        </div>

        <div class="col-lg-1 col-md-2">
          <div class="cart-remove">
            <a href="javascript:void(0);" onclick="deleteCartItem(${cart.cart_id})">
              <i class="icon icon-close"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderCartSummary(cartItems, variants) {
  const subtotal = cartItems.reduce((sum, item) => {
    const variant = variants.find(
      v => v.id === item.variant_id || v.variant_id === item.variant_id
    )
    const price = variant?.price_out ?? 0
    return sum + price * item.quantity
  }, 0)

  const format = n => n.toLocaleString("en-US", { minimumFractionDigits: 2 })

  // Subtotal
  document.querySelector(".subtotal .price-amount bdi").innerHTML = `
    <span class="price-currency-symbol">${format(subtotal)} vnd</span>
  `

  // Total (chưa có shipping / tax → = subtotal)
  // document.querySelector(".order-total .price-amount bdi").innerHTML = `
  //   <span class="price-currency-symbol">${format(subtotal)} vnd</span>
  // `
}


async function loadCartItemsById(customerId) {
  const container = document.getElementById("cart-items")

  try {
    const [cartRes, imageRes, productRes, variantRes] = await Promise.all([
      apis.getAllCartItemsById(customerId),
      apis.getProductImages(),
      apis.getProducts(),
      apis.getProductVariants()
    ])

    // normalize responses to arrays
    const cartItems = Array.isArray(cartRes) ? cartRes : cartRes.data || []
    const productImages = Array.isArray(imageRes) ? imageRes : imageRes.data || []
    const products = Array.isArray(productRes) ? productRes : productRes.data || []
    const variants = Array.isArray(variantRes) ? variantRes : variantRes.data || []

    container.innerHTML = cartItems.map(item => {
      // cart → variant
      const variant = variants.find(
        v => (v.variant_id ?? v.id) === item.variant_id
      )

      // variant → product
      const productId = variant?.product_id ?? item.product_id
      const product = products.find(p => p.product_id === productId)

      // product → image (first image)
      const image = productImages.find(i => i.product_id === productId)

      return renderCartItem(item, image, variant, product)
    }).join("")
    renderCartSummary(cartItems, variants)
  } catch (err) {
    console.error(err)
    container.innerHTML = "<p>Không tải được sản phẩm</p>"
  }
}

loadCartItemsById(CUSTOMER_ID)

