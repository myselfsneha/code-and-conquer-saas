document.addEventListener("DOMContentLoaded", function () {
    const savedCourses = localStorage.getItem("courses");

    window.courses = savedCourses
        ? JSON.parse(savedCourses)
        : [
            { id: 1, name: "Web Development", duration: "6 Months" },
            { id: 2, name: "Data Science", duration: "8 Months" }
        ];

    renderCourses();
    updateCourseCount();
});

function renderCourses() {
    const table = document.getElementById("courseTable");
    table.innerHTML = "";

    courses.forEach((course, index) => {
        table.innerHTML += `
            <tr>
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${course.duration}</td>
                <td>
                    <button onclick="deleteCourse(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function addCourse() {
    const name = prompt("Enter Course Name:");
    const duration = prompt("Enter Course Duration:");

    if (!name || !duration) {
        alert("All fields required");
        return;
    }

    courses.push({
        id: courses.length + 1,
        name,
        duration
    });
    localStorage.setItem("courses", JSON.stringify(courses));
    updateCourseCount();
    renderCourses();
}

function updateCourseCount() {
    localStorage.setItem("coursesCount", courses.length);
}

function deleteCourse(index) {
    courses.splice(index, 1);
    localStorage.setItem("courses", JSON.stringify(courses));
    updateCourseCount();
    renderCourses();
}

function goBack() {
    window.location.href = "dashboard.html";
}
function updateCourseCount() {
    localStorage.setItem("coursesCount", courses.length);
}