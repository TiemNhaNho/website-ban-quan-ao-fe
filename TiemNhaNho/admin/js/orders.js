const API = "https://tiem-nha-nho-api.onrender.com";
const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

let customersMap = {};
let couponsMap = {};
let orderDetailsMap = {};
let ordersCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadCustomers(),
    loadCoupons(),
    loadOrderDetails()
  ]);

  loadOrders();
});

/* ================= LOAD CUSTOMERS ================= */
async function loadCustomers() {
  try {
    const res = await fetch(`${API}/customers`, { headers });

    if (!res.ok) {
      console.warn("Không có quyền xem customers");
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) return;

    data.forEach(c => {
      customersMap[c.id] = c;
    });
  } catch (err) {
    console.error("Load customers error:", err);
  }
}

/* ================= LOAD COUPONS ================= */
async function loadCoupons() {
  try {
    const res = await fetch(`${API}/coupons`, { headers });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data)) return;

    data.forEach(c => {
      couponsMap[c.id] = c.code;
    });
  } catch (err) {
    console.error(err);
  }
}

/* ================= LOAD ORDER DETAILS ================= */
async function loadOrderDetails() {
  try {
    const res = await fetch(`${API}/order-details`, { headers });
    if (!res.ok) return;

    const data = await res.json();
    if (!Array.isArray(data)) return;

    data.forEach(d => {
      if (!orderDetailsMap[d.order_id]) {
        orderDetailsMap[d.order_id] = [];
      }
      orderDetailsMap[d.order_id].push(d);
    });
  } catch (err) {
    console.error(err);
  }
}

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders`, { headers });
    if (!res.ok) return;

    ordersCache = await res.json();
    if (!Array.isArray(ordersCache)) return;

    const tbody = document.getElementById("ordersBody");
    tbody.innerHTML = "";

    ordersCache.forEach(order => {
      const customer = customersMap[order.customer_id] || {};

      tbody.innerHTML += `
        <tr>
          <td>${order.id}</td>
          <td>${customer.name || "N/A"}</td>
          <td>${customer.phone || "N/A"}</td>
          <td>${customer.address || "N/A"}</td>
          <td>${couponsMap[order.coupon_id] || "—"}</td>
          <td>${formatDate(order.order_date)}</td>
          <td>${formatMoney(order.total_money)}</td>
          <td>${order.status || "New"}</td>
          <td>
            <button class="btn-view" onclick="viewOrder(${order.id})">
              Xem
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Load orders error:", err);
  }
}

/* ================= VIEW ORDER ================= */
function viewOrder(orderId) {
  const order = ordersCache.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById("viewOrderId").textContent = order.id;
  document.getElementById("viewTotalAmount").textContent =
    formatMoney(order.total_money);
  document.getElementById("viewOrderStatus").textContent = order.status;

  const customer = customersMap[order.customer_id] || {};
  document.getElementById("viewCustomerName").textContent = customer.name || "N/A";
  document.getElementById("viewCustomerPhone").textContent = customer.phone || "N/A";
  document.getElementById("viewCustomerAddress").textContent = customer.address || "N/A";

  const tbody = document.getElementById("orderDetailsBody");
  tbody.innerHTML = "";

  const details = orderDetailsMap[orderId] || [];
  details.forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td>${d.variant_id}</td>
        <td>${d.quantity}</td>
        <td>${formatMoney(d.price)}</td>
      </tr>
    `;
  });

  document.getElementById("viewModal").style.display = "block";
}

/* ================= HELPERS ================= */
function formatMoney(val) {
  return (val || 0).toLocaleString("vi-VN") + " ₫";
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN");
}
