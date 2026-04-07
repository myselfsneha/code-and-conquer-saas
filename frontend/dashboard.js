checkAuth();

let pieChartInstance = null;
let barChartInstance = null;
let dashboardRefreshTimer = null;

function setLastUpdated() {
  let syncTag = document.getElementById("lastSync");
  if (!syncTag) return;
  syncTag.innerText = `Last synced: ${new Date().toLocaleTimeString()}`;
}

function drawCharts(students) {
  const paidCount = students.filter((s) => Number(s.total_paid || 0) > 0).length;
  const unpaidCount = Math.max(students.length - paidCount, 0);

  if (pieChartInstance) pieChartInstance.destroy();
  pieChartInstance = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["Paid", "Unpaid"],
      datasets: [{ data: [paidCount, unpaidCount] }],
    },
  });

  const courseMap = {};
  students.forEach((student) => {
    courseMap[student.course] = (courseMap[student.course] || 0) + 1;
  });

  if (barChartInstance) barChartInstance.destroy();
  barChartInstance = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: Object.keys(courseMap),
      datasets: [{ label: "Students", data: Object.values(courseMap) }],
    },
  });
}

async function loadDashboard() {
  showLoader();

  try {
    const [studentsRes, coursesRes] = await Promise.all([
      fetch(`${API}/students?page=1&limit=500`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      }),
      fetch(`${API}/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      }),
    ]);

    const studentsPayload = await studentsRes.json();
    const coursesPayload = await coursesRes.json();

    if (!studentsRes.ok || !studentsPayload.success) {
      showToast(studentsPayload.message || "Dashboard load failed", "error");
      return;
    }

    const students = studentsPayload.data || [];
    const courses = coursesRes.ok && coursesPayload.success ? coursesPayload.data || [] : [];

    const courseFeeMap = {};
    courses.forEach((course) => {
      courseFeeMap[course.name] = Number(course.fees || 0);
    });

    const totalStudents = students.length;
    const totalFees = students.reduce((acc, student) => acc + Number(student.total_paid || 0), 0);
    const pendingFees = students.reduce((acc, student) => {
      const expected = courseFeeMap[student.course] || 0;
      const paid = Number(student.total_paid || 0);
      return acc + Math.max(expected - paid, 0);
    }, 0);

    document.getElementById("totalStudents").innerText = totalStudents;
    document.getElementById("totalFees").innerText = `₹${totalFees.toLocaleString("en-IN")}`;
    document.getElementById("pendingFees").innerText = `₹${pendingFees.toLocaleString("en-IN")}`;
    document.getElementById("totalCourses").innerText = courses.length;

    const table = document.getElementById("recentStudents");
    table.innerHTML = "";

    students.slice(0, 5).forEach((student) => {
      table.innerHTML += `
        <tr>
          <td>${student.name}</td>
          <td>${student.course}</td>
        </tr>`;
    });

    drawCharts(students);
    setLastUpdated();
  } catch (error) {
    console.error(error);
    showToast("Dashboard load failed", "error");
  } finally {
    hideLoader();
  }
}

function startDashboardRealtime() {
  if (dashboardRefreshTimer) clearInterval(dashboardRefreshTimer);
  dashboardRefreshTimer = setInterval(() => {
    if (document.visibilityState === "visible") {
      loadDashboard();
    }
  }, 30000);
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

loadDashboard();
startDashboardRealtime();
