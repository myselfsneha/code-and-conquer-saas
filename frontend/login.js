async function loginUser() {

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btn = document.querySelector("button");

    if (!role) {
        showToast("Select role ❌");
        return;
    }

    if (!email || !password) {
        showToast("Enter email & password ❌");
        return;
    }

    try {
        showLoader();

        btn.innerText = "Logging in...";
        btn.disabled = true;

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role, email, password })
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (!res.ok || !data.token) {
            showToast(data.message || "Login failed ❌");
            btn.innerText = "Login";
            btn.disabled = false;
            hideLoader();
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);

        showToast("Login successful ✅");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1200);

    } catch (err) {
        console.error(err);
        showToast("Server error ❌");
        btn.innerText = "Login";
        btn.disabled = false;
    }

    hideLoader();
}

/* ENTER KEY */
document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        loginUser();
    }
});
