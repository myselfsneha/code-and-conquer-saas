// =======================
// GLOBAL STATE
// =======================
let currentPage = 1;
const limit = 5;
let selectedStudent = null;

// =======================
// ROLE BASED UI
// =======================
function getUserRole() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch {
        return null;
    }
}

// =======================
// INITIAL LOAD
// =======================
document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Page Loaded");

    fetchStudents(1);

    const role = getUserRole();
    console.log("👤 ROLE:", role);

    if (role !== "admin") {
        hideAdminUI();
    }
});

// =======================
// FETCH STUDENTS
// =======================
async function fetchStudents(page = 1) {

    if (typeof page !== "number") page = 1;
    currentPage = page;

    const token = localStorage.getItem("token");

    const searchEl = document.getElementById("search");
    const courseEl = document.getElementById("filterCourse");
    const yearEl = document.getElementById("filterYear");

    if (!searchEl || !courseEl || !yearEl) {
        console.error("❌ Missing filter elements");
        return;
    }

    const search = searchEl.value;
    const course = courseEl.value;
    const year = yearEl.value;

    let url = `http://localhost:3000/students?page=${page}&limit=${limit}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (course) url += `&course=${course}`;
    if (year) url += `&year=${year}`;

    try {
        const res = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        const students = data.students || data;
        const total = data.total || students.length;

        renderTable(students);
        setupPagination(total);

    } catch (err) {
        console.error("❌ Fetch Error:", err);
    }
}

// =======================
// RENDER TABLE
// =======================
function renderTable(students) {

    const table = document.getElementById("tableBody");
    if (!table) return;

    let rows = "";

    if (!students || students.length === 0) {
        rows = `<tr><td colspan="8">No students found</td></tr>`;
    } else {
        students.forEach(student => {

            // ✅ Fees display
            let feesStatus = "Pending";
            if (student.total_paid >= student.fees_total) {
                feesStatus = "Paid ✅";
            } else if (student.total_paid > 0) {
                feesStatus = `Partial (₹${student.total_paid})`;
            }

            // ✅ Attendance display
            let attendancePercent = student.attendance_percent || 0;
            let attendanceDisplay = `${attendancePercent}%`;

            rows += `
                <tr>
                    <td>${student.student_id}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.course}</td>
                    <td>${student.year}</td>

                    <!-- 💰 FEES COLUMN -->
                    <td>
                        ${feesStatus}
                    </td>

                    <!-- 📅 ATTENDANCE COLUMN -->
                    <td>
                        ${attendanceDisplay}
                    </td>

                    <!-- ACTIONS -->
                    <td>
                        <button onclick="openFeesModal(${student.student_id})">💰</button>
                        <button onclick="markAttendance(${student.student_id})">📅</button>
                        <button onclick="deleteStudent(${student.student_id})">🗑</button>
                    </td>
                </tr>
            `;
        });
    }

    table.innerHTML = rows;

    // Role check
    if (getUserRole() !== "admin") {
        hideAdminUI();
    }
}
// =======================
// PAGINATION
// =======================
function setupPagination(total) {

    const totalPages = Math.ceil(total / limit);
    const pagination = document.getElementById("pagination");

    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = "";
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

    pagination.innerHTML = buttons;
}

// =======================
// ROLE UI CONTROL
// =======================
function hideAdminUI() {

    console.log("🚫 Restricting UI");

    const addBtn = document.querySelector("button[onclick='openModal()']");
    if (addBtn) addBtn.style.display = "none";

    document.querySelectorAll("button[onclick^='deleteStudent']").forEach(btn => {
        btn.style.display = "none";
    });
}

// =======================
// MODAL CONTROL
// =======================
function openModal() {
    document.getElementById("studentModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("studentModal").style.display = "none";
}

// =======================
// ADD STUDENT
// =======================
async function addStudent() {

    const name = document.getElementById("studentName")?.value;
    const email = document.getElementById("studentEmail")?.value;
    const course = document.getElementById("studentCourse")?.value;
    const year = document.getElementById("studentYear")?.value;

    const token = localStorage.getItem("token");

    if (!name || !email || !course || !year) {
        alert("All fields required");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ name, email, course, year })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        showToast();
        closeModal();
        fetchStudents(1);

    } catch (err) {
        console.error(err);
    }
}

// =======================
// DELETE
// =======================
async function deleteStudent(id) {

    const token = localStorage.getItem("token");

    if (!confirm("Delete student?")) return;

    await fetch(`http://localhost:3000/delete-student/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
    });

    fetchStudents(currentPage);
}

// =======================
// FEES FUNCTIONS
// =======================
function openFeesModal(id) {
    selectedStudent = id;
    document.getElementById("feesModal").style.display = "flex";
}

function closeFeesModal() {
    document.getElementById("feesModal").style.display = "none";
}

async function submitFees() {

    const amount = document.getElementById("feesAmount")?.value;
    const token = localStorage.getItem("token");

    if (!amount) {
        alert("Enter amount");
        return;
    }

    try {
        await fetch("http://localhost:3000/add-fees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                student_id: selectedStudent,
                amount_paid: amount
            })
        });

        alert("Fees added");
        closeFeesModal();

    } catch (err) {
        console.error(err);
    }
}

// =======================
// ATTENDANCE
// =======================
async function markAttendance(id) {

    const token = localStorage.getItem("token");

    const status = confirm("Mark Present?") ? "present" : "absent";

    try {
        await fetch("http://localhost:3000/mark-attendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ student_id: id, status })
        });

        alert("Attendance marked");

    } catch (err) {
        console.error(err);
    }
}

// =======================
// EXPORT CSV
// =======================
function exportStudents() {

    const rows = document.querySelectorAll("#tableBody tr");

    let csv = "ID,Name,Email,Course,Year\n";

    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            csv += `${cols[0].innerText},${cols[1].innerText},${cols[2].innerText},${cols[3].innerText},${cols[4].innerText}\n`;
        }
    });

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
}

// =======================
// TOAST
// =======================
function showToast() {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// =======================
// NAVIGATION
// =======================
function goBack() {
    window.location.href = "dashboard.html";
}