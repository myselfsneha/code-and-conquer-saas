// ❌ REMOVE THIS LINE (important)
// const API = "https://code-and-conquer-saas.onrender.com";

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = document.querySelector("button");

    if (!email || !password) {
        showToast("Enter email & password ❌", "error");
        return;
    }

    try {
        btn.innerText = "Logging in...";
        btn.disabled = true;

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Login failed ❌", "error");
            btn.innerText = "Login";
            btn.disabled = false;
            return;
        }

        // ✅ SAVE TOKEN + TIME (VERY IMPORTANT)
        localStorage.setItem("token", data.token);
        localStorage.setItem("loginTime", new Date().getTime());

        showToast("Login successful ✅");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        showToast("Server error ❌", "error");
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

// ❌ REMOVE OLD showToast (we now use common.js)

// ENTER KEY LOGIN
document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        loginUser();
    }
});