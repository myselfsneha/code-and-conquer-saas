function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

function showToast(message, type = "success") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-box";
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.className = `toast-box ${type === "success" ? "toast-success" : "toast-error"}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

// ===== AUTH =====
function checkAuth() {
  const token = localStorage.getItem("token");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  if (!token || !loginTime) {
    window.location.href = "login.html";
    return false;
  }

  const now = Date.now();
  if (now - loginTime > TOKEN_EXPIRY) {
    localStorage.clear();
    alert("Session expired");
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function saveLogin(token) {
  localStorage.setItem("token", token);
  localStorage.setItem("loginTime", String(Date.now()));
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}