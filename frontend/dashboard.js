// FRONTEND-ONLY VERSION (SAFE)

// Read stored email (optional)
const email = localStorage.getItem("email");

// Show welcome text
const welcomeText = document.getElementById("welcome");
if (welcomeText && email)
{
    welcomeText.innerText = `Welcome, ${email}`;
}

const studentCount = localStorage.getItem("studentsCount");

if (studentCount) {
    const studentCard = document.querySelector(".card:nth-child(1) p");
    if (studentCard) {
        studentCard.innerText = studentCount;
    }
}

// Logout function
function logout()
{
    localStorage.clear();
    window.location.href = "login.html";
}

// Update counts on dashboard
document.addEventListener("DOMContentLoaded", () => {
    const studentCount = localStorage.getItem("studentsCount") || 0;
    const tenantCount = localStorage.getItem("tenantsCount") || 0;
    const courseCount = localStorage.getItem("coursesCount") || 0;

    const studentEl = document.getElementById("studentCount");
    const tenantEl = document.getElementById("tenantCount");
    const courseEl = document.getElementById("courseCount");

    if (studentEl) studentEl.innerText = studentCount;
    if (tenantEl) tenantEl.innerText = tenantCount;
    if (courseEl) courseEl.innerText = courseCount;
});
const studentsCount = localStorage.getItem("studentsCount") || 0;
const tenantsCount = localStorage.getItem("tenantsCount") || 0;
const coursesCount = localStorage.getItem("coursesCount") || 0;

const ctx = document.getElementById("dashboardChart");

if (ctx) {
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
function toggleDarkMode(){
    document.body.classList.toggle("dark-mode");
}