import * as apis from "./api.js";
const CUSTOMER_ID = Number(localStorage.getItem("userId")) //use this for when user login
const CUSTOMER_MAIL = (localStorage.getItem("userEmail"))
// for test
//const CUSTOMER_ID = 2;
//const orderListEl = document.getElementById("order-list");

let subtotalValue = 0
let shippingFeeValue = 0
let discountValue = 0
let couponsCache = []
let shippingCache = []

/* ==========================
   LOAD DROPDOWN
========================== */
async function loadShippingMethods() {
  const res = await apis.getShippingOptions()
  shippingCache = res

  const select = document.getElementById("shipping_method")
  select.innerHTML = `<option value="">No shipping</option>`

  res.forEach(s => {
    const fee = Number(s.base_cost)

    select.innerHTML += `
    <option value="${s.shipping_method_id}" data-fee="${fee}">
      ${s.method_name}
    </option>
  `
  })
}

async function loadCoupons() {
  const res = await apis.getCouponOptions()
  couponsCache = res

  const select = document.getElementById("coupon")
  select.innerHTML = `<option value="">No coupon</option>`

  res.forEach(c => {
    select.innerHTML += `
      <option value="${c.coupon_id}">
        ${c.code}
      </option>
    `
  })
}

/* ==========================
   SUBTOTAL
========================== */
async function renderSubtotal() {
  const cartsRes = await apis.getAllCartItemsById(CUSTOMER_ID)
  const carts = cartsRes.data

  subtotalValue = 0

  for (const cart of carts) {
    const variantRes = await apis.fetchVariantById(cart.variant_id)
    const variant = variantRes.data
    subtotalValue += variant.price_out * cart.quantity
  }

  document.getElementById("subtotal").innerText =
    subtotalValue.toLocaleString("vi-VN") + " ₫"

  calculateTotal()
}

/* ==========================
   CALCULATIONS
========================== */
async function calculateShipping() {
  const shippingMethodId = document.getElementById("shipping_method").value
  if (!shippingMethodId) {
    shippingFeeValue = 0;
    document.getElementById("shipping_fee").innerText = "0 ₫"; // ✅ reset hiển thị
    calculateTotal();
    return;
  }

  const res = await apis.getShippingById(shippingMethodId)
  const shipping = res.data

  // DECIMAL từ FastAPI → STRING
  shippingFeeValue = Number(shipping.base_cost)

  document.getElementById("shipping_fee").innerText =
    shippingFeeValue.toLocaleString("vi-VN") + " ₫"

  calculateTotal()
}


async function calculateDiscount() {
  const couponId = document.getElementById("coupon").value;

  if (!couponId) {
    discountValue = 0;
    document.getElementById("discount").innerText = "0 ₫"; // ✅ reset hiển thị
    calculateTotal();
    return;
  }

  const res = await apis.getCouponById(couponId);
  const coupon = res.data;

  const discountRaw = Number(coupon.discount_value);
  const couponType = coupon.discount_type.toUpperCase();

  const subtotalText = document.getElementById("subtotal").innerText;
  const subtotalValue = Number(subtotalText.replace(/\D/g, ""));

  if (couponType === "FIXED") {
    discountValue = discountRaw;
  } else if (couponType === "PERCENTAGE") {
    discountValue = subtotalValue * (discountRaw / 100);
  }

  document.getElementById("discount").innerText =
    discountValue.toLocaleString("vi-VN") + " ₫";

  calculateTotal();
}



function calculateTotal() {
  const total = subtotalValue - discountValue + shippingFeeValue
  document.getElementById("total_money").innerHTML =
    `<strong>${total.toLocaleString("vi-VN")} ₫</strong>`
}

/* ==========================
   EVENTS
========================== */
document
  .getElementById("shipping_method")
  .addEventListener("change", calculateShipping)

document
  .getElementById("coupon")
  .addEventListener("change", calculateDiscount)

/* ==========================
   INIT
========================== */
loadShippingMethods()
loadCoupons()
renderSubtotal()
/* ==========================
   STRIPE PAYMENT
========================== */
const stripe = Stripe("pk_test_51PtQowDbdSWlEaQJieZf5p5Lop56N0Li0of1nP9X23abKiMWNBz7DMyMiN1t7tCKV2pLVNQQj0eig3UAUkSylq4x00MFQBlq45");
const elements = stripe.elements();
const card = elements.create("card");
card.mount("#card-element");

document.getElementById("pay-btn").addEventListener("click", async (e) => {
  e.preventDefault(); // tránh submit mặc định form

  // 1️⃣ Lấy shipping và coupon từ dropdown
  const shipping_method_id = Number(document.getElementById("shipping_method").value) || 0;
  const coupon_id = Number(document.getElementById("coupon").value) || 0;

  // 2️⃣ Tạo paymentMethod với Stripe
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: "card",
    card: card
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (!paymentMethod || !paymentMethod.id) {
    alert("Payment method chưa được tạo. Vui lòng nhập thông tin thẻ.");
    return;
  }

  if (error) {
    alert(error.message);
    return;
  }
  const orderData = { customer_id: CUSTOMER_ID, payment_method: paymentMethod.id };

  if (document.getElementById("shipping_method").value) {
    orderData.shipping_method_id = Number(document.getElementById("shipping_method").value);
  }

  if (document.getElementById("coupon").value) {
    orderData.coupon_id = Number(document.getElementById("coupon").value);
  }
console.log("Stripe paymentMethod:", paymentMethod);

  console.log("Order payload:", orderData);

  // 3️⃣ Tạo order qua API
  try {
    await apis.createOrder(orderData);
    localStorage.setItem("order_success", "true");
    window.location.href = "index.html";


  } catch (err) {
    console.error(err);
    alert("Đặt hàng thất bại: " + err.message);
  }
});
