checkAuth();

let students = [];
let courses = [];

// ===== LOAD DASHBOARD DATA =====
async function loadDashboard(){
    showLoader();

    try{
        // STUDENTS
        const res1 = await fetch(`${API}/students?page=1&limit=100`, {
            headers: getAuthHeaders()
        });
        const data1 = await res1.json();

        students = data1.students || [];

        // COURSES
        const res2 = await fetch(`${API}/courses`, {
            headers: getAuthHeaders()
        });
        const data2 = await res2.json();

        courses = data2 || [];

        updateStats();
        renderCharts();
        renderTable();

    }catch(err){
        console.error(err);
        showToast("Dashboard error ❌","error");
    }

    hideLoader();
}

// ===== STATS =====
function updateStats(){
    document.getElementById("totalStudents").innerText = students.length;

    const totalFees = students.reduce((sum,s)=> sum + (s.total_paid || 0),0);
    document.getElementById("totalFees").innerText = "₹" + totalFees;

    const avgAttendance = students.length
        ? (students.reduce((sum,s)=> sum + (s.attendance_percentage || 0),0) / students.length).toFixed(1)
        : 0;

    document.getElementById("avgAttendance").innerText = avgAttendance + "%";

    document.getElementById("totalCourses").innerText = courses.length;
}

// ===== CHARTS =====
function renderCharts(){

    // PIE (COURSES)
    let courseMap = {};
    students.forEach(s=>{
        courseMap[s.course] = (courseMap[s.course] || 0) + 1;
    });

    new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: Object.keys(courseMap),
            datasets: [{
                data: Object.values(courseMap)
            }]
        }
    });

    // BAR (YEAR)
    let yearMap = {};
    students.forEach(s=>{
        yearMap[s.year] = (yearMap[s.year] || 0) + 1;
    });

    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: Object.keys(yearMap),
            datasets: [{
                label: "Students",
                data: Object.values(yearMap)
            }]
        }
    });
}

// ===== TABLE =====
function renderTable(){
    const table = document.getElementById("recentStudents");
    table.innerHTML = "";

    const latest = students.slice(0,5);

    latest.forEach(s=>{
        table.innerHTML += `
        <tr>
            <td>${s.name}</td>
            <td>${s.course}</td>
            <td>${s.year}</td>
            <td>₹${s.total_paid || 0}</td>
            <td>${s.attendance_percentage || 0}%</td>
        </tr>`;
    });
}

// INIT
loadDashboard();