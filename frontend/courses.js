const API = "https://code-and-conquer-saas.onrender.com";

// TEMP BYPASS (remove later)
if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "test123");
}

// =====================
// LOAD
// =====================
document.addEventListener("DOMContentLoaded", () => {
    fetchCourses();
});

// =====================
// FETCH COURSES
// =====================
async function fetchCourses() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API + "/courses", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        const courses = data.courses || data;

        renderCourses(courses);

    } catch (err) {
        console.error(err);
        alert("Error loading courses");
    }
}

// =====================
// RENDER TABLE
// =====================
function renderCourses(courses) {

    const table = document.getElementById("courseTable");

    if (!courses.length) {
        table.innerHTML = `<tr><td colspan="4">No courses found</td></tr>`;
        return;
    }

    let rows = "";

    courses.forEach(c => {
        rows += `
        <tr>
            <td>${c.course_id || "-"}</td>
            <td>${c.course_name}</td>
            <td>${c.duration}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.course_id})">Delete</button>
            </td>
        </tr>
        `;
    });

    table.innerHTML = rows;
}

// =====================
// ADD COURSE
// =====================
async function addCourse() {

    const name = document.getElementById("courseName").value;
    const duration = document.getElementById("courseDuration").value;

    const token = localStorage.getItem("token");

    if (!name || !duration) {
        alert("Fill all fields");
        return;
    }

    try {
        await fetch(API + "/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                course_name: name,
                duration: duration
            })
        });

        alert("Course added");
        closeModal();
        fetchCourses();

    } catch (err) {
        console.error(err);
        alert("Error adding course");
    }
}

// =====================
// DELETE
// =====================
async function deleteCourse(id) {

    const token = localStorage.getItem("token");

    if (!confirm("Delete course?")) return;

    try {
        await fetch(`${API}/courses/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        alert("Deleted");
        fetchCourses();

    } catch (err) {
        console.error(err);
        alert("Error deleting");
    }
}

// =====================
// MODAL
// =====================
function openModal(){
    document.getElementById("courseModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("courseModal").style.display = "none";
}