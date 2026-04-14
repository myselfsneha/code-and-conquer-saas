checkAuth();

let tenants = JSON.parse(localStorage.getItem("tenants")) || [];

function saveTenants(){
    localStorage.setItem("tenants", JSON.stringify(tenants));
}

// ===== RENDER =====
function renderTenants(){
    let table = document.getElementById("tenantTable");
    let search = document.getElementById("searchTenant").value.toLowerCase();

    let students = JSON.parse(localStorage.getItem("students")) || [];
    let courses = JSON.parse(localStorage.getItem("courses")) || [];

    table.innerHTML = "";

    let filtered = tenants.filter(t => 
        t.name.toLowerCase().includes(search)
    );

    if(filtered.length === 0){
        table.innerHTML = `<tr><td colspan="7">No tenants found 😕</td></tr>`;
        return;
    }

    filtered.forEach((t, index) => {

        let studentCount = students.filter(s => s.tenant_id === t.tenant_id).length;
        let courseCount = courses.filter(c => c.tenant_id === t.tenant_id).length;

        table.innerHTML += `
        <tr>
            <td>${index+1}</td>
            <td>${t.name}</td>
            <td>${t.email}</td>
            <td>${studentCount}</td>
            <td>${courseCount}</td>
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
    let name = document.getElementById("tenantName").value;
    let email = document.getElementById("tenantEmail").value;
    let status = document.getElementById("tenantStatus").value;

    if(!name || !email){
        alert("Fill all fields");
        return;
    }

    tenants.push({
    tenant_id: Date.now(), // unique id
    name,
    email,
    status
});

    saveTenants();
    closeModal();
    renderTenants();
}

// ===== DELETE =====
function deleteTenant(index){
    tenants.splice(index,1);
    saveTenants();
    renderTenants();
}

// ===== TOGGLE STATUS =====
function toggleStatus(index){
    tenants[index].status = tenants[index].status === "Active" ? "Inactive" : "Active";
    saveTenants();
    renderTenants();
}

// ===== SEARCH =====
document.getElementById("searchTenant").addEventListener("input", renderTenants);

// ===== INIT =====
renderTenants();