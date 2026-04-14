checkAuth();

let allCourses = [];

async function loadCourses() {
  showLoader();

  try {
    const data = await apiRequest("/courses");
    allCourses = data;

    renderCourses();

  } catch (err) {
    showToast(err.message, "error");
  }

  hideLoader();
}

function renderCourses() {
  const table = document.getElementById("courseTable");
  const search = document.getElementById("searchCourse").value.toLowerCase();

  table.innerHTML = "";

  const filtered = allCourses.filter(c =>
    c.name.toLowerCase().includes(search)
  );

  if (!filtered.length) {
    table.innerHTML = `<tr><td colspan="6">No courses 😕</td></tr>`;
    return;
  }

  filtered.forEach((c, i) => {
    table.innerHTML += `
    <tr>
      <td>${i+1}</td>
      <td>${c.name}</td>
      <td>${c.duration}</td>
      <td>₹${c.fees}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.course_id})">Delete</button>
      </td>
    </tr>`;
  });
}

async function addCourse() {
  const name = document.getElementById("courseName").value;
  const duration = document.getElementById("courseDuration").value;
  const fees = document.getElementById("courseFees").value;

  try {
    await apiRequest("/courses", "POST", { name, duration, fees });

    showToast("Course added ✅");
    closeModal();
    loadCourses();

  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCourse(id) {
  try {
    await apiRequest(`/courses/${id}`, "DELETE");

    showToast("Deleted 🗑️");
    loadCourses();

  } catch (err) {
    showToast(err.message, "error");
  }
}

document.getElementById("searchCourse").addEventListener("input", renderCourses);

loadCourses();