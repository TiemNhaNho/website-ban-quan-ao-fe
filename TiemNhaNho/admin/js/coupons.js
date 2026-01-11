const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";

window.couponsData = {};

export async function getAllCoupons() {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons`);
    if (!res.ok) throw new Error("Failed to fetch coupons");
    const json = await res.json();
    const coupons = json.data || [];

    window.couponsData = {};
    coupons.forEach((coupon) => {
      window.couponsData[coupon.coupon_id] = coupon;
    });

    renderCouponsTable(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    if (typeof showToast === "function")
      showToast("Lỗi tải mã giảm giá: " + error.message, "error");
  }
}

export async function getCouponById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/${id}`);
    if (!res.ok) throw new Error("Failed to fetch coupon details");
    return await res.json();
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw error;
  }
}

export async function createCoupon(payload) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE_URL}/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create coupon");
  return await res.json();
}

export async function updateCoupon(id, payload) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update coupon");
  return await res.json();
}

export async function deleteCoupon(id) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete coupon");
  return await res.json();
}

// UI Functions

function formatDateTimeForInput(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Format to YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateDisplay(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return (
    date.toLocaleDateString("vi-VN") +
    " " +
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
}

function getStatusBadge(coupon) {
  const now = new Date();
  const end = new Date(coupon.end_date);
  const start = new Date(coupon.start_date);
  const used = coupon.used_count || 0;
  const limit = coupon.usage_limit || Infinity;

  if (now > end) return '<span class="badge badge-danger">Expired</span>';
  if (used >= limit) return '<span class="badge badge-warning">Sold Out</span>';
  if (now < start) return '<span class="badge badge-info">Upcoming</span>';
  return '<span class="badge badge-success">Active</span>';
}

export function renderCouponsTable(coupons) {
  const tbody = document.getElementById("couponsBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  coupons.forEach((coupon) => {
    const tr = document.createElement("tr");
    tr.className = "coupon-row";
    tr.onclick = () => openViewModal(coupon.coupon_id);

    // Calculate usage ratio
    const used = coupon.used_count || 0;
    const limit = coupon.usage_limit || 0;
    const usageDisplay =
      limit > 0
        ? `<div class="progress-container" title="${used}/${limit} used">
            <div class="progress-bar" style="width: ${
              (used / limit) * 100
            }%"></div>
            <span class="progress-text">${used}/${limit}</span>
         </div>`
        : `${used} / ∞`;

    tr.innerHTML = `
      <td>${coupon.coupon_id}</td>
      <td><strong>${coupon.code}</strong></td>
      <td>${
        coupon.discount_type === "Percentage" ? "Phần trăm" : "Tiền mặt"
      }</td>
      <td>${
        coupon.discount_type === "Percentage"
          ? coupon.discount_value + "%"
          : formatCurrency(coupon.discount_value)
      }</td>
      <td>${formatDateDisplay(
        coupon.start_date
      )}<br><small>to</small><br>${formatDateDisplay(coupon.end_date)}</td>
      <td>${usageDisplay}</td>
      <td>${getStatusBadge(coupon)}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="openEditModal(${
          coupon.coupon_id
        })" title="Sửa">
            <img src="../images/sua.png" alt="Sửa" class="icon-img">
        </button>
        <button class="btn-icon" onclick="handleDeleteCoupon(${
          coupon.coupon_id
        })" title="Xóa">
            <img src="../images/huy.png" alt="Xóa" class="icon-img">
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global functions attached to window
window.openAddModal = function () {
  const form = document.getElementById("couponForm");
  if (!form) return;

  form.reset();
  form.dataset.couponId = "";

  // Set default dates if needed (e.g., today and tomorrow)

  document.querySelector("#couponModal h2").textContent = "Thêm Mã Giảm Giá";

  // Reset logic for disabled max_discount if needed
  const discountTypeSelect = form.querySelector('select[name="discount_type"]');
  if (discountTypeSelect) discountTypeSelect.dispatchEvent(new Event("change"));

  if (typeof openModal === "function") openModal("couponModal");
};

window.openEditModal = function (id) {
  const coupon = window.couponsData[id];
  if (coupon) {
    const form = document.getElementById("couponForm");
    // Mapping fields
    // Order of inputs depends on HTML structure. Let's assume selecting by name/id is safer if IDs existed,
    // but based on existing HTML, we used querySelectorAll.
    // We probably need to update HTML to have IDs or names for easier selection.
    // For now, let's update HTML first to include IDs/names, or select carefully.

    document.getElementById("couponCode").value = coupon.code;
    document.getElementById("discountType").value = coupon.discount_type;
    document.getElementById("discountValue").value = coupon.discount_value;
    document.getElementById("startDate").value = formatDateTimeForInput(
      coupon.start_date
    );
    document.getElementById("endDate").value = formatDateTimeForInput(
      coupon.end_date
    );
    document.getElementById("usageLimit").value = coupon.usage_limit;

    // Handle max_discount logic
    const maxDiscountInput = document.getElementById("maxDiscount");
    if (maxDiscountInput) {
      maxDiscountInput.value = coupon.max_discount || "";
      // Trigger change event to specific UI state
      document
        .getElementById("discountType")
        .dispatchEvent(new Event("change"));
    }

    form.dataset.couponId = id;
    document.querySelector("#couponModal h2").textContent = "Sửa Mã Giảm Giá";

    if (typeof openModal === "function") openModal("couponModal");
  }
};

window.handleDeleteCoupon = async function (id) {
  if (typeof confirmDelete === "function" && !confirmDelete("mã giảm giá"))
    return;
  if (
    typeof confirmDelete !== "function" &&
    !confirm("Bạn chắc chắn muốn xóa?")
  )
    return;

  try {
    await deleteCoupon(id);
    if (typeof showToast === "function") showToast("Đã xóa mã giảm giá");
    await getAllCoupons();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function")
      showToast("Xóa thất bại: " + error.message, "error");
  }
};

// View Modal
window.openViewModal = function (id) {
  const coupon = window.couponsData[id];
  if (!coupon) return;

  // Create or reuse modal logic similar to existing one but dynamically
  // Using a simpler approach: alert or console log not enough, we need a modal.
  // We can inject modal HTML.

  // Check if viewModal exists, remove it
  const existingModal = document.getElementById("viewModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "viewModal";
  modal.style.display = "block";
  modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Chi Tiết Mã Giảm Giá</h2>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div><strong>Mã Coupon:</strong> <p>${coupon.code}</p></div>
            <div><strong>Trạng Thái:</strong> <p>${getStatusBadge(
              coupon
            )}</p></div>
            <div><strong>Loại:</strong> <p>${coupon.discount_type}</p></div>
            <div><strong>Giá Trị:</strong> <p>${coupon.discount_value}</p></div>
            <div><strong>Ngày Bắt Đầu:</strong> <p>${formatDateDisplay(
              coupon.start_date
            )}</p></div>
            <div><strong>Ngày Kết Thúc:</strong> <p>${formatDateDisplay(
              coupon.end_date
            )}</p></div>
            <div><strong>Đã Dùng:</strong> <p>${
              coupon.used_count || 0
            }</p></div>
            <div><strong>Giới Hạn:</strong> <p>${
              coupon.usage_limit || "Không giới hạn"
            }</p></div>
          </div>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  // Close on click outside
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
};

export async function handleCouponSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const code = document.getElementById("couponCode").value;
  const discountType = document.getElementById("discountType").value;
  const discountValue = parseFloat(
    document.getElementById("discountValue").value
  );
  const startDate = document.getElementById("startDate").value; // value is YYYY-MM-DDTHH:MM
  const endDate = document.getElementById("endDate").value;
  const usageLimit = parseInt(document.getElementById("usageLimit").value) || 0;
  const maxDiscountInput = document.getElementById("maxDiscount");

  let maxDiscount = parseFloat(maxDiscountInput.value) || 0;

  // Logic: if Fixed, max_discount can be same as discount_value or 0 (meaning strict)
  if (discountType === "Fixed") {
    maxDiscount = discountValue;
  }

  // Convert dates to ISO strings if needed (HTML5 datetime-local value is close to ISO but misses seconds/timezone sometimes)
  // API expects "2025-12-31T02:51:15"
  const startISO = new Date(startDate).toISOString();
  const endISO = new Date(endDate).toISOString();

  const payload = {
    code,
    discount_type: discountType,
    discount_value: discountValue,
    max_discount: maxDiscount,
    start_date: startISO,
    end_date: endISO,
    usage_limit: usageLimit,
    // used_count is usually read-only or not updated manually here
  };

  const id = form.dataset.couponId;

  try {
    if (id) {
      await updateCoupon(id, payload);
      if (typeof showToast === "function")
        showToast("Cập nhật coupon thành công");
    } else {
      await createCoupon(payload);
      if (typeof showToast === "function")
        showToast("Thêm coupon mới thành công");
    }

    if (typeof closeModal === "function") closeModal("couponModal");
    await getAllCoupons();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function")
      showToast("Lỗi: " + error.message, "error");
  }
}
