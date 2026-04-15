let courses = getData("courses");

function renderCourses() {

  let table = document.getElementById("courseTable");
  table.innerHTML = "";

  courses.forEach((c, i) => {
    table.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${c.name}</td>
        <td>${c.duration}</td>
        <td>₹${c.fees}</td>
        <td>-</td>
        <td>
          <button onclick="deleteCourse(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function addCourse() {

  let name = document.getElementById("courseName").value;
  let duration = document.getElementById("courseDuration").value;
  let fees = document.getElementById("courseFees").value;

  courses.push({ id: Date.now(), name, duration, fees });

  setData("courses", courses);

  showToast("Course added ✅");

  renderCourses();
}

function deleteCourse(i) {
  courses.splice(i,1);
  setData("courses", courses);
  renderCourses();
}

renderCourses();