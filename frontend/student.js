document.addEventListener("DOMContentLoaded", function () {
    const savedStudents = localStorage.getItem("students");

    window.students = savedStudents
        ? JSON.parse(savedStudents)
        : [
            { id: 1, name: "Amit Sharma", email: "amit@gmail.com" },
            { id: 2, name: "Neha Verma", email: "neha@gmail.com" }
        ];

    renderStudents();
    updateStudentCount();
});

/* =======================
   RENDER STUDENTS TABLE
======================= */
function renderStudents() {
    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    students.forEach((student, index) => {
        table.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>
                    <button onclick="deleteStudent(${index})" class="icon-btn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

/* =======================
   ADD STUDENT (MODAL)
======================= */
function addStudent() {
    document.getElementById("studentModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("studentModal").style.display = "none";
}

function saveStudent() {
    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();

    if (!name || !email) {
        alert("Please fill all fields");
        return;
    }

    students.push({
        id: students.length + 1,
        name: name,
        email: email
    });

    // ✅ SAVE TO LOCAL STORAGE
    localStorage.setItem("students", JSON.stringify(students));
    updateStudentCount();

    closeModal();
    renderStudents();

    document.getElementById("studentName").value = "";
    document.getElementById("studentEmail").value = "";
}

/* =======================
   DELETE STUDENT
======================= */
function deleteStudent(index) {
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    renderStudents();
    updateStudentCount();
}

/* =======================
   SEARCH STUDENT
======================= */
function searchStudent() {
    const input = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#studentTable tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}

/* =======================
   DASHBOARD COUNT SYNC
======================= */
function updateStudentCount() {
    localStorage.setItem("studentsCount", students.length);
}

/* =======================
   BACK TO DASHBOARD
======================= */
function goBack() {
    window.location.href = "dashboard.html";
}