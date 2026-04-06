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

    let courseDropdown = document.getElementById("course");
    let filterDropdown = document.getElementById("filterCourse");

    courseDropdown.innerHTML = "";
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

function addStudent(){
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let course = document.getElementById("course").value;
    let year = document.getElementById("year").value;
    let fees = document.getElementById("fees").value;
    let attendance = document.getElementById("attendance").value;

    if(!name || !email || !course || !year){
        showToast("Fill required fields ❌", "error");
        return;
    }

    students.push({ name, email, course, year, fees, attendance });

    saveStudents();

    showToast("Student Added ✅");

    closeModal();
    renderStudents();
}

function deleteStudent(index){
    students.splice(index,1);
    saveStudents();
    showToast("Deleted ❌", "error");
    renderStudents();
}

loadCourses();
renderStudents();