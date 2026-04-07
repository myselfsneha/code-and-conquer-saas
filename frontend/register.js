async function registerUser(){

    const role = document.getElementById("role").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const tenant_id = document.getElementById("tenant").value;

    const btn = document.querySelector("button");

    if(!role){
        showToast("Select role ❌");
        return;
    }

    if(!name || !email || !password){
        showToast("Fill all fields ❌");
        return;
    }

    try{
        showLoader();

        btn.innerText = "Registering...";
        btn.disabled = true;

        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role, name, email, password })
        });

        const data = await res.json();
        console.log("REGISTER RESPONSE:", data);

        if(!res.ok){
            showToast(data.message || "Registration failed ❌");
            btn.innerText = "Register";
            btn.disabled = false;
            hideLoader();
            return;
        }

        showToast("Registration successful ✅");

        setTimeout(()=>{
            window.location.href = "login.html";
        }, 1200);

    }catch(err){
        console.error(err);
        showToast("Server error ❌");
        btn.innerText = "Register";
        btn.disabled = false;
    }

    hideLoader();
}

/* ENTER KEY SUPPORT */
document.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        registerUser();
    }
});
