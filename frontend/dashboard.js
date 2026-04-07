checkAuth();

async function loadDashboard(){
    showLoader();

    try{

        let data = [
            {name:"Tirthi", course:"BCA", feesPaid:40000},
            {name:"Sneha", course:"MCA", feesPaid:50000},
            {name:"Oshi", course:"BBA", feesPaid:20000},
            {name:"Shivani", course:"MCA", feesPaid:30000},
            {name:"Khushi", course:"BCA", feesPaid:45000}
        ];

    const payload = await response.json();

        let courseCount = { BCA:0, BBA:0, MCA:0 };

        data.forEach(s => {
            totalFees += s.feesPaid;

            if(s.feesPaid < 50000){
                pendingFees += (50000 - s.feesPaid);
            }

            courseCount[s.course]++;
        });

        // 🔥 ANIMATED COUNTERS
        animateValue("totalStudents", 0, totalStudents, 800);
        animateValue("totalFees", 0, totalFees, 800, "₹");
        animateValue("pendingFees", 0, pendingFees, 800, "₹");
        animateValue("totalCourses", 0, 3, 800);

        // TABLE
        let table = document.getElementById("recentStudents");
        table.innerHTML = "";

        data.forEach(s => {
            table.innerHTML += `
            <tr>
                <td>${s.name}</td>
                <td>${s.course}</td>
            </tr>`;
        });

        // PIE
        new Chart(document.getElementById("pieChart"), {
            type: "pie",
            data: {
                labels: ["Paid", "Pending"],
                datasets: [{
                    data: [totalFees, pendingFees]
                }]
            }
        });

        // BAR
        new Chart(document.getElementById("barChart"), {
            type: "bar",
            data: {
                labels: Object.keys(courseCount),
                datasets: [{
                    label: "Students",
                    data: Object.values(courseCount)
                }]
            }
        });

    }catch{
        showToast("Dashboard load failed ❌");
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
  } //catch (error) {
    console.error(error);
    showToast("Dashboard load failed", "error");
  //} finally {
  //  hideLoader();
  //}


function toggleDark() {
  document.body.classList.toggle("dark");
}

// ===== START =====
loadDashboard();

function animateValue(id, start, end, duration, prefix=""){
    let obj = document.getElementById(id);
    let range = end - start;
    let startTime = null;

    function step(timestamp){
        if(!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        obj.innerText = prefix + Math.floor(progress * range + start);
        if(progress < 1){
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}
