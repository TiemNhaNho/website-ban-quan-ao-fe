export async function getAllProducts() {
  try {
    // 1. Fetch both datasets simultaneously
    const [productsRes, variantsRes, categoriesRes] = await Promise.all([
      fetch("https://tiem-nha-nho-api.onrender.com/products").then((res) =>
        res.json()
      ),
      fetch("https://tiem-nha-nho-api.onrender.com/product-variants").then(
        (res) => res.json()
      ),
      fetch("https://tiem-nha-nho-api.onrender.com/categories").then((res) =>
        res.json()
      ),
    ]);

    const products = productsRes.data;
    const variants = variantsRes.data;
    const categories = categoriesRes.data;

    // 2. Map and Merge the data
    const combinedData = products.map((product) => {
      // Find the variant that belongs to this product
      // Note: If a product has multiple variants, this finds the first one.
      const variant = variants.find((v) => v.product_id === product.product_id);

      return {
        id: product.product_id,
        productName: product.product_name,
        categoryId: product.category_id,
        category:
          categories.find((cat) => cat.category_id === product.category_id)
            ?.category_name || "Unknown",
        priceOut: variant ? variant.price_out : 0, // Fallback to 0 if no variant found
        stockValue: variant ? variant.stock_quantity : 0,
        description: product.description,
        brand: product.brand,
      };
    });

    console.log(combinedData);
    return combinedData;
  } catch (error) {
    console.error("Error merging data:", error);
  }
}

export async function insertNewProduct(productData) {
  const token = localStorage.getItem("adminToken");
  try {
    // 1. Get Category ID if needed
    let categoryId = productData.category;
    // Basic check if it's a name instead of ID (assuming ID is number)
    if (isNaN(categoryId)) {
      const categoriesRes = await fetch(
        "https://tiem-nha-nho-api.onrender.com/categories"
      );
      const categoriesData = await categoriesRes.json();
      const category = categoriesData.data.find(
        (c) => c.category_name === productData.category
      );
      if (category) {
        categoryId = category.category_id;
      } else {
        throw new Error("Category not found");
      }
    }

    // 2. Create Product
    const productPayload = {
      product_name: productData.name,
      category_id: parseInt(categoryId),
      description: productData.description || "Sản phẩm mới",
      brand: "TiemNhaNho", // Default brand
    };

    const productRes = await fetch(
      "https://tiem-nha-nho-api.onrender.com/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      }
    );

    if (!productRes.ok) {
      const err = await productRes.json();
      throw new Error(err.message || "Failed to create product");
    }

    const productResponseData = await productRes.json();
    const newProductId = productResponseData.data.product_id;

    // 3. Create Variant (Price & Stock)
    const variantPayload = {
      product_id: newProductId,
      price_out: parseFloat(productData.price),
      price_in: parseFloat(productData.price) * 0.8, // Assuming cost price is 80% of selling price
      stock_quantity: parseInt(productData.stock),
      size: "M", // Default size
      color: "Đen", // Default color
      sku: `SKU-${Math.floor(Math.random() * (100000 - 1000) + 1000)}`, // Simple SKU generation
    };

    const variantRes = await fetch(
      "https://tiem-nha-nho-api.onrender.com/product-variants",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variantPayload),
      }
    );

    if (!variantRes.ok) {
      console.warn("Product created but variant creation failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Error inserting product:", error);
    throw error;
  }
}

export async function updateProduct(id, productData) {
  const token = localStorage.getItem("adminToken");
  try {
    // 1. Get Category ID if needed
    let categoryId = productData.category;
    if (isNaN(categoryId)) {
      const categoriesRes = await fetch(
        "https://tiem-nha-nho-api.onrender.com/categories"
      );
      const categoriesData = await categoriesRes.json();
      const category = categoriesData.data.find(
        (c) => c.category_name === productData.category
      );
      if (category) {
        categoryId = category.category_id;
      } else {
        throw new Error("Category not found");
      }
    }

    // 2. Prepare Payload
    const payload = {
      category_id: parseInt(categoryId),
      product_name: productData.name,
      description: productData.description,
      brand: "TiemNhaNho", // Default value
    };

    // 3. Send PUT request
    const res = await fetch(
      `https://tiem-nha-nho-api.onrender.com/products/${id}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to update product");
    }

    if (productData.price) {
      // Update price in variants
      const variantsRes = await fetch(
        "https://tiem-nha-nho-api.onrender.com/product-variants"
      );
      const variantsData = await variantsRes.json();
      const variant = variantsData.data.find(
        (v) => v.product_id === parseInt(id)
      );
      if (variant) {
        const payload = {
          product_id: parseInt(variant.product_id),
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price_out: parseFloat(productData.price),
        };

        const variantRes = await fetch(
          `https://tiem-nha-nho-api.onrender.com/product-variants/${variant.variant_id}`,
          {
            method: "PUT",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }
    }

    if (productData.stock) {
      // Fetch existing variants to find the correct one
      const variantsRes = await fetch(
        "https://tiem-nha-nho-api.onrender.com/product-variants"
      );
      const variantsData = await variantsRes.json();
      const variant = variantsData.data.find(
        (v) => v.product_id === parseInt(id)
      );
      if (variant) {
        const variantRes = await fetch(
          `https://tiem-nha-nho-api.onrender.com/product-variants/${
            variant.variant_id
          }?stock_quantity=${parseInt(productData.stock)}`,
          {
            method: "PATCH",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProductApi(id) {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(
      `https://tiem-nha-nho-api.onrender.com/products/${id}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete product");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
