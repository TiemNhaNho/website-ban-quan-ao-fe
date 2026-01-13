import * as apis from './api.js'

// Get category ID from URL parameter
function getCategoryIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('category_id');
}

// expose global
window.addToCart = async function (variantId, quantity = 1) {
  const customerId = Number(localStorage.getItem("userId")) //use this for when user login
  //for test
  //const customerId = 2

  if (!customerId || !variantId) {
    console.error("Missing customerId or variantId", customerId, variantId)
    return
  }

  await apis.addToCart(customerId, variantId, quantity)
  // redirect to cart page
  window.location.href = "cart.html"
}

function renderProduct(product, product_variant, product_image) {
  const variantId = product_variant?.variant_id || product_variant?.id
  const priceOut = product_variant?.price_out ?? 0

  return `
    <div class="product-item col-lg-4 col-md-6 col-sm-6">
      <div class="image-holder">
        <a href="single-product.html?id=${product.product_id}">
        <img 
          src="${product_image?.image_url}" 
          alt="${product.product_name}" 
          class="product-image">
        </a>
      </div>

      <div class="cart-concern">
        <div class="cart-button d-flex justify-content-between align-items-center">
          <button 
            type="button" 
            class="btn-wrap cart-link d-flex align-items-center"
            onclick="addToCart(${variantId}, 1)">
            add to cart <i class="icon icon-arrow-io"></i>
          </button>
        </div>
      </div>

      <div class="product-detail">
        <h3 class="product-title">
          <a href="single-product.html?id=${product.product_id}">
            ${product.product_name}
          </a>
        </h3>
        <div class="item-price text-primary">
          ${priceOut}K VND
        </div>
      </div>
    </div>
  `
}


async function loadProducts(categoryId = null) {
  const container = document.getElementById("product-list")
  
  // Show loading state
  container.innerHTML = '<div class="col-12 text-center"><p>Loading products...</p></div>'
  
  try {
    // Fetch products based on category
    let productsRes;
    if (categoryId) {
      console.log('Loading products for category:', categoryId);
      productsRes = await apis.getProductsByCategory(categoryId)
    } else {
      console.log('Loading all products');
      productsRes = await apis.getProducts()
    }
    
    const variantsRes = await apis.getProductVariants()
    const imagesRes = await apis.getProductImages()

    const products = productsRes.data ?? productsRes
    const variants = variantsRes.data ?? variantsRes
    const images = imagesRes.data ?? imagesRes

    console.log('Products loaded:', products.length);

    if (!products || products.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p>No products found in this category.</p></div>'
      return
    }

    container.innerHTML = products.map(product => {
      const variant = variants.find(v => v.product_id === product.product_id)
      const image = images.find(i => i.product_id === product.product_id)
      return renderProduct(product, variant, image)
    }).join("")
  } catch (err) {
    console.error('Error loading products:', err)
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Failed to load products. Please try again later.</p></div>'
  }
}

// Load products on page load
const categoryId = getCategoryIdFromURL();
if (categoryId) {
  console.log('Category ID from URL:', categoryId);
}
loadProducts(categoryId)

// Expose loadProducts globally for tab switching
window.loadProducts = loadProducts

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('product-search-form');
  const searchInput = document.getElementById('product-search-input');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchTerm = searchInput.value.trim().toLowerCase();
      
      if (!searchTerm) {
        // If empty, reload all products
        loadProducts(categoryId);
        return;
      }
      
      // Filter products by search term
      filterProductsBySearch(searchTerm);
    });
    
    // Real-time search on input
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.trim().toLowerCase();
      
      if (!searchTerm) {
        loadProducts(categoryId);
        return;
      }
      
      // Debounce search
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        filterProductsBySearch(searchTerm);
      }, 300);
    });
  }
});

async function filterProductsBySearch(searchTerm) {
  const container = document.getElementById("product-list");
  container.innerHTML = '<div class="col-12 text-center"><p>Searching...</p></div>';
  
  try {
    // Fetch all products first
    let productsRes;
    if (categoryId) {
      productsRes = await apis.getProductsByCategory(categoryId);
    } else {
      productsRes = await apis.getProducts();
    }
    
    const variantsRes = await apis.getProductVariants();
    const imagesRes = await apis.getProductImages();

    const allProducts = productsRes.data ?? productsRes;
    const variants = variantsRes.data ?? variantsRes;
    const images = imagesRes.data ?? imagesRes;
    
    // Filter products by search term
    const filteredProducts = allProducts.filter(product => {
      return product.product_name.toLowerCase().includes(searchTerm) ||
             (product.description && product.description.toLowerCase().includes(searchTerm));
    });
    
    console.log(`Found ${filteredProducts.length} products matching "${searchTerm}"`);
    
    if (filteredProducts.length === 0) {
      container.innerHTML = `<div class="col-12 text-center"><p>No products found for "${searchTerm}"</p></div>`;
      return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
      const variant = variants.find(v => v.product_id === product.product_id);
      const image = images.find(i => i.product_id === product.product_id);
      return renderProduct(product, variant, image);
    }).join("");
  } catch (err) {
    console.error('Error searching products:', err);
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Search failed. Please try again.</p></div>';
  }
}
