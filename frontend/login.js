function loginUser() {

  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let users = getData("users");

  const user = users.find(u =>
    u.email === email &&
    u.password === password &&
    u.role === role
  );

  if (!user) {
    showToast("Invalid credentials ❌");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));

  showToast("Login successful ✅");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);
}