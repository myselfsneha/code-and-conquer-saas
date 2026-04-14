checkAuth();

let students = JSON.parse(localStorage.getItem("students")) || [];

// ===== SAVE =====
function saveStudents(){
    localStorage.setItem("students", JSON.stringify(students));
}

// ===== LOAD TENANTS (DROPDOWN) =====
function loadTenants(){
    let tenants = JSON.parse(localStorage.getItem("tenants")) || [];
    let dropdown = document.getElementById("tenantSelect");

    dropdown.innerHTML = "<option value=''>Select Tenant</option>";

    tenants.forEach(t => {
        dropdown.innerHTML += `<option value="${t.tenant_id}">${t.name}</option>`;
    });
}

// ===== LOAD COURSES =====
async function loadCourses() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/courses", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const courses = await res.json();

    let courseDropdown = document.getElementById("course");
    let filterDropdown = document.getElementById("filterCourse");

    courseDropdown.innerHTML = `<option value="">Select Course</option>`;
    filterDropdown.innerHTML = `<option value="">All Courses</option>`;

    courses.forEach(c => {
        courseDropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        filterDropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
}

// ===== RENDER =====
function renderStudents(){
    showLoader();

    let table = document.getElementById("tableBody");

    let search = document.getElementById("search").value.toLowerCase();
    let courseFilter = document.getElementById("filterCourse").value;
    let yearFilter = document.getElementById("filterYear").value;

    table.innerHTML = "";

    let filtered = students.filter(s => 
        s.name.toLowerCase().includes(search) &&
        (courseFilter === "" || s.course === courseFilter) &&
        (yearFilter === "" || s.year === yearFilter)
    );

    if(filtered.length === 0){
        table.innerHTML = `<tr><td colspan="8">No students found 😕</td></tr>`;
        hideLoader();
        return;
    }

    filtered.forEach((s, index) => {

        // get tenant name
        let tenants = JSON.parse(localStorage.getItem("tenants")) || [];
        let tenant = tenants.find(t => t.tenant_id == s.tenant_id);

        table.innerHTML += `
        <tr>
            <td>${index+1}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.course}</td>
            <td>${s.year}</td>
            <td>₹${s.fees || 0}</td>
            <td>${s.attendance || 0}%</td>
            <td>${tenant ? tenant.name : "N/A"}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${index})">Delete</button>
            </td>
        </tr>`;
    });

    hideLoader();
}

// ===== ADD STUDENT =====
async function addStudent() {
    const token = localStorage.getItem("token");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;
    const tenant_id = document.getElementById("tenantSelect").value;

    if (!name || !email || !course || !year || !tenant_id) {
        alert("All fields required");
        return;
    }

    // ===== LOCAL STORAGE SAVE =====
    students.push({
        student_id: Date.now(),
        name,
        email,
        course,
        year,
        tenant_id
    });

    saveStudents();

    // ===== BACKEND API =====
    try {
        const res = await fetch("http://localhost:3000/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                name,
                email,
                course,
                year,
                tenant_id
            })
        });

        const data = await res.json();
        console.log(data.message);
    } catch (err) {
        console.log("Backend error (optional)", err);
    }

    closeModal();
    renderStudents();
}

// ===== DELETE =====
function deleteStudent(index){
    students.splice(index,1);
    saveStudents();
    showToast("Deleted ❌", "error");
    renderStudents();
}

// ===== EVENTS =====
document.getElementById("search").addEventListener("input", renderStudents);

// ===== INIT =====
loadTenants();   // 🔥 IMPORTANT
loadCourses();
renderStudents();