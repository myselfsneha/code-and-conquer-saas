let students = getData("students");
let courses = getData("courses");

document.getElementById("totalStudents").innerText = students.length;
document.getElementById("totalCourses").innerText = courses.length;

let totalFees = students.reduce((sum, s) => sum + (s.fees || 0), 0);
document.getElementById("totalFees").innerText = "₹" + totalFees;

// PIE CHART
new Chart(document.getElementById("pieChart"), {
  type: "pie",
  data: {
    labels: ["Students", "Courses"],
    datasets: [{
      data: [students.length, courses.length]
    }]
  }
});

// BAR CHART
new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels: students.map(s => s.name),
    datasets: [{
      label: "Fees",
      data: students.map(s => s.fees || 0)
    }]
  }
});

// TABLE
let table = document.getElementById("recentStudents");
students.slice(0,5).forEach(s => {
  table.innerHTML += `<tr><td>${s.name}</td><td>${s.course}</td></tr>`;
});