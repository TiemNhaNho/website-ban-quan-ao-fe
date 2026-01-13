const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (token) {
  localStorage.setItem("access_token", token);
  (async () => {
    await getCurrentUser();
    // Clean the URL so the token isn't visible
    window.history.replaceState({}, document.title, window.location.pathname);
  })();
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

function removeUserData() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

async function getCurrentUser() {
  if (typeof API_BASE_URL === "undefined") {
    var API_BASE_URL = "https://tiem-nha-nho-api.onrender.com";
  }
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
