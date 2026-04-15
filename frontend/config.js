// LOCAL MODE (NO BACKEND)

// Fake DB using localStorage
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// INIT DEFAULT DATA (FIRST TIME)
if (!localStorage.getItem("initialized")) {

  setData("users", [
    { email: "admin@test.com", password: "123", role: "admin" },
    { email: "college@test.com", password: "123", role: "college" },
    { email: "student@test.com", password: "123", role: "student" }
  ]);

  setData("students", [
    { id: 1, name: "Rahul", email: "rahul@gmail.com", course: "BCA", year: 1, fees: 20000, attendance: 80 },
    { id: 2, name: "Priya", email: "priya@gmail.com", course: "MBA", year: 2, fees: 50000, attendance: 75 }
  ]);

  setData("courses", [
    { id: 1, name: "BCA", duration: "3 Years", fees: 60000 },
    { id: 2, name: "MBA", duration: "2 Years", fees: 120000 }
  ]);

  setData("tenants", [
    { id: 1, name: "ABC College", status: "Active" }
  ]);

  localStorage.setItem("initialized", "true");
}