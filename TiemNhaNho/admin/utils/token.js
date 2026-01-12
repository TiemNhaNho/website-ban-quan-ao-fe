export function getAdminToken() {
  return localStorage.getItem("adminToken");
}

export function setAdminToken(token) {
  localStorage.setItem("adminToken", token);
}

export function clearAdminToken() {
  localStorage.removeItem("adminToken");
}
