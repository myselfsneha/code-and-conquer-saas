checkAuth();

async function loadDashboard() {
  showLoader();

  try {
    const response = await fetch(`${API}/students?page=1&limit=500`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Dashboard load failed", "error");
      return;
    }

    const students = payload.data || [];

    const totalStudents = students.length;
    const totalFees = students.reduce((acc, s) => acc + Number(s.total_paid || 0), 0);
    const totalCourses = new Set(students.map((s) => s.course).filter(Boolean)).size;

    document.getElementById("totalStudents").innerText = totalStudents;
    document.getElementById("totalFees").innerText = `₹${totalFees}`;
    document.getElementById("pendingFees").innerText = "₹0";
    document.getElementById("totalCourses").innerText = totalCourses;

    const table = document.getElementById("recentStudents");
    table.innerHTML = "";

    students.slice(0, 5).forEach((student) => {
      table.innerHTML += `
        <tr>
          <td>${student.name}</td>
          <td>${student.course}</td>
        </tr>`;
    });

    const paidCount = students.filter((s) => Number(s.total_paid || 0) > 0).length;
    const unpaidCount = Math.max(totalStudents - paidCount, 0);

    new Chart(document.getElementById("pieChart"), {
      type: "pie",
      data: {
        labels: ["Paid", "Unpaid"],
        datasets: [{ data: [paidCount, unpaidCount] }],
      },
    });

    const courseMap = {};
    students.forEach((s) => {
      courseMap[s.course] = (courseMap[s.course] || 0) + 1;
    });

    new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: Object.keys(courseMap),
        datasets: [{ label: "Students", data: Object.values(courseMap) }],
      },
    });
  } catch (error) {
    console.error(error);
    showToast("Dashboard load failed", "error");
  } finally {
    hideLoader();
  }
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

loadDashboard();
