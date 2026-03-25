async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const res = await fetch("https://code-and-conquer-saas.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        console.log("LOGIN RESPONSE:", data); // 🔍 DEBUG

        if (!res.ok) {
            message.innerText = data.message || "Login failed";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);

        window.location.href = "dashboard.html";

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        message.innerText = "Server error";
    }
}