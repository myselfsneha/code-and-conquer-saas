async function registerUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const tenantId = document.getElementById("tenant").value;

  if (!name || !email || !password || !tenantId) {
    showToast("Fill all fields ❌", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/register-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        tenant_id: Number(tenantId),
        role: "admin",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || "Registration failed ❌", "error");
      return;
    }

    showToast("Account created! ✅");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  } catch (err) {
    console.error(err);
    showToast("Server error ❌", "error");
  }
}
