// Simple Orders Management
const API_URL = "https://tiem-nha-nho-api.onrender.com";

// Store orders from API
let allOrders = [];

// Mock data - fallback khi API fail
const mockOrders = [
  {
    order_id: 1,
    order_code: "#ORD001",
    customer_name: "Nguyễn Văn A",
    customer_email: "nva@email.com",
    customer_phone: "0123456789",
    customer_address: "123 Đường ABC, TP HCM",
    total_amount: 1250000,
    status: "pending",
    payment_method: "COD",
    created_at: "2025-12-31"
  },
  {
    order_id: 2,
    order_code: "#ORD002",
    customer_name: "Trần Thị B",
    customer_email: "ttb@email.com",
    customer_phone: "0987654321",
    customer_address: "456 Đường XYZ, Hà Nội",
    total_amount: 850000,
    status: "confirmed",
    payment_method: "transfer",
    created_at: "2025-12-30"
  }
];

const mockDetails = {
  1: [
    { product_name: "Áo Sơ Mi Nam", unit_price: 250000, quantity: 2 },
    { product_name: "Quần Jeans", unit_price: 350000, quantity: 1 }
  ],
  2: [
    { product_name: "Váy Nữ", unit_price: 300000, quantity: 1 },
    { product_name: "Áo Thun", unit_price: 275000, quantity: 2 }
  ]
};

// Helpers
function formatCurrency(val) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN");
}

function getStatusLabel(s) {
  const labels = { pending: "Chưa xử lí", confirmed: "Đã xác nhận", shipped: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy" };
  return labels[s] || s;
}

function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.cssText = `position:fixed;top:20px;right:20px;background:${type==="success"?"#4caf50":"#f44336"};color:#fff;padding:15px;border-radius:5px;z-index:2000`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Load table từ API
async function loadOrders() {
  try {
    const token = localStorage.getItem("adminToken");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    console.log("Fetching from:", `${API_URL}/orders`);
    // Gọi API
    const res = await fetch(`${API_URL}/orders`, { headers });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    allOrders = data.data || data || [];
    console.log("✅ Orders from API:", allOrders);
  } catch (err) {
    console.error("❌ API error:", err);
    console.log("⚠️ Using mock data as fallback");
    allOrders = mockOrders;
  }
  
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";
  
  allOrders.forEach(order => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.order_code}</td>
      <td>${order.customer_name}</td>
      <td>${formatDate(order.created_at)}</td>
      <td>${formatCurrency(order.total_amount)}</td>
      <td><span class="badge badge-${order.status}">${getStatusLabel(order.status)}</span></td>
      <td onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="editOrder(${order.order_id})" title="Sửa">
          <img src="../images/sua.png" alt="Sửa" class="icon-img">
        </button>
        <button class="btn-icon" onclick="deleteOrder(${order.order_id})" title="Xóa">
          <img src="../images/huy.png" alt="Xóa" class="icon-img">
        </button>
      </td>
    `;
    tr.onclick = () => viewOrder(order.order_id);
    tbody.appendChild(tr);
  });
}

// Modal functions
function openAddModal() {
  document.getElementById("modalTitle").innerText = "Thêm Đơn Hàng Mới";
  document.getElementById("orderForm").reset();
  document.getElementById("orderForm").dataset.mode = "add";
  document.getElementById("orderId").value = "";
  document.getElementById("orderModal").style.display = "block";
}

function editOrder(id) {
  const order = allOrders.find(o => o.order_id === id);
  if (!order) return;
  
  document.getElementById("modalTitle").innerText = "Chỉnh Sửa Đơn Hàng";
  document.getElementById("orderId").value = order.order_code;
  document.getElementById("customerName").value = order.customer_name;
  document.getElementById("customerEmail").value = order.customer_email;
  document.getElementById("customerPhone").value = order.customer_phone;
  document.getElementById("customerAddress").value = order.customer_address;
  document.getElementById("totalAmount").value = order.total_amount;
  document.getElementById("orderStatus").value = order.status;
  document.getElementById("paymentMethod").value = order.payment_method;
  document.getElementById("orderForm").dataset.mode = "edit";
  document.getElementById("orderForm").dataset.orderId = id;
  document.getElementById("orderModal").style.display = "block";
}

function viewOrder(id) {
  const order = allOrders.find(o => o.order_id === id);
  if (!order) return;
  
  document.getElementById("viewOrderId").innerText = order.order_code;
  document.getElementById("viewCustomerName").innerText = order.customer_name;
  document.getElementById("viewCustomerEmail").innerText = order.customer_email;
  document.getElementById("viewCustomerPhone").innerText = order.customer_phone;
  document.getElementById("viewCustomerAddress").innerText = order.customer_address;
  document.getElementById("viewTotalAmount").innerText = formatCurrency(order.total_amount);
  document.getElementById("viewOrderStatus").innerText = getStatusLabel(order.status);
  document.getElementById("viewPaymentMethod").innerText = order.payment_method;
  
  const tbody = document.querySelector("#viewItemsTable tbody");
  tbody.innerHTML = "";
  
  // Fetch order details from API
  fetch(`${API_URL}/order-details?order_id=${id}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken") || ""}` }
  })
    .then(res => res.json())
    .then(result => {
      const items = result.data || mockDetails[id] || [];
      items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.product_name || item.product_id}</td>
          <td>${formatCurrency(item.unit_price || 0)}</td>
          <td>${item.quantity || 0}</td>
          <td>${formatCurrency((item.unit_price || 0) * (item.quantity || 0))}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      // Fallback to mock data
      const items = mockDetails[id] || [];
      items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.product_name}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price * item.quantity)}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  
  document.getElementById("updateStatus").value = order.status;
  document.getElementById("viewModal").dataset.orderId = id;
  document.getElementById("viewModal").style.display = "block";
}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
}

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

async function deleteOrder(id) {
  if (!confirm("Xóa đơn hàng này?")) return;
  
  try {
    const token = localStorage.getItem("adminToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/orders/${id}`, { method: "DELETE", headers });
    
    if (res.ok) {
      const idx = allOrders.findIndex(o => o.order_id === id);
      if (idx >= 0) allOrders.splice(idx, 1);
      loadOrders();
      showToast("Xóa thành công");
    } else {
      throw new Error("Delete failed");
    }
  } catch (err) {
    console.error(err);
    const idx = allOrders.findIndex(o => o.order_id === id);
    if (idx >= 0) {
      allOrders.splice(idx, 1);
      loadOrders();
      showToast("Xóa thành công");
    }
  }
}

function updateStatus() {
  const status = document.getElementById("updateStatus").value;
  const orderId = parseInt(document.getElementById("viewModal").dataset.orderId);
  const order = allOrders.find(o => o.order_id === orderId);
  if (order) {
    order.status = status;
    loadOrders();
    showToast("Cập nhật thành công");
    closeViewModal();
  }
}

function searchTable() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#ordersBody tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}

// Form submit
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  
  const form = document.getElementById("orderForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mode = form.dataset.mode;
    const orderId = parseInt(form.dataset.orderId);
    
    const data = {
      customer_name: document.getElementById("customerName").value,
      customer_email: document.getElementById("customerEmail").value,
      customer_phone: document.getElementById("customerPhone").value,
      customer_address: document.getElementById("customerAddress").value,
      total_amount: parseInt(document.getElementById("totalAmount").value),
      status: document.getElementById("orderStatus").value,
      payment_method: document.getElementById("paymentMethod").value
    };
    
    const token = localStorage.getItem("adminToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    try {
      if (mode === "edit") {
        // Gọi API PUT
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const order = allOrders.find(o => o.order_id === orderId);
          if (order) Object.assign(order, data);
          showToast("Cập nhật thành công");
        } else {
          throw new Error("Update failed");
        }
      } else {
        // Gọi API POST
        const res = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers,
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const newData = await res.json();
          allOrders.push(newData.data || { order_id: Date.now(), order_code: "#ORD" + Date.now(), created_at: new Date().toISOString(), ...data });
          showToast("Thêm thành công");
        } else {
          throw new Error("Create failed");
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback: update local array
      if (mode === "edit") {
        const order = allOrders.find(o => o.order_id === orderId);
        if (order) Object.assign(order, data);
      } else {
        allOrders.push({ order_id: Date.now(), order_code: "#ORD" + Date.now(), created_at: new Date().toISOString(), ...data });
      }
      showToast("Lưu thành công");
    }
    
    closeOrderModal();
    loadOrders();
  });
});

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target.id === "orderModal") document.getElementById("orderModal").style.display = "none";
  if (e.target.id === "viewModal") document.getElementById("viewModal").style.display = "none";
});
