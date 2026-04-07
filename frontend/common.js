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


function showToast(msg){
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.display = "block";

    setTimeout(()=>{
        t.style.display = "none";
    },3000);
}

function showLoader(){
    document.getElementById("loader").style.display = "flex";
}

function hideLoader(){
    document.getElementById("loader").style.display = "none";
} 


// ===== AUTH CHECK =====
function checkAuth(){
    let token = localStorage.getItem("token");
    let loginTime = localStorage.getItem("loginTime");

    if(!token || !loginTime){
        window.location.href = "login.html";
        return;
    }

    let currentTime = new Date().getTime();

    if(currentTime - loginTime > TOKEN_EXPIRY){
        localStorage.clear();
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
    }
}

function saveLogin(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("loginTime", String(Date.now()));
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

function checkAuth() {
  const token = localStorage.getItem("token");
  const loginTime = Number(localStorage.getItem("loginTime") || 0);

  if (!token || !loginTime) {
    window.location.href = "login.html";
    return false;
  }

  const payload = parseJwt(token);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload?.exp && payload.exp < nowInSeconds) {
    localStorage.clear();
    showToast("Session expired. Please login again.", "error");
    setTimeout(() => (window.location.href = "login.html"), 800);
    return false;
  }

  if (Date.now() - loginTime > TOKEN_EXPIRY) {
    localStorage.clear();
    showToast("Session expired. Please login again.", "error");
    setTimeout(() => (window.location.href = "login.html"), 800);
    return false;
  }

  return true;
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
