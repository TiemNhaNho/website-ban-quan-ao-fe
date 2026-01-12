// Auth Check - Include this file on pages that require authentication
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
  const user = await checkAuth();

  // Find account link in header
  const accountLinks = document.querySelectorAll('a[href="login.html"]');

  if (user) {
    accountLinks.forEach((link) => {
      const parent = link.parentElement;
      if (parent) {
        parent.innerHTML = `
                    <div class="user-dropdown" style="position: relative; display: inline-block;">
                        <a href="#" class="user-link" style="display: flex; align-items: center; gap: 5px;">
                            <i class="icon icon-user"></i>
                            <span>${user.username}</span>
                        </a>
                        <div class="dropdown-menu" style="display: none; position: absolute; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-width: 150px; z-index: 1000; right: 0; top: 100%; margin-top: 10px; border-radius: 4px;">
                            <a href="account.html" style="display: block; padding: 10px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">My Account</a>
                            <a href="orders.html" style="display: block; padding: 10px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">My Orders</a>
                            <a href="#" onclick="handleLogout(); return false;" style="display: block; padding: 10px 15px; color: #d32f2f; text-decoration: none;">Logout</a>
                        </div>
                    </div>
                `;

        // Add dropdown toggle functionality
        const userLink = parent.querySelector(".user-link");
        const dropdownMenu = parent.querySelector(".dropdown-menu");

        if (userLink && dropdownMenu) {
          userLink.addEventListener("click", (e) => {
            e.preventDefault();
            dropdownMenu.style.display =
              dropdownMenu.style.display === "none" ? "block" : "none";
          });

          // Close dropdown when clicking outside
          document.addEventListener("click", (e) => {
            if (!parent.contains(e.target)) {
              dropdownMenu.style.display = "none";
            }
          });
        }
      }
    });
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
  updateHeader();
});
