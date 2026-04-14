async function loginUser() {
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const btn = document.querySelector("button");

  if (!role || !email || !password) {
    showToast("Fill all fields ❌", "error");
    return;
  }

  try {
    showLoader();
    btn.innerText = "Logging in...";
    btn.disabled = true;

    const data = await apiRequest("/login", "POST", {
      role,
      email,
      password,
    });

    saveLogin(data.token);

    showToast("Login successful ✅");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (err) {
    showToast(err.message, "error");
    btn.innerText = "Login";
    btn.disabled = false;
  }

  hideLoader();
}