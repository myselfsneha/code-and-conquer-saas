checkAuth();

let students = [];
let page = 1;
const limit = 10;

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
  try {
    const response = await fetch(`${API}/courses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Failed to load courses", "error");
      return;
    }

    const courseDropdown = document.getElementById("course");
    const filterDropdown = document.getElementById("filterCourse");

    courseDropdown.innerHTML = `<option value="">Select Course</option>`;
    filterDropdown.innerHTML = `<option value="">All Courses</option>`;

    payload.data.forEach((course) => {
      courseDropdown.innerHTML += `<option value="${course.name}">${course.name}</option>`;
      filterDropdown.innerHTML += `<option value="${course.name}">${course.name}</option>`;
    });
  } catch (error) {
    console.error(error);
    showToast("Failed to load courses", "error");
  }
}

async function fetchStudents() {
  showLoader();

  try {
    const search = document.getElementById("search").value.trim();
    const course = document.getElementById("filterCourse").value;
    const year = document.getElementById("filterYear").value;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search) params.append("search", search);
    if (course) params.append("course", course);
    if (year) params.append("year", year);

    const response = await fetch(`${API}/students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Failed to load students", "error");
      return;
    }

    students = payload.data || [];
    renderStudents();
  } catch (error) {
    console.error(error);
    showToast("Failed to load students", "error");
  } finally {
    hideLoader();
  }
}

function renderStudents() {
  const table = document.getElementById("tableBody");
  table.innerHTML = "";

  if (students.length === 0) {
    table.innerHTML = `<tr><td colspan="8">No students found 😕</td></tr>`;
    return;
  }

  students.forEach((student, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td>${student.year}</td>
        <td>₹${student.total_paid || 0}</td>
        <td>${student.attendance_percentage || 0}%</td>
        <td>-</td>
      </tr>`;
  });
}

// ===== ADD STUDENT =====
async function addStudent() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value;
  const year = document.getElementById("year").value;
  const fees = document.getElementById("fees").value;

  if (!name || !email || !course || !year) {
    showToast("All fields required", "error");
    return;
  }

  try {
    const studentResponse = await fetch(`${API}/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, course, year }),
    });

    const studentPayload = await studentResponse.json();

    if (!studentResponse.ok || !studentPayload.success) {
      showToast(studentPayload.message || "Unable to add student", "error");
      return;
    }

    const studentId = studentPayload.data?.student_id;

    if (studentId && fees && Number(fees) > 0) {
      await fetch(`${API}/fees`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ student_id: studentId, amount_paid: Number(fees) }),
      });
    }

    showToast("Student added ✅");
    closeModal();
    await fetchStudents();
  } catch (error) {
    console.error(error);
    showToast("Unable to add student", "error");
  }
}

window.renderStudents = fetchStudents;

// ===== EVENTS =====
document.getElementById("search").addEventListener("input", renderStudents);

// ===== INIT =====
loadTenants();   // 🔥 IMPORTANT
loadCourses();
fetchStudents();
