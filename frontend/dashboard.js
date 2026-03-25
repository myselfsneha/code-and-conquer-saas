// =======================
// DASHBOARD.JS
// =======================

// =======================
// USER INFO
// =======================
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}
// Get stored email
const email = localStorage.getItem("email");

// Show welcome message
const welcomeText = document.getElementById("welcome");
if (welcomeText && email) {
    welcomeText.innerText = `Welcome, ${email}`;
}

// =======================
// LOGOUT
// =======================
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// =======================
// DASHBOARD ANALYTICS
// =======================
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

// Fetch dashboard stats from backend
async function loadDashboardData() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("https://code-and-conquer-saas.onrender.com/dashboard-stats", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        console.log("📊 DASHBOARD DATA:", data);

        // Update counts
        const studentEl = document.getElementById("studentCount");
        const courseEl = document.getElementById("courseCount");
        const tenantEl = document.getElementById("tenantCount");
        const activeEl = document.getElementById("activeUsers");

        if (studentEl) studentEl.innerText = data.total || 0;
        if (courseEl) courseEl.innerText = data.courseData.length;
        if (tenantEl) tenantEl.innerText = data.tenants || 1; // adjust if you have tenants
        if (activeEl) activeEl.innerText = data.total;
        // Render chart
        updateChart(data);

    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

// Update chart dynamically
function updateChart(data) {
    const ctx = document.getElementById("dashboardChart");

    if (!ctx || typeof Chart === "undefined") return;

    // ✅ SAFE DESTROY
    if (window.dashboardChart && typeof window.dashboardChart.destroy === "function") {
        window.dashboardChart.destroy();
    }

    const labels = data.courseData?.map(c => c.course) || [];
    const values = data.courseData?.map(c => c.count) || [];

    window.dashboardChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Students per Course",
                data: values,
                backgroundColor: "#2f6fed",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// =======================
// DARK MODE TOGGLE
// =======================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}