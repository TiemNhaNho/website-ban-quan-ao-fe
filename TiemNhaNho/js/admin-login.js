const submitButton = document.getElementsByName("submit")[0];
submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementsByName("email")[0].value;
  const password = document.getElementsByName("password")[0].value;
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
