function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (email === "" || password === "") {
        message.innerText = "Please fill all fields";
        return;
    }

    if (email === "admin@gmail.com" && password === "admin123") {
        localStorage.setItem("token", "fake-jwt-token");
        localStorage.setItem("email", email);

        console.log("Token saved:", localStorage.getItem("token")); // 🔍 DEBUG
        window.location.href = "dashboard.html";
    } else {
        message.innerText = "Invalid email or password";
    }
}