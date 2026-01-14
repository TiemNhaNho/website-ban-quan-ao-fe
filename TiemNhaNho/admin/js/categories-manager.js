const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";

window.categoriesData = {};

export async function getAllCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    const categories = json.data;

    // Update state
    window.categoriesData = {};
    categories.forEach((cat) => {
      window.categoriesData[cat.category_id] = cat;
    });

    renderCategoryTable(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    if (typeof showToast === "function") {
      showToast("Lỗi tải danh mục: " + error.message, "error");
    }
  }
}

export function renderCategoryTable(categories) {
  const tbody = document.getElementById("categoriesBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  categories.forEach((cat) => {
    const tr = document.createElement("tr");
    tr.className = "category-row";
    // Default to edit on row click, similar to products
    tr.onclick = () => openCategoryModal("edit", cat.category_id);

    tr.innerHTML = `
      <td>${cat.category_id}</td>
      <td>${cat.category_name}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="openCategoryModal('edit', ${cat.category_id})" title="Sửa">
            <img src="../public/sua.png" alt="Sửa" class="icon-img">
        </button>
        <button class="btn-icon" onclick="deleteCategory(${cat.category_id})" title="Xóa">
            <img src="../public/huy.png" alt="Xóa" class="icon-img">
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function openCategoryModal(mode, id = null) {
  const modalTitle = document.querySelector("#categoryModal h2");
  const form = document.getElementById("categoryForm");
  if (!form) return;

  // Reset form
  form.reset();
  form.dataset.categoryId = "";

  if (mode === "edit" && id) {
    modalTitle.textContent = "Sửa Danh Mục";
    const category = window.categoriesData[id];
    if (category) {
      const inputs = form.querySelectorAll("input, textarea");
      // Assuming inputs[0] is Name
      if (inputs[0]) inputs[0].value = category.category_name;
      form.dataset.categoryId = id;
    }
  } else {
    modalTitle.textContent = "Thêm Danh Mục";
  }

  if (typeof openModal === "function") {
    openModal("categoryModal");
  } else {
    // Fallback if openModal is not global
    const modal = document.getElementById("categoryModal");
    if (modal) modal.style.display = "block";
  }
}

export async function handleCategorySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll("input, textarea");
  const name = inputs[0].value;
  const id = form.dataset.categoryId;

  const token = localStorage.getItem("adminToken");

  try {
    const payload = { category_name: name };

    if (id) {
      // Update
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update category");
      if (typeof showToast === "function")
        showToast("Cập nhật danh mục thành công");
    } else {
      // Create
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create category");
      if (typeof showToast === "function")
        showToast("Thêm danh mục thành công");
    }

    if (typeof closeModal === "function") closeModal("categoryModal");
    else document.getElementById("categoryModal").style.display = "none";

    await getAllCategories();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function") showToast(error.message, "error");
  }
}

export async function deleteCategory(id) {
  if (typeof confirmDelete === "function" && !confirmDelete("danh mục")) return;
  if (
    typeof confirmDelete !== "function" &&
    !confirm("Bạn chắc chắn muốn xóa danh mục này?")
  )
    return;

  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete category");

    if (typeof showToast === "function") showToast("Đã xóa danh mục");
    await getAllCategories();
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function")
      showToast("Lỗi xóa danh mục: " + error.message, "error");
  }
}
