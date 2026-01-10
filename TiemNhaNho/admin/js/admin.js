// Admin Utility Functions

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
  }
}

function closeModal(modalId = null) {
  if (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
    }
  } else {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.style.display = "none";
    });
  }
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});

// Search/Filter Table
function searchTable(tableId, searchValue) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");
  const searchTerm = searchValue.toLowerCase();

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Format Currency
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

// Format Date
function formatDate(date) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("vi-VN", options);
}

// Confirm Delete
function confirmDelete(item) {
  return confirm(`Bạn chắc chắn muốn xóa ${item} này?`);
}

// Show Toast Message
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#4caf50" : "#f44336"};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 2000;
    animation: slideInRight 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Pagination Helper
function paginate(array, pageNumber, pageSize = 10) {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}

// Form Validation
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "#f44336";
      isValid = false;
    } else {
      input.style.borderColor = "#e0e0e0";
    }
  });

  return isValid;
}

// Reset Form
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.style.borderColor = "#e0e0e0";
    });
  }
}

// Get Form Data
function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return null;

  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

// Delete from Table
function deleteFromTable(tableId, rowIndex) {
  const table = document.getElementById(tableId);
  if (table && table.rows[rowIndex]) {
    table.deleteRow(rowIndex);
  }
}

// Add Row to Table
function addRowToTable(tableId, rowData) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const row = table.insertRow();
  rowData.forEach((cell) => {
    const td = row.insertCell();
    td.textContent = cell;
  });
}

// Export to CSV
function exportTableToCSV(tableId, filename = "export.csv") {
  const table = document.getElementById(tableId);
  if (!table) return;

  let csv = [];
  const rows = table.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td, th");
    const rowData = Array.from(cells).map((cell) => {
      let text = cell.textContent.trim();
      if (text.includes(",") || text.includes('"')) {
        text = `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    });
    csv.push(rowData.join(","));
  });

  const csvContent =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csv.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", filename);
  link.click();
}

// Initialize Admin UI
function initAdminUI() {
  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // Format all currency values
  document.querySelectorAll("[data-currency]").forEach((el) => {
    el.textContent = formatCurrency(parseFloat(el.dataset.currency));
  });

  // Format all dates
  document.querySelectorAll("[data-date]").forEach((el) => {
    el.textContent = formatDate(el.dataset.date);
  });

  // Fetch and display admin data
  getAdminData();
}

// Get admin data
function getAdminData() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "../login.html";
    return;
  }
  fetch("https://tiem-nha-nho-api.onrender.com/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    response
      .json()
      .then((data) => {
        const { username } = data.data;
        document.getElementsByClassName(
          "subtitle"
        )[0].textContent = `Xin chào, ${username}`;
        document.getElementById("user-name").textContent = username;
      })
      .catch((error) => {
        console.error("Error fetching admin data:", error);
      });
  });
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", initAdminUI);
