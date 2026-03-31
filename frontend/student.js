const API = "https://code-and-conquer-saas.onrender.com";

// TEMP LOGIN (REMOVE LATER)
if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "test123");
}

let currentPage = 1;
const limit = 5;

// ==========================
// LOAD
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    fetchCourses();   // 🔥 NEW
    fetchStudents(1);
});

// ==========================
// FETCH COURSES (NEW 🔥)
// ==========================
async function fetchCourses() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API + "/courses", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        const courses = data.courses || data;

        const dropdown = document.getElementById("studentCourse");

        dropdown.innerHTML = `<option value="">Select Course</option>`;

        courses.forEach(c => {
            dropdown.innerHTML += `
                <option value="${c.course_name}">
                    ${c.course_name}
                </option>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Error loading courses");
    }
}

// ==========================
// FETCH STUDENTS
// ==========================
async function fetchStudents(page = 1) {

    currentPage = page;

    const token = localStorage.getItem("token");

    const search = document.getElementById("search")?.value || "";
    const course = document.getElementById("filterCourse")?.value || "";
    const year = document.getElementById("filterYear")?.value || "";

    let url = `${API}/students?page=${page}&limit=${limit}`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (course) url += `&course=${course}`;
    if (year) url += `&year=${year}`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        const students = data.students || data;

        renderTable(students);

    } catch (err) {
        console.error(err);
        alert("Error fetching students");
    }
}

// ==========================
// TABLE
// ==========================
function renderTable(students) {

    const table = document.getElementById("tableBody");

    if (!students.length) {
        table.innerHTML = `
        <tr>
            <td colspan="8">No students found</td>
        </tr>`;
        return;
    }

    let rows = "";

    students.forEach(s => {

        rows += `
        <tr>
            <td>${s.student_id || "-"}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.course}</td>
            <td>${s.year}</td>
            <td>₹${s.total_paid || 0}</td>
            <td>${s.attendance_percentage || 0}%</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.student_id})">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    table.innerHTML = rows;
}

// ==========================
// ADD STUDENT
// ==========================
async function addStudent() {

    const name = document.getElementById("studentName").value;
    const email = document.getElementById("studentEmail").value;
    const course = document.getElementById("studentCourse").value;
    const year = document.getElementById("studentYear").value;

    const token = localStorage.getItem("token");

    if (!name || !email || !course || !year) {
        alert("Fill all fields");
        return;
    }

    try {
        await fetch(`${API}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                name,
                email,
                course,
                year,
                fees_total: 50000
            })
        });

        alert("Student added");
        closeModal();
        fetchStudents(1);

    } catch (err) {
        console.error(err);
        alert("Error adding student");
    }
}

// ==========================
// DELETE
// ==========================
async function deleteStudent(id) {

    const token = localStorage.getItem("token");

    if (!confirm("Delete student?")) return;

    try {
        await fetch(`${API}/delete-student/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        alert("Deleted");
        fetchStudents(currentPage);

    } catch (err) {
        console.error(err);
        alert("Error deleting");
    }
}

// ==========================
// MODAL
// ==========================
function openModal(){
    document.getElementById("studentModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("studentModal").style.display = "none";
}