checkAuth();

let courses = JSON.parse(localStorage.getItem("courses")) || [];

function saveCourses(){
    localStorage.setItem("courses", JSON.stringify(courses));
}

function renderCourses(){
    let table = document.getElementById("courseTable");
    let search = document.getElementById("searchCourse").value.toLowerCase();

    table.innerHTML = "";

    let filtered = courses.filter(c => 
        c.name.toLowerCase().includes(search)
    );

    if(filtered.length === 0){
        table.innerHTML = `
        <tr>
            <td colspan="6">No courses found 😕</td>
        </tr>`;
        return;
    }

    filtered.forEach((c, index) => {
        table.innerHTML += `
        <tr>
            <td>${index+1}</td>
            <td>${c.name}</td>
            <td>${c.duration}</td>
            <td>₹${c.fees}</td>
            <td>${c.students || 0}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCourse(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCourse(${index})">Delete</button>
            </td>
        </tr>`;
    });
}

function addCourse(){
    let name = document.getElementById("courseName").value;
    let duration = document.getElementById("courseDuration").value;
    let fees = document.getElementById("courseFees").value;

    if(!name || !duration || !fees){
        alert("Fill all fields");
        return;
    }

    courses.push({
        name,
        duration,
        fees,
        students: 0
    });

    saveCourses();
    closeModal();
    renderCourses();
}

function deleteCourse(index){
    courses.splice(index,1);
    saveCourses();
    renderCourses();
}

function editCourse(index){
    let newName = prompt("Enter new course name", courses[index].name);
    if(newName){
        courses[index].name = newName;
        saveCourses();
        renderCourses();
    }
}

document.getElementById("searchCourse").addEventListener("input", renderCourses);

renderCourses();