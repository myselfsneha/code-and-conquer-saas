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

if(students.length === 0){
    table.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                No students added yet
            </td>
        </tr>
    `;
    return;
}

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
    showToast();

    document.getElementById("studentName").value = "";
    document.getElementById("studentEmail").value = "";
}

/* =======================
   DELETE STUDENT
======================= */
function deleteStudent(index) {

    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if(confirmDelete){
        students.splice(index, 1);

        localStorage.setItem("students", JSON.stringify(students));

        renderStudents();
        updateStudentCount();
    }

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
function exportStudents(){

    let csv = "ID,Name,Email\n";

    students.forEach(student=>{
        csv += `${student.id},${student.name},${student.email}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "students.csv";

    a.click();

}
function showToast(){
    const toast = document.getElementById("toast");

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);
}