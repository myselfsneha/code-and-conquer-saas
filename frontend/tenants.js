const API = "https://code-and-conquer-saas.onrender.com";

// TEMP TOKEN (remove later)
if (!localStorage.getItem("token")) {
    localStorage.setItem("token", "test123");
}

// =====================
// LOAD
// =====================
document.addEventListener("DOMContentLoaded", () => {
    fetchTenants();
});

// =====================
// FETCH TENANTS
// =====================
async function fetchTenants() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API + "/tenants", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        const tenants = data.tenants || data;

        renderTenants(tenants);

    } catch (err) {
        console.error(err);
        alert("Error loading tenants");
    }
}

// =====================
// RENDER TABLE
// =====================
function renderTenants(tenants) {

    const table = document.getElementById("tenantTable");

    if (!tenants.length) {
        table.innerHTML = `<tr><td colspan="6">No tenants found</td></tr>`;
        return;
    }

    let rows = "";

    tenants.forEach(t => {
        rows += `
        <tr>
            <td>${t.tenant_id || "-"}</td>
            <td>${t.name}</td>
            <td>${t.email}</td>
            <td>${t.college || "-"}</td>
            <td>${t.phone || "-"}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTenant(${t.tenant_id})">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

    table.innerHTML = rows;
}

// =====================
// ADD TENANT
// =====================
async function addTenant() {

    const name = document.getElementById("tenantName").value;
    const email = document.getElementById("tenantEmail").value;
    const college = document.getElementById("tenantCollege").value;
    const phone = document.getElementById("tenantPhone").value;

    const token = localStorage.getItem("token");

    if (!name || !email || !college || !phone) {
        alert("Fill all fields");
        return;
    }

    try {
        await fetch(API + "/tenants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                name,
                email,
                college,
                phone
            })
        });

        alert("Tenant added");
        closeModal();
        fetchTenants();

    } catch (err) {
        console.error(err);
        alert("Error adding tenant");
    }
}

// =====================
// DELETE TENANT
// =====================
async function deleteTenant(id) {

    const token = localStorage.getItem("token");

    if (!confirm("Delete tenant?")) return;

    try {
        await fetch(`${API}/tenants/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        alert("Deleted");
        fetchTenants();

    } catch (err) {
        console.error(err);
        alert("Error deleting");
    }
}

// =====================
// MODAL
// =====================
function openModal(){
    document.getElementById("tenantModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("tenantModal").style.display = "none";
}