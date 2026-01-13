const API_URL = "https://tiem-nha-nho-api.onrender.com";

// Helper: Format Currency (VND)
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Helper: Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper: Status Badge Class
function getStatusBadgeClass(status) {
  // Normalize status to lowercase for comparison
  const s = (status || "").toLowerCase();
  switch (s) {
    case "new":
      return "badge-new"; // Blue
    case "paid":
      return "badge-paid"; // Green
    case "cancelled":
      return "badge-cancelled"; // Red
    case "pending":
      return "badge-pending"; // Yellow/Orange
    case "confirmed":
      return "badge-confirmed";
    case "shipped":
      return "badge-shipped";
    case "delivered":
      return "badge-delivered";
    default:
      return "badge-secondary";
  }
}

// Helper: Header with Auth
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken"); // Assuming token is stored here
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

let allOrders = [];
let allCustomers = [];

async function initOrdersPage() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    alert("Unauthorized. Please login.");
    // window.location.href = "login.html";
    return;
  }

  showLoading(true);

  try {
    // 1. Fetch Orders and Customers in parallel
    const [ordersRes, customersRes] = await Promise.all([
      fetch(`${API_URL}/orders`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/customers`, { headers: getAuthHeaders() }),
    ]);

    if (!ordersRes.ok || !customersRes.ok) {
      throw new Error(
        `API Error: ${ordersRes.status} / ${customersRes.status}`
      );
    }

    const ordersJson = await ordersRes.json();
    const customersJson = await customersRes.json();

    allOrders = ordersJson.data || [];
    allCustomers = customersJson.data || [];

    // 2. Process Data
    // Join Customer Name
    allOrders = allOrders.map((order) => {
      const customer = allCustomers.find((c) => c.id === order.customer_id);
      return {
        ...order,
        customerName: customer
          ? customer.username
          : `Unknown (ID: ${order.customer_id})`,
      };
    });

    // 3. Render
    renderSummary(allOrders);
    renderTable(allOrders);
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById(
      "ordersBody"
    ).innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading data: ${error.message}</td></tr>`;
  } finally {
    showLoading(false);
  }

  // Setup listeners
  setupSearchAndFilter();
}

function showLoading(isLoading) {
  const tbody = document.getElementById("ordersBody");
  if (isLoading) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center">Loading data...</td></tr>';
  }
}

function renderSummary(orders) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total_money) || 0),
    0
  );
  const pendingOrders = orders.filter(
    (o) =>
      (o.order_status || "").toLowerCase() === "new" ||
      (o.order_status || "").toLowerCase() === "pending"
  ).length;

  document.getElementById("summary-total-orders").textContent = totalOrders;
  document.getElementById("summary-total-revenue").textContent =
    formatCurrency(totalRevenue);
  document.getElementById("summary-pending-orders").textContent = pendingOrders;
}

function renderTable(orders) {
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";

  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.className = "order-row";
    tr.onclick = () => viewOrderDetails(order.order_id); // Assuming this function exists or we create it

    tr.innerHTML = `
      <td>#${order.order_id}</td>
      <td>${order.customerName}</td>
      <td>${formatDate(order.order_date)}</td>
      <td>${formatCurrency(order.total_money)}</td>
      <td><span class="badge ${getStatusBadgeClass(order.order_status)}">${
      order.order_status
    }</span></td>
      <td onclick="event.stopPropagation()" style="display: flex; gap: 5px;">
        <button class="btn-icon" onclick="viewOrderDetails(${
          order.order_id
        })" title="View Details"><i class="icon icon-search"></i></button>
        <button class="btn-icon" onclick="editOrder(${
          order.order_id
        })" title="Edit"><img src="../images/sua.png" alt="Edit" style="width: 16px; height: 16px;"></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editOrder = function (orderId) {
  alert(
    "Edit functionality for Order ID " + orderId + " is under construction."
  );
};

function setupSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  function filterData() {
    const term = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = allOrders.filter((order) => {
      const matchesSearch =
        String(order.order_id).includes(term) ||
        (order.customerName || "").toLowerCase().includes(term);

      const matchesStatus =
        status === "all" ||
        (order.order_status || "").toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
  }

  searchInput.addEventListener("keyup", filterData);
  statusFilter.addEventListener("change", filterData);
}

// Caching for Products and Variants to avoid redundant network requests
const productCache = new Map();
const variantCache = new Map();

// Helper: Fetch with Cache
async function fetchWithCache(url, cache, key) {
  if (cache.has(key)) return cache.get(key);
  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const json = await res.json();
    const data = json.data;
    cache.set(key, data);
    return data;
  } catch (error) {
    console.warn(`Error fetching ${url}:`, error);
    return null;
  }
}

// Export for global access if needed (e.g. onclick handlers in HTML)
window.viewOrderDetails = async function (orderId) {
  const order = allOrders.find((o) => o.order_id === orderId);
  if (order) {
    const modal = document.getElementById("viewModal");
    modal.style.display = "block";

    // Populate Basic Info
    document.getElementById("viewOrderId").textContent = order.order_id;
    document.getElementById("viewCustomerName").textContent =
      order.customerName;
    document.getElementById("viewCustomerEmail").textContent =
      order.email || "N/A"; // basic info might not be in order object if not mapped
    // Note: The original allOrders map only mapped customerName.
    // If we want email/phone/address, we need to grab them from the customer object found in initOrdersPage
    const customer = allCustomers.find((c) => c.id === order.customer_id);
    document.getElementById("viewCustomerEmail").textContent = customer
      ? customer.email
      : "";
    document.getElementById("viewCustomerPhone").textContent = customer
      ? customer.phone_number
      : "";
    document.getElementById("viewCustomerAddress").textContent = customer
      ? customer.address
      : "";

    // Reset calculated fields while loading
    document.getElementById("viewSubtotal").textContent = "...";
    document.getElementById("viewShippingFee").textContent = "...";

    document.getElementById("viewTotalAmount").textContent = formatCurrency(
      order.total_money
    );
    document.getElementById("viewOrderStatus").textContent = order.order_status;
    document.getElementById("viewPaymentMethod").textContent =
      order.payment_method;

    // Set up Update Status Button
    const updateBtn = document.querySelector(
      "#viewModal .status-update button"
    );
    if (updateBtn) {
      updateBtn.onclick = () => updateOrderStatus(order.order_id);
    }
    document.getElementById("updateStatus").value = order.order_status;

    // Populate Order Items
    const tbody = document.querySelector("#viewItemsTable tbody");
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">Đang tải sản phẩm...</td></tr>';

    try {
      // 1. Fetch ALL Order Details (or filter if API supported it)
      // Since we don't have a specific endpoint document, we fetch all and filter.
      const res = await fetch(`${API_URL}/order-details`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();

      let items = [];
      if (json.data) {
        items = json.data.filter((item) => item.order_id == orderId);
      }

      // Calculate and display Subtotal & Shipping
      const subtotal = items.reduce(
        (sum, item) =>
          sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
        0
      );
      const total = Number(order.total_money || 0);
      const shipping = total - subtotal;

      document.getElementById("viewSubtotal").textContent =
        formatCurrency(subtotal);
      document.getElementById("viewShippingFee").textContent =
        formatCurrency(shipping);

      if (items.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="text-center">Không có sản phẩm nào.</td></tr>';
        return;
      }

      // 2. Fetch Product & Variant Details for each item
      const rowsHTML = await Promise.all(
        items.map(async (item) => {
          const variant = await fetchWithCache(
            `${API_URL}/product-variants/${item.variant_id}`,
            variantCache,
            item.variant_id
          );
          let productName = "Product Unavailable";
          let detailsStr = "";

          if (variant) {
            const product = await fetchWithCache(
              `${API_URL}/products/${variant.product_id}`,
              productCache,
              variant.product_id
            );
            productName = product ? product.product_name : "Unknown Product";
            detailsStr = `${variant.color || ""} ${
              variant.size ? `(${variant.size})` : ""
            } <br><small class="text-muted">[${
              variant.sku || "NO-SKU"
            }]</small>`;
          }

          const itemTotalPrice = (item.unit_price || 0) * (item.quantity || 0);

          return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${productName}</div>
                        <div style="font-size: 0.85em;">${detailsStr}</div>
                    </td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td>${formatCurrency(itemTotalPrice)}</td>
                </tr>
            `;
        })
      );

      tbody.innerHTML = rowsHTML.join("");
    } catch (error) {
      console.error("Error loading items:", error);
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    }
  }
};

window.updateOrderStatus = async function (orderId) {
  const newStatus = document.getElementById("updateStatus").value;
  // Call API to update status (Placeholder)
  alert(`Update Order ${orderId} to ${newStatus} (API not yet implemented)`);
  // Ideally: await fetch(`${API_URL}/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({order_status: newStatus}) ... })
  // Then refresh table
  closeViewModal();
  initOrdersPage(); // Reload data
};

// Re-implement close modal globally
window.closeViewModal = function () {
  document.getElementById("viewModal").style.display = "none";
};

// Initialize the page
document.addEventListener("DOMContentLoaded", initOrdersPage);
