const API = "https://code-and-conquer-saas.onrender.com";

const role = localStorage.getItem("role");

// 🔐 PROTECT ROUTE
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

// =====================
document.addEventListener("DOMContentLoaded", () => {
    setGreeting();
    loadDashboard();
});

// =====================
function setGreeting() {
    const hour = new Date().getHours();
    let msg = "Hello";

    if (hour < 12) msg = "Good Morning ☀️";
    else if (hour < 18) msg = "Good Afternoon 🌤";
    else msg = "Good Evening 🌙";

    document.getElementById("greeting").innerText = msg + ", " + role;
}

// =====================
async function loadDashboard() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API + "/students", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        const students = data.students || data;

        let total = students.length;

        document.querySelectorAll(".card-custom")[0].innerHTML =
            `👨‍🎓 Total Students<br><b>${total}</b>`;

    } catch (err) {
        console.error(err);
    }
}