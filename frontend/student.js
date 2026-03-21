//role based UI
function getUserRole() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    // Split token → get payload → decode
    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.role;
}
console.log("ROLE:", getUserRole());

// 🚀 Load students automatically
window.onload = () => {

    fetchStudents(1); // load data first

    const role = getUserRole();
    console.log("ROLE:", role);

    if (role !== "admin") {
        hideAdminUI();
    }
};

/* =======================
   FETCH STUDENTS (SEARCH + FILTER)
======================= */
let currentPage = 1;
const limit = 5;

async function fetchStudents(page = 1) {

    console.log("✅ fetchStudents called");

    // 🚨 FIX: prevent event issue
    if (typeof page !== "number") {
        page = 1;
    }

    currentPage = page;

    const token = localStorage.getItem("token");

    const search = document.getElementById("search").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;

    let url = `http://localhost:3000/students?page=${page}&limit=${limit}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (course) url += `&course=${course}`;
    if (year) url += `&year=${year}`;

    console.log("🌐 URL:", url);

    try {
        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        console.log("📦 DATA:", data);

        const students = data.students || data;
        const total = data.total || students.length;

        renderTable(students);
        setupPagination(total);
        
        const role = getUserRole();
        if (role !== "admin") {
            hideAdminUI();
        }

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
}
    
function renderTable(students) {

    console.log("🎯 RENDERING STUDENTS:", students);

    const table = document.getElementById("tableBody");

    if (!table) {
        console.error("❌ tableBody not found in HTML");
        return;
    }

    let rows = "";

    if (students.length === 0) {
        rows = `<tr><td colspan="6">No students found</td></tr>`;
    } else {
        students.forEach(student => {
            rows += `
                <tr>
                    <td>${student.student_id}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.course}</td>
                    <td>${student.year}</td>
                    <td>
                        <button onclick="deleteStudent(${student.student_id})">🗑</button>
                    </td>
                </tr>
            `;
        });
    }

    console.log("🧱 FINAL ROWS:", rows);

    table.innerHTML = rows;
    
}

function hideAdminUI() {

    console.log("🚫 Hiding admin features");

    // 🔴 Hide Add Student button
    const addBtn = document.querySelector("button[onclick='addStudent()']");
    if (addBtn) addBtn.style.display = "none";

    // 🔴 Hide all Delete buttons
    document.querySelectorAll("button[onclick^='deleteStudent']").forEach(btn => {
        btn.style.display = "none";
    });
}

function setupPagination(total) {

    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) {
        document.getElementById("pagination").innerHTML = "";
        return;
    }

    let buttons = "";

    if (currentPage > 1) {
        buttons += `<button onclick="fetchStudents(${currentPage - 1})">◀ Prev</button>`;
    }

    buttons += ` <span>Page ${currentPage} of ${totalPages}</span> `;

    if (currentPage < totalPages) {
        buttons += `<button onclick="fetchStudents(${currentPage + 1})">Next ▶</button>`;
    }

    document.getElementById("pagination").innerHTML = buttons;
}
/* =======================
   ADD STUDENT
======================= */
function addStudent() {
    document.getElementById("studentModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("studentModal").style.display = "none";
}

async function saveStudent() {

    const token = localStorage.getItem("token");

    const name = document.getElementById("studentName").value;
    const email = document.getElementById("studentEmail").value;

    if (!name || !email) {
        alert("Please fill all fields");
        return;
    }

    const res = await fetch("http://localhost:3000/add-student", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            name,
            email,
            course: "BCA",
            year: 1,
            attendance: 80,
            fees_status: "Paid"
        })
    });

    const data = await res.json();

    showToast();
    closeModal();
    fetchStudents();
}

/* =======================
   DELETE STUDENT
======================= */
async function deleteStudent(id) {

    const token = localStorage.getItem("token");

    const confirmDelete = confirm("Are you sure?");
    if (!confirmDelete) return;

    await fetch(`http://localhost:3000/delete-student/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    fetchStudents(currentPage);
}

/* =======================
   EXPORT CSV
======================= */
function exportStudents() {

    const rows = document.querySelectorAll("#tableBody tr");

    let csv = "ID,Name,Email,Course,Year\n";

    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            csv += `${cols[0].innerText},${cols[1].innerText},${cols[2].innerText},${cols[3].innerText},${cols[4].innerText}\n`;
        }
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
}

/* =======================
   TOAST
======================= */
function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* =======================
   BACK
======================= */
function goBack() {
    window.location.href = "dashboard.html";
}