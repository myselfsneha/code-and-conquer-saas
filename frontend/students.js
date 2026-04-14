checkAuth();

let students = [];
let page = 1;
const limit = 10;

async function loadCourses() {
  try {
    const data = await apiRequest("/courses");

    const courseDropdown = document.getElementById("course");
    const filterDropdown = document.getElementById("filterCourse");

    courseDropdown.innerHTML = `<option value="">Select Course</option>`;
    filterDropdown.innerHTML = `<option value="">All Courses</option>`;

    data.forEach((course) => {
      courseDropdown.innerHTML += `<option value="${course.name}">${course.name}</option>`;
      filterDropdown.innerHTML += `<option value="${course.name}">${course.name}</option>`;
    });

  } catch (err) {
    showToast(err.message, "error");
  }
}

async function fetchStudents() {
  showLoader();

  try {
    const search = document.getElementById("search").value;
    const course = document.getElementById("filterCourse").value;
    const year = document.getElementById("filterYear").value;

    const params = new URLSearchParams({ page, limit });

    if (search) params.append("search", search);
    if (course) params.append("course", course);
    if (year) params.append("year", year);

    const data = await apiRequest(`/students?${params}`);

    students = data.students || [];

    renderStudents();

  } catch (err) {
    showToast(err.message, "error");
  }

  hideLoader();
}

function renderStudents() {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  if (students.length === 0) {
    table.innerHTML = `<tr><td colspan="8">No students 😕</td></tr>`;
    return;
  }

  students.forEach((s, i) => {
    table.innerHTML += `
    <tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.course}</td>
      <td>${s.year}</td>
      <td>₹${s.total_paid}</td>
      <td>${s.attendance_percentage}%</td>
      <td>-</td>
    </tr>`;
  });
}

async function addStudent() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const course = document.getElementById("course").value;
  const year = document.getElementById("year").value;

  if (!name || !email || !course || !year) {
    showToast("Fill all fields", "error");
    return;
  }

  try {
    await apiRequest("/students", "POST", {
      name,
      email,
      course,
      year,
    });

    showToast("Student added ✅");
    closeModal();
    fetchStudents();

  } catch (err) {
    showToast(err.message, "error");
  }
}

document.getElementById("search").addEventListener("input", fetchStudents);

loadCourses();
fetchStudents();