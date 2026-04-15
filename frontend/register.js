function registerUser() {

  const role = document.getElementById("role").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!role || !name || !email || !password) {
    showToast("Fill all fields ❌");
    return;
  }

  let users = getData("users");

  users.push({ name, email, password, role });

  setData("users", users);

  showToast("Registered successfully ✅");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}