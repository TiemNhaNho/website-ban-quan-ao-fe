import { getAdminToken } from "../utils/token.js";

const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";

// Shared state
window.customersData = {};

export async function fetchCustomers() {
  const token = getAdminToken();

  try {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch customers");

    const json = await res.json();
    const customers = json.data || [];

    window.customersData = {};
    customers.forEach((c) => {
      const id = c.user_id || c.id;
      window.customersData[id] = c;
    });

    renderTable(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    if (typeof showToast === "function") {
      showToast("Lỗi tải danh sách khách hàng", "error");
    }
  }
}

function renderTable(customers) {
  const tbody = document.getElementById("customersBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  customers.forEach((customer) => {
    const id = customer.user_id || customer.id;
    const name = customer.username || "N/A";
    const email = customer.email || "N/A";

    const tr = document.createElement("tr");
    tr.className = "customer-row";
    tr.dataset.id = id;
    tr.onclick = () => window.openViewModal(id);

    tr.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${email}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Attach functions to window for HTML access

window.openAddModal = function () {
  const form = document.getElementById("customerForm");
  if (form) {
    form.reset();
    form.dataset.customerId = "";
  }
  if (typeof openModal === "function") openModal("customerModal");
};

window.openEditModal = function (id) {
  const customer = window.customersData[id];
  if (!customer) return;

  const form = document.getElementById("customerForm");
  const inputs = form.querySelectorAll("input, textarea");

  if (inputs[0]) inputs[0].value = customer.username || "";
  if (inputs[1]) inputs[1].value = customer.email || "";

  form.dataset.customerId = id;
  if (typeof openModal === "function") openModal("customerModal");
};

window.openViewModal = function (id) {
  const customer = window.customersData[id];
  if (!customer) return;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "viewModal"; // Ensure ID is set
  modal.style.display = "block";

  const name = customer.username || "N/A";
  const email = customer.email || "N/A";

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Chi Tiết Khách Hàng</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div><strong>Tên:</strong> <p>${name}</p></div>
          <div><strong>Email:</strong> <p>${email}</p></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  if (typeof addSwipeListener === "function") addSwipeListener("viewModal");
  else if (window.addSwipeListener) window.addSwipeListener("viewModal");
};

window.searchCustomers = function () {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll("#customersBody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchCustomers();

  // Bind search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.onkeyup = window.searchCustomers;
  }
});
