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
