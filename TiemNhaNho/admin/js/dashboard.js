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
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Helper: Status Badge Class (Copied/Shared logic)
function getStatusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "new":
      return "badge-new";
    case "paid":
      return "badge-paid";
    case "cancelled":
      return "badge-cancelled";
    case "pending":
      return "badge-pending";
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

async function initDashboard() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    // Redirect or show login (Optional, depending on layout)
    // window.location.href = "login.html";
  }

  try {
    // Fetch All Required Data
    const [ordersRes, productsRes, customersRes, detailsRes, variantsRes] =
      await Promise.all([
        fetch(`${API_URL}/orders`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/products`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/customers`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/order-details`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/product-variants`, { headers: getAuthHeaders() }),
      ]);

    const ordersJson = await ordersRes.json();
    const productsJson = await productsRes.json();
    const customersJson = await customersRes.json();
    const detailsJson = await detailsRes.json();
    const variantsJson = await variantsRes.json();

    const orders = ordersJson.data || [];
    const products = productsJson.data || [];
    const customers = customersJson.data || [];
    const orderDetails = detailsJson.data || [];
    const variants = variantsJson.data || [];

    // 1. Update Stats Cards
    updateStats(orders, products, customers);

    // 2. Update Recent Orders Table
    updateRecentOrders(orders, customers);

    // 3. Update Top Products
    updateTopProducts(products, orderDetails, variants);
  } catch (error) {
    console.error("Dashboard Init Error:", error);
  }
}

function updateStats(orders, products, customers) {
  // Total Orders
  document.querySelector(".stat-icon.orders + .stat-info h3").textContent =
    orders.length;

  // Revenue
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total_money) || 0),
    0
  );
  document.querySelector(".stat-icon.revenue + .stat-info h3").textContent =
    formatCurrency(totalRevenue);

  // Products
  document.querySelector(".stat-icon.products + .stat-info h3").textContent =
    products.length;

  // Customers
  document.querySelector(".stat-icon.customers + .stat-info h3").textContent =
    customers.length;
}

function updateRecentOrders(orders, customers) {
  // Sort orders by date descending (assuming order_date exists, or order_id implies recency)
  // If order_date is reliable:
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date)
  );

  // Take top 5
  const recentOrders = sortedOrders.slice(0, 5);

  const recentOrdersTableBody = document.querySelector(
    "#recentOrdersTable tbody"
  );

  if (recentOrdersTableBody) {
    recentOrdersTableBody.innerHTML = recentOrders
      .map((order) => {
        const customer = customers.find((c) => c.id === order.customer_id);
        const customerName = customer
          ? customer.username
          : `Unknown (${order.customer_id})`;

        return `
                <tr>
                    <td>#${order.order_id}</td>
                    <td>${customerName}</td>
                    <td>${formatDate(order.order_date)}</td>
                    <td>${formatCurrency(order.total_money)}</td>
                    <td><span class="badge ${getStatusBadgeClass(
                      order.order_status
                    )}">${order.order_status}</span></td>
                </tr>
            `;
      })
      .join("");
  }
}

function updateTopProducts(products, orderDetails, variants) {
  // Map Variant ID -> Product ID
  const variantToProductMap = new Map();
  variants.forEach((v) => variantToProductMap.set(v.variant_id, v.product_id));

  // Aggregate Stats by Product ID
  const productStats = new Map(); // ProductID -> { qty, revenue }

  orderDetails.forEach((item) => {
    const productId = variantToProductMap.get(item.variant_id);
    if (!productId) return;

    if (!productStats.has(productId)) {
      productStats.set(productId, { qty: 0, revenue: 0 });
    }

    const stats = productStats.get(productId);
    stats.qty += Number(item.quantity) || 0;
    stats.revenue +=
      (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
  });

  // Convert to Array and Sort
  const topProducts = [];
  productStats.forEach((stats, productId) => {
    const product = products.find((p) => p.product_id === productId);
    if (product) {
      topProducts.push({
        name: product.product_name,
        qty: stats.qty,
        revenue: stats.revenue,
      });
    }
  });

  // Sort by Revenue Descending
  topProducts.sort((a, b) => b.revenue - a.revenue);

  // Take top 5
  const top5 = topProducts.slice(0, 5);

  // Render
  const tbody = document.querySelector("#topProductsTable tbody");
  if (tbody) {
    if (top5.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center">Chưa có dữ liệu sản phẩm</td></tr>';
      return;
    }

    tbody.innerHTML = top5
      .map(
        (p) => `
            <tr>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>${formatCurrency(p.revenue)}</td>
            </tr>
        `
      )
      .join("");
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
