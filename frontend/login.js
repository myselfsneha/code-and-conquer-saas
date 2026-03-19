async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!email || !password) {
        message.innerText = "Please fill all fields";
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // ✅ SAVE REAL TOKEN
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", email);

            console.log("REAL TOKEN:", data.token);

            window.location.href = "dashboard.html";
        } else {
            message.innerText = data.message || "Login failed";
        }

    } catch (error) {
        console.error("Login error:", error);
        message.innerText = "Server error";
    }
}