checkAuth();

let tenants = JSON.parse(localStorage.getItem("tenants")) || [];

// ===== SAVE =====
function saveTenants(){
    localStorage.setItem("tenants", JSON.stringify(tenants));
}

// ===== RENDER =====
function renderTenants(){
    const table = document.getElementById("tenantTable");
    const search = document.getElementById("searchTenant").value.toLowerCase();

    table.innerHTML = "";

    const filtered = tenants.filter(t => 
        t.name.toLowerCase().includes(search)
    );

    if(filtered.length === 0){
        table.innerHTML = `<tr><td colspan="7">No tenants found 😕</td></tr>`;
        return;
    }

    filtered.forEach((t, index) => {

        table.innerHTML += `
        <tr>
            <td>${index+1}</td>
            <td>${t.name}</td>
            <td>${t.email}</td>
            <td>-</td>
            <td>-</td>
            <td>
                <span class="badge bg-${t.status === "Active" ? "success" : "secondary"}">
                    ${t.status}
                </span>
            </td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="toggleStatus(${index})">Toggle</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTenant(${index})">Delete</button>
            </td>
        </tr>`;
    });
}

// ===== ADD =====
function addTenant(){
    const name = document.getElementById("tenantName").value.trim();
    const email = document.getElementById("tenantEmail").value.trim();
    const status = document.getElementById("tenantStatus").value;

    if(!name || !email){
        showToast("Fill all fields ❌", "error");
        return;
    }

    tenants.push({
        tenant_id: Date.now(),
        name,
        email,
        status
    });

    saveTenants();

    showToast("Tenant added ✅");

    closeModal();
    renderTenants();
}

// ===== DELETE =====
function deleteTenant(index){
    tenants.splice(index,1);
    saveTenants();
    showToast("Deleted 🗑️");
    renderTenants();
}

// ===== TOGGLE STATUS =====
function toggleStatus(index){
    tenants[index].status = tenants[index].status === "Active" ? "Inactive" : "Active";
    saveTenants();
    showToast("Status updated 🔄");
    renderTenants();
}

// ===== SEARCH =====
document.getElementById("searchTenant").addEventListener("input", renderTenants);

// ===== INIT =====
renderTenants();