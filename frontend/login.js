const API = "https://code-and-conquer-saas.onrender.com";

async function loginUser() {

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!role || !email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Login failed");
            return;
        }

        // ✅ SAVE TOKEN + ROLE
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);

        // ✅ REDIRECT BASED ON ROLE
        if (role === "admin") {
            window.location.href = "dashboard.html";
        } 
        else if (role === "tenant") {
            window.location.href = "dashboard.html";
        } 
        else {
            window.location.href = "dashboard.html";
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}