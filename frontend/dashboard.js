// =======================
// USER INFO
// =======================

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
// DASHBOARD COUNTS
// =======================
document.addEventListener("DOMContentLoaded", () => {

    const studentsCount = localStorage.getItem("studentsCount") || 0;
    const tenantsCount = localStorage.getItem("tenantsCount") || 0;
    const coursesCount = localStorage.getItem("coursesCount") || 0;

    const studentEl = document.getElementById("studentCount");
    const tenantEl = document.getElementById("tenantCount");
    const courseEl = document.getElementById("courseCount");

    if (studentEl) studentEl.innerText = studentsCount;
    if (tenantEl) tenantEl.innerText = tenantsCount;
    if (courseEl) courseEl.innerText = coursesCount;

    // =======================
    // CHART (SAFE)
    // =======================
    const ctx = document.getElementById("dashboardChart");

    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Students", "Tenants", "Courses"],
                datasets: [{
                    label: "System Data",
                    data: [studentsCount, tenantsCount, coursesCount],
                    backgroundColor: [
                        "#2f6fed",
                        "#6c5ce7",
                        "#00b894"
                    ],
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
});

// =======================
// DARK MODE
// =======================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}