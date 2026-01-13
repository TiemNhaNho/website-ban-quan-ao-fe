import * as apis from './api.js'

// Global variables for filtering
let allProductsData = {
  products: [],
  variants: [],
  images: []
};

let currentFilters = {
  search: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  sortBy: ''
};

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

function applyFiltersAndSort() {
  console.log('=== Applying filters ===');
  console.log('Current filters:', currentFilters);
  console.log('Total products:', allProductsData.products.length);
  
  let filteredProducts = [...allProductsData.products];
  
  // Apply category filter
  if (currentFilters.categoryId) {
    console.log('Filtering by category:', currentFilters.categoryId);
    
    // Show all products with their categories
    console.log('All products categories:');
    allProductsData.products.forEach(p => {
      console.log(`  - "${p.product_name}": category_id = ${p.category_id}`);
    });
    
    filteredProducts = filteredProducts.filter(product => {
      const match = product.category_id === currentFilters.categoryId;
      return match;
    });
    
    console.log('After category filter:', filteredProducts.length);
    console.log('Matched products:', filteredProducts.map(p => p.product_name));
  }
  
  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    console.log('Filtering by search:', searchTerm);
    filteredProducts = filteredProducts.filter(product => {
      return product.product_name.toLowerCase().includes(searchTerm) ||
             (product.description && product.description.toLowerCase().includes(searchTerm));
    });
    console.log('After search filter:', filteredProducts.length);
  }
  
  // Apply price filter
  if (currentFilters.minPrice !== null || currentFilters.maxPrice !== null) {
    console.log('Filtering by price:', currentFilters.minPrice, '-', currentFilters.maxPrice);
    filteredProducts = filteredProducts.filter(product => {
      const variant = allProductsData.variants.find(v => v.product_id === product.product_id);
      const price = variant?.price_out ?? 0;
      
      if (currentFilters.minPrice !== null && price < currentFilters.minPrice) {
        return false;
      }
      if (currentFilters.maxPrice !== null && price > currentFilters.maxPrice) {
        return false;
      }
      return true;
    });
    console.log('After price filter:', filteredProducts.length);
  }
  
  // Apply sorting
  if (currentFilters.sortBy) {
    console.log('Sorting by:', currentFilters.sortBy);
    filteredProducts.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'name-asc':
          return a.product_name.localeCompare(b.product_name);
        case 'name-desc':
          return b.product_name.localeCompare(a.product_name);
        case 'price-asc':
        case 'price-desc': {
          const variantA = allProductsData.variants.find(v => v.product_id === a.product_id);
          const variantB = allProductsData.variants.find(v => v.product_id === b.product_id);
          const priceA = variantA?.price_out ?? 0;
          const priceB = variantB?.price_out ?? 0;
          return currentFilters.sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
        }
        default:
          return 0;
      }
    });
  }
  
  // Render filtered products
  const container = document.getElementById("product-list");
  
  if (filteredProducts.length === 0) {
    container.innerHTML = '<div class="col-12 text-center"><p>No products found matching your filters.</p></div>';
    console.log('⚠️ No products to display');
    return;
  }
  
  container.innerHTML = filteredProducts.map(product => {
    const variant = allProductsData.variants.find(v => v.product_id === product.product_id);
    const image = allProductsData.images.find(i => i.product_id === product.product_id);
    return renderProduct(product, variant, image);
  }).join("");
  
  console.log(`✓ Showing ${filteredProducts.length} of ${allProductsData.products.length} products`);
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

    // Store data globally for filtering
    allProductsData = { products, variants, images };
    
    // Apply filters and render
    applyFiltersAndSort();
  } catch (err) {
    console.error('Error loading products:', err)
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Failed to load products. Please try again later.</p></div>'
  }
}

// Load products on page load
const categoryId = getCategoryIdFromURL();
if (categoryId) {
  console.log('Category ID from URL:', categoryId);
  currentFilters.categoryId = parseInt(categoryId);
}
loadProducts(categoryId)

// Load categories and setup tabs
async function loadCategoriesAndSetupTabs() {
  try {
    const categoriesRes = await apis.getCategories();
    const categories = categoriesRes.data ?? categoriesRes;
    
    console.log('=== Categories loaded ===');
    console.log('Categories:', categories);
    
    // Setup tab click handlers
    const tabs = document.querySelectorAll('.tabs .tab');
    console.log('Found tabs:', tabs.length);
    
    tabs.forEach((tab, index) => {
      const tabText = tab.textContent.trim();
      console.log(`Tab ${index}: "${tabText}"`);
      
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('=== Tab clicked ===');
        console.log('Tab text:', tabText);
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        if (tabText === 'All') {
          console.log('Showing all products');
          currentFilters.categoryId = null;
        } else {
          // Find category by name (case insensitive)
          const category = categories.find(c => {
            const categoryName = c.category_name.toLowerCase().trim();
            const searchName = tabText.toLowerCase().trim();
            console.log(`Comparing: "${categoryName}" === "${searchName}"`);
            return categoryName === searchName;
          });
          
          if (category) {
            console.log('Found category:', category);
            currentFilters.categoryId = category.category_id;
          } else {
            console.warn('Category not found for tab:', tabText);
            console.log('Available categories:', categories.map(c => c.category_name));
            currentFilters.categoryId = null;
          }
        }
        
        console.log('Current filter categoryId:', currentFilters.categoryId);
        applyFiltersAndSort();
      });
    });
    
    console.log('=== Tabs setup complete ===');
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// Call after products are loaded
loadCategoriesAndSetupTabs();

// Expose loadProducts globally for tab switching
window.loadProducts = loadProducts

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('product-search-form');
  const searchInput = document.getElementById('product-search-input');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      currentFilters.search = searchInput.value.trim().toLowerCase();
      applyFiltersAndSort();
    });
    
    // Real-time search on input
    searchInput.addEventListener('input', function() {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        currentFilters.search = this.value.trim().toLowerCase();
        applyFiltersAndSort();
      }, 300);
    });
  }
  
  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentFilters.sortBy = this.value;
      applyFiltersAndSort();
    });
  }
  
  // Price range radio buttons
  const priceRangeRadios = document.querySelectorAll('input[name="price-range"]');
  priceRangeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const [min, max] = this.value.split('-').map(Number);
        currentFilters.minPrice = min;
        currentFilters.maxPrice = max;
        
        // Clear custom price inputs
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        applyFiltersAndSort();
      }
    });
  });
  
  // Custom price filter
  const applyPriceBtn = document.getElementById('apply-price-filter');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  
  if (applyPriceBtn && minPriceInput && maxPriceInput) {
    applyPriceBtn.addEventListener('click', function() {
      const minVal = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
      const maxVal = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
      
      currentFilters.minPrice = minVal;
      currentFilters.maxPrice = maxVal;
      
      // Uncheck radio buttons
      priceRangeRadios.forEach(radio => radio.checked = false);
      
      applyFiltersAndSort();
    });
  }
  
  // Clear filters button
  const clearFiltersBtn = document.getElementById('clear-filters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Reset all filters
      currentFilters = {
        search: '',
        categoryId: null,
        minPrice: null,
        maxPrice: null,
        sortBy: ''
      };
      
      // Clear UI
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = '';
      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
      priceRangeRadios.forEach(radio => radio.checked = false);
      
      // Reset tabs to "All"
      const tabs = document.querySelectorAll('.tabs .tab');
      tabs.forEach(t => t.classList.remove('active'));
      const allTab = document.querySelector('.tabs .tab');
      if (allTab) allTab.classList.add('active');
      
      applyFiltersAndSort();
    });
  }
});

async function filterProductsBySearch(searchTerm) {
  currentFilters.search = searchTerm;
  applyFiltersAndSort();
}
