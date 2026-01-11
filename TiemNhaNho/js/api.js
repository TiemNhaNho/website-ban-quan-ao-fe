const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com"

/* ================= CART ================= */

// GET /carts
export async function getAllCartItems() {
  const res = await fetch(`${API_BASE_URL}/carts`)
  if (!res.ok) throw new Error("Fetch cart items failed")
  return await res.json()
}

// POST /carts
export async function addToCart(customerId, variantId, quantity) {
  const res = await fetch(`${API_BASE_URL}/carts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: customerId,
      variant_id: variantId,
      quantity
    })
  })

  if (!res.ok) throw new Error("Failed to add to cart")
  return await res.json()
}

// DELETE /carts/{id}
export async function deleteCartItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/carts/${itemId}`, {
    method: "DELETE"
  })

  if (!res.ok) throw new Error("Failed to remove from cart")
  return res.status === 204 ? true : await res.json()
}

async function updateCartItemQuantity(itemId, quantity) {
  const res = await fetch(
    `${API_BASE_URL}/carts/${itemId}?quantity=${parseInt(quantity, 10)}`,
    {
      method: "PATCH"
    }
  )

  if (!res.ok) throw new Error("Failed to update cart item quantity")
  return await res.json()
}

window.updateCartItemQuantity = updateCartItemQuantity

// // FE API
// async function loadCouponAndShippingOptions() {
//   try {
//     // Coupons
//     const couponsRes = await fetch(`${API_BASE_URL}/coupons-select/options`)
//     const coupons = await couponsRes.json()
//     const couponInput = document.getElementById("coupon-code")
//     // nếu muốn làm dropdown thay vì input, map ra option
//     // couponInput.value = "" // input thì thôi

//     // Shipping methods
//     const shippingRes = await fetch(`${API_BASE_URL}/shipping-methods-select/options`)
//     const shipping = await shippingRes.json()
//     const shippingSelect = document.getElementById("shipping-method")

//     shippingSelect.innerHTML = shipping.map(s => `
//       <option value="${s.shipping_method_id}">${s.method_name}</option>
//     `).join("")

//   } catch (err) {
//     console.error("Load coupon/shipping options failed", err)
//   }
// }

// // gọi sau khi DOM load xong
// document.addEventListener("DOMContentLoaded", loadCouponAndShippingOptions)
/* ================= PRODUCT ================= */

export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/products`)
  if (!res.ok) throw new Error("Fetch products failed")
  return await res.json()
}

export async function getProductVariants() {
  const res = await fetch(`${API_BASE_URL}/product-variants`)
  if (!res.ok) throw new Error("Fetch product variants failed")
  return await res.json()
}

export async function getProductImages() {
  const res = await fetch(`${API_BASE_URL}/product-images`)
  if (!res.ok) throw new Error("Fetch product images failed")
  return await res.json()
}

/* ================= ORDER ================= */

export async function createOrder(data) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error("Create order failed")
  return await res.json()
}
