async function getAllCategories() {
  try {
    const categories = await fetch(
      "https://tiem-nha-nho-api.onrender.com/categories"
    )
      .then((res) => res.json())
      .then((data) => {
        return data.data;
      });

    document.getElementById("category").innerHTML = categories
      .map(
        (category) => `
    <option value="${category.category_id}">${category.category_name}</option>
`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

getAllCategories();

export async function getCategoryById(id) {
  try {
    const category = await fetch(
      `https://tiem-nha-nho-api.onrender.com/categories/${id}`
    )
      .then((res) => res.json())
      .then((data) => data.data.category_name);
    return category;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
}
