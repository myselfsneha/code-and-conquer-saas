async function registerUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    showToast("Fill all fields ❌", "error");
    return;
  }

  try {
    showLoader();

    await apiRequest("/register-admin", "POST", {
      name,
      email,
      password,
      tenant_id: Date.now() // temp id
    });

    showToast("Registered ✅");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

  } catch (err) {
    showToast(err.message, "error");
  }

  hideLoader();
}