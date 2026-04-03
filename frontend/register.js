const API = "https://code-and-conquer-saas-11g6.onrender.com";

async function registerUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const tenant_id = document.getElementById("tenant").value;

    if (!name || !email || !password || !tenant_id) {
        showToast("Fill all fields ❌");
        return;
    }

    try {
        const res = await fetch(`${API}/register-admin`, {   // ✅ FIXED ROUTE
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                tenant_id
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Registration failed ❌");
            return;
        }

        showToast("Account created! ✅");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        showToast("Server error ❌");
    }
}