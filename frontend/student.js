// 🚀 Load students automatically
window.onload = fetchStudents;

/* =======================
   FETCH STUDENTS (SEARCH + FILTER)
======================= */
async function fetchStudents() {

    console.log("🔥 FETCH CALLED");

    const token = localStorage.getItem("token");

    if (!token) {
        alert("No token found. Please login again.");
        window.location.href = "login.html";
        return;
    }

    const search = document.getElementById("search").value.trim();
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;

    // ✅ Build URL properly
    let url = "http://localhost:3000/students?";

    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (course) url += `course=${encodeURIComponent(course)}&`;
    if (year) url += `year=${encodeURIComponent(year)}&`;

    console.log("🌐 URL:", url);

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        console.log("📦 RESPONSE:", data);

        let rows = "";

        if (!Array.isArray(data) || data.length === 0) {
            rows = `<tr><td colspan="6">No students found</td></tr>`;
        } else {
            data.forEach(student => {
                rows += `
                    <tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.course || "-"}</td>
                        <td>${student.year || "-"}</td>
                        <td>
                            <button onclick="deleteStudent(${student.student_id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        document.getElementById("tableBody").innerHTML = rows;

    } catch (error) {
        console.error("❌ FETCH ERROR:", error);
        alert("Something went wrong while fetching students");
    }
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

    fetchStudents();
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