// ===== AUTH =====
checkAuth();

// ===== LOAD DASHBOARD =====
async function loadDashboard(){
    showLoader();

    try{
        let res = await fetch(`${API}/students`);
        let data = await res.json();

        let totalStudents = data.length;
        let totalFees = 0;
        let pendingFees = 0;

        let courseCount = {
            BCA: 0,
            BBA: 0,
            MCA: 0
        };

        data.forEach(s => {
            totalFees += s.feesPaid || 0;

            if((s.feesPaid || 0) < 50000){
                pendingFees += (50000 - (s.feesPaid || 0));
            }

            if(courseCount[s.course] !== undefined){
                courseCount[s.course]++;
            }
        });

        // ===== UPDATE CARDS =====
        document.getElementById("totalStudents").innerText = totalStudents;
        document.getElementById("totalFees").innerText = "₹" + totalFees;
        document.getElementById("pendingFees").innerText = "₹" + pendingFees;
        document.getElementById("totalCourses").innerText = Object.keys(courseCount).length;

        // ===== RECENT STUDENTS =====
        let table = document.getElementById("recentStudents");
        table.innerHTML = "";

        data.slice(-5).reverse().forEach(s => {
            table.innerHTML += `
            <tr>
                <td>${s.name}</td>
                <td>${s.course}</td>
            </tr>`;
        });

        // ===== PIE CHART =====
        new Chart(document.getElementById("pieChart"), {
            type: "pie",
            data: {
                labels: ["Paid", "Pending"],
                datasets: [{
                    data: [totalFees, pendingFees]
                }]
            }
        });

        // ===== BAR CHART =====
        new Chart(document.getElementById("barChart"), {
            type: "bar",
            data: {
                labels: Object.keys(courseCount),
                datasets: [{
                    label: "Students",
                    data: Object.values(courseCount)
                }]
            }
        });

    }catch{
        showToast("Dashboard load failed ❌");
    }

    hideLoader();
}

// ===== DARK MODE =====
function toggleDark(){
    document.body.classList.toggle("dark");
}

// ===== START =====
loadDashboard();