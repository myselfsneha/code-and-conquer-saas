document.addEventListener("DOMContentLoaded", function () {
    const savedTenants = localStorage.getItem("tenants");

    window.tenants = savedTenants
        ? JSON.parse(savedTenants)
        : [
            { id: 1, name: "ABC Institute", email: "abc@gmail.com" },
            { id: 2, name: "XYZ Academy", email: "xyz@gmail.com" }
        ];

    renderTenants();
    updateTenantCount();
});

function renderTenants() {
    const table = document.getElementById("tenantTable");
    table.innerHTML = "";

    tenants.forEach((tenant, index) => {
        table.innerHTML += `
            <tr>
                <td>${tenant.id}</td>
                <td>${tenant.name}</td>
                <td>${tenant.email}</td>
                <td>
                    <button onclick="deleteTenant(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function addTenant() {
    const name = prompt("Enter Tenant Name:");
    const email = prompt("Enter Tenant Email:");

    if (!name || !email) {
        alert("All fields required");
        return;
    }

    tenants.push({
        id: tenants.length + 1,
        name,
        email
    });
    localStorage.setItem("tenants", JSON.stringify(tenants));
    renderTenants();
    updateTenantCount();
}

function updateTenantCount() {
    localStorage.setItem("tenantsCount", tenants.length);
}

function deleteTenant(index) {
    tenants.splice(index, 1);
    localStorage.setItem("tenants", JSON.stringify(tenants));
    updateTenantCount();
    renderTenants();
}

function goBack() {
    window.location.href = "dashboard.html";
}
function updateTenantCount() {
    localStorage.setItem("tenantsCount", tenants.length);
}