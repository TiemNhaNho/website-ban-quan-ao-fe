const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";

window.suppliersData = {};
const token = localStorage.getItem("adminToken");

export async function getAllSuppliers() {
  try {
    const res = await fetch(`${API_BASE_URL}/suppliers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    const json = await res.json();
    const suppliers = json.data;

    // Update state
    window.suppliersData = {};
    suppliers.forEach((sup) => {
      window.suppliersData[sup.supplier_id] = sup;
    });

    renderSuppliersTable(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    if (typeof showToast === "function") {
      showToast("Lỗi tải nhà cung cấp: " + error.message, "error");
    }
  }
}

export async function getSupplierById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch supplier");
    return await res.json();
  } catch (error) {
    console.error("Error fetching supplier:", error);
    throw error;
  }
}

export async function createSupplier(data) {
  const res = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create supplier");
  return await res.json();
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update supplier");
  return await res.json();
}

export async function deleteSupplier(id) {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete supplier");
  return await res.json();
}

export function renderSuppliersTable(suppliers) {
  const tbody = document.getElementById("suppliersBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  suppliers.forEach((sup) => {
    const tr = document.createElement("tr");
    tr.className = "supplier-row";
    tr.onclick = () => openSupplierModal(sup.supplier_id);

    tr.innerHTML = `
      <td>${sup.supplier_id}</td>
      <td>${sup.supplier_name}</td>
      <td>${sup.phone}</td>
      <td>${sup.address}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="openSupplierModal(${sup.supplier_id})" title="Sửa">
            <img src="../public/sua.png" alt="Sửa" class="icon-img">
        </button>
        <button class="btn-icon" onclick="handleDeleteSupplier(${sup.supplier_id})" title="Xóa">
            <img src="../public/huy.png" alt="Xóa" class="icon-img">
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Ensure the UI logic is attached to window for HTML access
window.openAddModal = function () {
  const form = document.getElementById("supplierForm");
  if (!form) return;
  form.reset();
  form.dataset.supplierId = "";

  const modalTitle = document.querySelector("#supplierModal h2");
  if (modalTitle) modalTitle.textContent = "Thêm Nhà Cung Cấp";

  if (typeof openModal === "function") openModal("supplierModal");
};

window.openSupplierModal = function (id) {
  // If id is provided, it's an edit action
  const supplier = window.suppliersData[id];
  if (supplier) {
    const form = document.getElementById("supplierForm");
    const inputs = form.querySelectorAll("input, textarea");

    // Mapping fields: supplier_name, phone, address
    // Assuming order in HTML: Name, Email (ignored/not in edit payload?), Phone, Address
    // Note: The prompt only mentions supplier_name, phone, address for create/update body.
    // The existing HTML has Name, Email, Phone, Address.
    // We will fill what we have.

    inputs[0].value = supplier.supplier_name;
    // Skipping email input[1] if NOT part of payload, but if it exists in data we can show it
    // The prompt says "Body: supplier_name, phone, address" for create/update
    // so we focus on those. existing HTML has email input which might be unused or read-only?
    // For now let's fill it if provided or leave blank

    inputs[2].value = supplier.phone;
    inputs[3].value = supplier.address;

    form.dataset.supplierId = id;

    const modalTitle = document.querySelector("#supplierModal h2");
    if (modalTitle) modalTitle.textContent = "Sửa Nhà Cung Cấp";

    if (typeof openModal === "function") openModal("supplierModal");
  }
};

window.handleDeleteSupplier = async function (id) {
  if (typeof confirmDelete === "function" && !confirmDelete("nhà cung cấp"))
    return;
  if (
    typeof confirmDelete !== "function" &&
    !confirm("Bạn chắc chắn muốn xóa?")
  )
    return;

  try {
    await deleteSupplier(id);
    if (typeof showToast === "function") showToast("Đã xóa nhà cung cấp");
    await getAllSuppliers();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function")
      showToast("Xóa thất bại: " + error.message, "error");
  }
};

export async function handleSupplierSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll("input, textarea");

  // HTML Structure: Name (0), Email (1), Phone (2), Address (3)
  const name = inputs[0].value;
  // const email = inputs[1].value; // Not used in API payload per prompt
  const phone = inputs[2].value;
  const address = inputs[3].value;

  if (!name) {
    if (typeof showToast === "function")
      showToast("Tên nhà cung cấp là bắt buộc", "error");
    return;
  }

  const id = form.dataset.supplierId;
  const payload = { supplier_name: name, phone: String(phone), address };

  try {
    if (id) {
      // Update
      await updateSupplier(id, payload);
      if (typeof showToast === "function") showToast("Cập nhật thành công");
    } else {
      // Create
      await createSupplier(payload);
      if (typeof showToast === "function") showToast("Thêm mới thành công");
    }

    if (typeof closeModal === "function") closeModal("supplierModal");
    await getAllSuppliers();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function") showToast(error.message, "error");
  }
}
