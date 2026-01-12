// API Configuration (check if already defined)
if (typeof API_BASE_URL === "undefined") {
  var API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";
}

// Utility Functions
function showMessage(message, type = "success") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `alert alert-${type}`;
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === "success" ? "#4CAF50" : "#f44336"};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

function saveToken(token) {
  localStorage.setItem("access_token", token);
}

function getToken() {
  return localStorage.getItem("access_token");
}

function removeToken() {
  localStorage.removeItem("access_token");
}

function isLoggedIn() {
  return !!getToken();
}

// Login Function
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector(
    '#nav-sign-in input[name="username"]'
  ).value;

  // Prevent handling admin login logic here, it is handled in admin-login.js
  if (email === "admin@gmail.com") {
    return;
  }

  const password = document.querySelector(
    '#nav-sign-in input[name="password"]'
  ).value;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ thông tin", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.code === "200" && data.data) {
      saveToken(data.data.access_token);
      showMessage("Đăng nhập thành công!", "success");

      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else if (data.code === "403") {
      showMessage(
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
        "error"
      );
    } else if (data.code === "401") {
      showMessage("Email hoặc mật khẩu không đúng", "error");
    } else {
      showMessage(data.message || "Đăng nhập thất bại", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Lỗi kết nối đến server", "error");
  }
}

// Register Function
async function handleRegister(event) {
  event.preventDefault();

  const username = document.querySelector(
    '#nav-register input[name="username"]'
  ).value;
  const email = document.querySelector(
    '#nav-register input[name="username"]'
  ).value;
  const password = document.querySelector(
    '#nav-register input[name="password"]'
  ).value;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ thông tin", "error");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Email không hợp lệ", "error");
    return;
  }

  // Validate password length
  if (password.length < 8) {
    showMessage("Mật khẩu phải có ít nhất 8 ký tự", "error");
    return;
  }

  if (password.length > 128) {
    showMessage("Mật khẩu quá dài (tối đa 128 ký tự)", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username || email.split("@")[0],
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.code === "201") {
      showMessage(
        "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
        "success"
      );

      // Switch to login tab after 2 seconds
      setTimeout(() => {
        document.querySelector("#nav-sign-in-tab").click();
        // Clear register form
        document.querySelector('#nav-register input[name="username"]').value =
          "";
        document.querySelector('#nav-register input[name="password"]').value =
          "";
      }, 2000);
    } else if (data.code === "400") {
      showMessage("Email đã tồn tại", "error");
    } else {
      showMessage(data.message || "Đăng ký thất bại", "error");
    }
  } catch (error) {
    console.error("Register error:", error);
    showMessage("Lỗi kết nối đến server", "error");
  }
}

// Get Current User
async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

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
      localStorage.setItem("userId", JSON.stringify(data.data.id));
      localStorage.setItem("userName", data.data.username);
      localStorage.setItem("userEmail", data.data.email);
      return data.data;
    } else {
      removeToken();
      removeUserData();
      return null;
    }
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

function removeUserData() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

// Logout Function
function handleLogout() {
  removeToken();
  removeUserData();
  showMessage("Đã đăng xuất", "success");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// Update UI based on login status
async function updateUIForAuth() {
  if (isLoggedIn()) {
    const user = await getCurrentUser();
    if (user) {
      // Update header with user info
      const userMenu = document.querySelector(".user-menu");
      if (userMenu) {
        userMenu.innerHTML = `
                    <span>Xin chào, ${user.username}</span>
                    <button onclick="handleLogout()" class="btn btn-small">Đăng xuất</button>
                `;
      }
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Check if on login page
  const loginForm = document.querySelector("#nav-sign-in");
  const registerForm = document.querySelector("#nav-register");

  if (loginForm) {
    const loginButton = loginForm.querySelector('button[type="submit"]');
    if (loginButton) {
      loginButton.addEventListener("click", handleLogin);
    }
  }

  if (registerForm) {
    const registerButton = registerForm.querySelector('button[type="submit"]');
    if (registerButton) {
      registerButton.addEventListener("click", handleRegister);
    }
  }

  // Update UI for authenticated users
  updateUIForAuth();

  // Add CSS animations
  if (!document.querySelector("#auth-animations")) {
    const style = document.createElement("style");
    style.id = "auth-animations";
    style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
  }
});
