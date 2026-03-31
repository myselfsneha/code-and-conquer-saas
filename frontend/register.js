const API = "https://code-and-conquer-saas.onrender.com";

async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showToast("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Registration failed");
            return;
        }

        showToast("Account created!");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        showToast("Server error");
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}