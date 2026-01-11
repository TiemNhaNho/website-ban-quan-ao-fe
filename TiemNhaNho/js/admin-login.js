const submitButton = document.getElementsByName("login-submit")[0];
submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const loginUrl = "https://tiem-nha-nho-api.onrender.com/login";

  if (email == "admin@gmail.com") {
    fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data.data.access_token;
        if (accessToken) {
          localStorage.setItem("adminToken", accessToken);
          window.location.href = "admin/dashboard.html";
        } else {
          throw new Error("Login as admin failed");
        }
      })
      .catch((error) => {
        console.error("Cannot login as admin", error);
      });
  }
});
