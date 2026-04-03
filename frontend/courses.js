checkAuth();

async function loadCourses() {
    showLoader();

    try {
        const res = await fetch(`${API}/courses`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        const data = await res.json();
        renderCourses(data);
    } catch (err) {
        console.error(err);
        showToast("Error loading courses ❌", "error");
    }

    hideLoader();
}

function renderCourses(courses) {
    let table = document.getElementById("courseTable");
    let search = document.getElementById("searchCourse").value.toLowerCase();

    table.innerHTML = "";

    let filtered = courses.filter(c =>
        c.name.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6">No courses found 😕</td></tr>`;
        return;
    }

    filtered.forEach((c, index) => {
        table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${c.name}</td>
            <td>${c.duration}</td>
            <td>₹${c.fees}</td>
            <td>0</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.course_id})">Delete</button>
            </td>
        </tr>`;
    });
}

async function addCourse() {
    let name = document.getElementById("courseName").value;
    let duration = document.getElementById("courseDuration").value;
    let fees = document.getElementById("courseFees").value;

    if (!name || !duration || !fees) {
        showToast("Fill all fields ❌", "error");
        return;
    }

    try {
        await fetch(`${API}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ name, duration, fees })
        });

        showToast("Course added ✅");
        closeModal();
        loadCourses();
    } catch (err) {
        console.error(err);
        showToast("Error adding course ❌", "error");
    }
}

async function deleteCourse(id) {
    try {
        await fetch(`${API}/courses/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });

        showToast("Course deleted 🗑️");
        loadCourses();
    } catch (err) {
        console.error(err);
        showToast("Error deleting course ❌", "error");
    }
}

document.getElementById("searchCourse").addEventListener("input", loadCourses);

loadCourses();