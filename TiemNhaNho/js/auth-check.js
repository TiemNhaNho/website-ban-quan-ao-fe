// Auth Check - Include this file on pages that require authentication
// Update this URL to match your backend
const API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";

function getToken() {
  return localStorage.getItem("access_token");
}

function removeToken() {
  localStorage.removeItem("access_token");
}

function isLoggedIn() {
  return !!getToken();
}

// Check if user is authenticated
async function checkAuth() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.code === "200" && data.data) {
      return data.data;
    } else {
      removeToken();
      return null;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    removeToken();
    return null;
  }
}

// Redirect to login if not authenticated
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

// Update header with user info
async function updateHeader() {
  console.log('=== updateHeader called ===');
  
  const user = await checkAuth();
  console.log('User data:', user);
  
  const accountItem = document.getElementById('user-account-item');
  const accountLink = document.getElementById('user-account-link');
  
  console.log('accountItem:', accountItem);
  console.log('accountLink:', accountLink);
  
  if (user && accountItem && accountLink) {
    console.log('Updating header with username:', user.username);
    
    // Update link to show username
    accountLink.innerHTML = `
      <i class="icon icon-user"></i>
      <span class="username">${user.username}</span>
    `;
    accountLink.href = '#';
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.id = 'user-dropdown-menu';
    dropdownMenu.innerHTML = `
      <a href="#" class="logout-link" onclick="handleLogout(); return false;">
        <i class="icon icon-power"></i>
        Logout
      </a>
    `;
    
    // Remove old dropdown if exists
    const oldDropdown = document.getElementById('user-dropdown-menu');
    if (oldDropdown) {
      oldDropdown.remove();
    }
    
    accountItem.appendChild(dropdownMenu);
    
    // Toggle dropdown on click
    accountLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Dropdown toggled');
      dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!accountItem.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
    
    console.log('✓ Header updated successfully');
  } else {
    console.log('Cannot update header:');
    console.log('  - user:', !!user);
    console.log('  - accountItem:', !!accountItem);
    console.log('  - accountLink:', !!accountLink);
  }
}

// Logout function
function handleLogout() {
  removeToken();

  // Show message
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: #4CAF50;
    color: white;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  messageDiv.textContent = "Đã đăng xuất thành công";
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log('DOM loaded, setting up header observer...');
  
  // Try to update immediately
  updateHeader();
  
  // Also watch for header being added dynamically
  const observer = new MutationObserver((mutations) => {
    const accountItem = document.getElementById('user-account-item');
    if (accountItem) {
      console.log('Header detected by observer, updating...');
      updateHeader();
      observer.disconnect();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also try after a short delay
  setTimeout(() => {
    console.log('Delayed update attempt...');
    updateHeader();
  }, 500);
});
