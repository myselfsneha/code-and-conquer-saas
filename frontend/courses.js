checkAuth();

let allCourses = [];
let courseRefreshTimer = null;

async function loadCourses() {
  showLoader();

  try {
    const response = await fetch(`${API}/courses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Error loading courses", "error");
      return;
    }

    allCourses = payload.data || [];
    renderCourses();
  } catch (error) {
    console.error(error);
    showToast("Error loading courses", "error");
  } finally {
    hideLoader();
  }
}

function renderCourses() {
  const table = document.getElementById("courseTable");
  const search = document.getElementById("searchCourse").value.toLowerCase();

  table.innerHTML = "";

  const filteredCourses = allCourses.filter((course) =>
    String(course.name || "").toLowerCase().includes(search)
  );

  if (filteredCourses.length === 0) {
    table.innerHTML = `<tr><td colspan="6">No courses found 😕</td></tr>`;
    return;
  }

  filteredCourses.forEach((course, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${course.name}</td>
        <td>${course.duration}</td>
        <td>₹${Number(course.fees || 0).toLocaleString("en-IN")}</td>
        <td>${course.student_count || 0}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteCourse(${course.course_id})">Delete</button>
        </td>
      </tr>`;
  });
}

async function addCourse() {
  const name = document.getElementById("courseName").value.trim();
  const duration = document.getElementById("courseDuration").value.trim();
  const fees = document.getElementById("courseFees").value.trim();

  if (!name || !duration || !fees) {
    showToast("Fill all fields", "error");
    return;
  }

  try {
    const response = await fetch(`${API}/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, duration, fees }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Error adding course", "error");
      return;
    }

    showToast("Course added ✅");
    closeModal();
    await loadCourses();
  } catch (error) {
    console.error(error);
    showToast("Error adding course", "error");
  }
}

async function deleteCourse(id) {
  try {
    const response = await fetch(`${API}/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      showToast(payload.message || "Error deleting course", "error");
      return;
    }

    showToast("Course deleted 🗑️");
    await loadCourses();
  } catch (error) {
    console.error(error);
    showToast("Error deleting course", "error");
  }
}

function startCourseRealtime() {
  if (courseRefreshTimer) clearInterval(courseRefreshTimer);
  courseRefreshTimer = setInterval(() => {
    if (document.visibilityState === "visible") {
      loadCourses();
    }
  }, 30000);
}

document.getElementById("searchCourse").addEventListener("input", renderCourses);

loadCourses();
startCourseRealtime();
