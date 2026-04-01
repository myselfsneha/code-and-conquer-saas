// ===== LOADER =====
function showLoader(){
    let loader = document.getElementById("loader");
    if(loader) loader.style.display = "flex";
}

function hideLoader(){
    let loader = document.getElementById("loader");
    if(loader) loader.style.display = "none";
}

// ===== TOAST =====
function showToast(message, type="success"){
    let toast = document.getElementById("toast");

    if(!toast){
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast-box";
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.className = "toast-box " + (type === "success" ? "toast-success" : "toast-error");

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
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

// ===== SAVE LOGIN =====
function saveLogin(token){
    localStorage.setItem("token", token);
    localStorage.setItem("loginTime", new Date().getTime());
}

// ===== LOGOUT =====
function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}