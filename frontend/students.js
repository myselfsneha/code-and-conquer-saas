checkAuth();

let students = JSON.parse(localStorage.getItem("students")) || [];

function saveStudents(){
    localStorage.setItem("students", JSON.stringify(students));
}

async function loadCourses() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/courses", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const courses = await res.json();

    let courseDropdown = document.getElementById("course");          // ➕ add student
    let filterDropdown = document.getElementById("filterCourse");    // 🔍 filter

    // reset dropdowns
    courseDropdown.innerHTML = `<option value="">Select Course</option>`;
    filterDropdown.innerHTML = `<option value="">All Courses</option>`;

    courses.forEach(c => {
        courseDropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        filterDropdown.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
}
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
        table.innerHTML += `
        <tr>
            <td>${index+1}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.course}</td>
            <td>${s.year}</td>
            <td>₹${s.fees}</td>
            <td>${s.attendance}%</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${index})">Delete</button>
            </td>
        </tr>`;
    });

    hideLoader();
}

async function addStudent() {
    const token = localStorage.getItem("token");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const course = document.getElementById("course").value;   // 👈 HERE
    const year = document.getElementById("year").value;

    if (!name || !email || !course || !year) {
        alert("All fields required");
        return;
    }

    const res = await fetch("http://localhost:3000/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            name,
            email,
            course,   // 👈 sent to backend
            year
        })
    });

    const data = await res.json();

    alert(data.message);

    closeModal();        // close popup
    renderStudents();    // refresh table
}

function deleteStudent(index){
    students.splice(index,1);
    saveStudents();
    showToast("Deleted ❌", "error");
    renderStudents();
}

loadCourses();
renderStudents();