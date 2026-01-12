const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com"

/* ================= CART ================= */

// GET /carts
export async function getAllCartItems() {
  const res = await fetch(`${API_BASE_URL}/carts`)
  if (!res.ok) throw new Error("Fetch cart items failed")
  return await res.json()
}

export async function getAllCartItemsById(customerId) {
  const res = await fetch(`${API_BASE_URL}/carts-by-customer/${customerId}`)
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
  });

  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = await res.text();
    }
    console.error("Create order API error:", errData);
    throw new Error("Create order failed: " + (errData.detail || JSON.stringify(errData)));
  }

  return await res.json();
}

export async function getAllOrdersById(orderId) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`)
  if (!res.ok) throw new Error("Fetch orders failed")
  return await res.json()
}

/* ================= VARIANTS ================= */
export async function fetchVariantById(variantId) {
  const res = await fetch(`${API_BASE_URL}/product-variants/${variantId}`);
  if (!res.ok) throw new Error("Fetch variant failed");
  return await res.json();
}

/* ================= COUPONS-DROPDOWN ================= */
export async function getCouponOptions() {
  const res = await fetch(`${API_BASE_URL}/coupons-select/options`)
  if (!res.ok) throw new Error("Fetch coupon options failed")
  return await res.json()
}
/* ================= SHIPPING-DROPDOWN ================= */
export async function getShippingOptions() {
  const res = await fetch(`${API_BASE_URL}/shipping-methods-select/options`)
  if (!res.ok) throw new Error("Fetch shipping options failed")
  return await res.json()
}

export async function getShippingById(shipping_method_id) {
  const res = await fetch(`${API_BASE_URL}/shipping-methods/${shipping_method_id}`);
  if (!res.ok) throw new Error("Fetch shipping method failed");
  return await res.json();
  
}

export async function getCurrentCustomer(){
  const res = await fetch(`${API_BASE_URL}/me`)
  if (!res.ok) throw new Error("Fetch current customer failed")
  return await res.json()
}

export async function getCouponById(coupon_id){
  const res = await fetch(`${API_BASE_URL}/coupons/${coupon_id}`);
  if (!res.ok) throw new Error("Fetch coupon failed");
  return await res.json();
}