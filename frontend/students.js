let students = getData("students");

function renderStudents() {

  let table = document.getElementById("tableBody");
  let search = document.getElementById("search").value.toLowerCase();

  table.innerHTML = "";

  let filtered = students.filter(s =>
    s.name.toLowerCase().includes(search)
  );

  filtered.forEach((s, i) => {
    table.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.course}</td>
        <td>${s.year}</td>
        <td>₹${s.fees}</td>
        <td>${s.attendance}%</td>
        <td>-</td>
      </tr>
    `;
  });
}

function addStudent() {

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let course = document.getElementById("course").value;
  let year = document.getElementById("year").value;

  students.push({
    id: Date.now(),
    name, email, course, year,
    fees: 0,
    attendance: 0
  });

  setData("students", students);

  showToast("Student added ✅");

  renderStudents();
}

renderStudents();