async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const tenant = document.getElementById("tenant").value.trim();
  const role = document.getElementById("role").value;
  const btn = document.querySelector("button");

  if (!email || !password) {
    showToast("Enter email and password", "error");
    return;
  }

  try {
    btn.innerText = "Logging in...";
    btn.disabled = true;

    const response = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role,
        tenant_id: tenant ? Number(tenant) : undefined,
      }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Login failed", "error");
      btn.innerText = "Login";
      btn.disabled = false;
      return;
    }

    saveLogin(payload.token, payload.user);
    showToast("Login successful ✅");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (error) {
    console.error(error);
    showToast("Unable to connect to server", "error");
    btn.innerText = "Login";
    btn.disabled = false;
  }
}

document.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    loginUser();
  }
});
