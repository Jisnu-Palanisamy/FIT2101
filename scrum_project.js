const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");

const transferredTask = JSON.parse(sessionStorage.getItem('transferTask'));

const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

document.getElementById('logoutButton').addEventListener('click', function() {
    window.location.href = 'login.html';
});


sidebarClose.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    
    updateTaskState(data, ev.target.id);
}

function updateTaskState(taskId, columnId) {
    let tasks = JSON.parse(localStorage.getItem('sprintBacklogTasks') || '[]');
    let taskIndex = tasks.findIndex(task => "task_" + task.id == taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].state = columnId;
        localStorage.setItem('sprintBacklogTasks', JSON.stringify(tasks));
    }
}

let count = 0;
document.addEventListener("DOMContentLoaded", function() {

    loadAllParticipant();
    loadRowsFromLocalStorage();
    loadSprintBacklogTasks();
    const sprintBacklogModal = document.getElementById("sprintBacklogModal");
    const closeBacklogButton = document.querySelector(".close-backlog-button");
    const closeParticipantButton = document.getElementById("clss");
    const closeAddParticipantButton = document.getElementById("closeAddParticipantButton");
    const closeEditParticipantButton = document.getElementById("closeEditParticipantButton");
    const modal = document.getElementById("sprintModal");
    const inputParticipantModal = document.getElementById("inputParticipantModal");
    const editParticipantModal = document.getElementById("editParticipantModal");
    const participantModal = document.getElementById("participantModal");
    const btn = document.getElementById("addSprint");
    const btn_prtcpnt = document.getElementById("participant");
    const btn_add_prtcpnt = document.getElementById("addParticipantButton");
    const span = document.querySelector(".close-button");
    const submitSprintBtn = document.getElementById("submitSprint");
    const submitParticipantButton = document.getElementById("submitParticipant");
    const submitEditParticipantButton = document.getElementById("submitEditParticipant");


    document.getElementById('newtransferButton').addEventListener('click', function() {
        window.location.href = 'index.html?transfer=true';
    });

    if (transferredTask) {
        addTaskToSprintBacklogNotStarted(transferredTask);
        sessionStorage.removeItem('transferTask');
    }
    

    document.getElementById('clearTasks').addEventListener('click', function() {
        localStorage.setItem('sprintBacklogTasks', JSON.stringify([]));
        alert('Tasks cleared!');
        location.reload();
    });
    
    let isTotalTimeCleared = false;
    
    function addTaskToTable(task) {
        let taskElement = document.createElement('div');
        taskElement.className = 'task-card';
    
        let taskNameElement = document.createElement('p');
        let tagElement = document.createElement('p');
        let storyPointsElement = document.createElement('p');
        let priorityElement = document.createElement('p');
    
        taskNameElement.innerText = 'Task Name: ' + task.taskName;
        tagElement.innerText = 'Tag: ' + task.tag;
        storyPointsElement.innerText = 'Story Points: ' + task.storyPoint;
        priorityElement.innerText = 'Priority: ' + task.priority;

        task.logTime = task.logTime || "0:0";
        task.totalLogTime = task.totalLogTime || "0:0";

        let logTimeElement = document.createElement('p');
        let totalLogTimeElement = document.createElement('p');

        logTimeElement.innerText = 'Log Time: ' + task.logTime;
        totalLogTimeElement.innerText = 'Total Log Time: ' + task.totalLogTime;
    
        taskElement.draggable = true;
        if (!task.id) { 
            task.id = "task_" + new Date().getTime();
        }
        taskElement.id = task.id;
        taskElement.addEventListener("dragstart", drag);
    
        taskElement.addEventListener("click", function () {
            openTaskDetailsModal(task, taskElement); 
        });
    
        taskElement.appendChild(taskNameElement);
        taskElement.appendChild(tagElement);
        taskElement.appendChild(storyPointsElement);
        taskElement.appendChild(priorityElement);
        taskElement.appendChild(logTimeElement);
        taskElement.appendChild(totalLogTimeElement);
    
        document.getElementById('sprintBacklogNotStarted').appendChild(taskElement);
    }
    
    function openTaskDetailsModal(task, taskElement) {
        const modal = document.getElementById('taskDetailsModal');
    
        document.getElementById('taskNameInput').value = task.taskName;
        document.getElementById('tagInput').value = task.tag;
        document.getElementById('storyPointsInput').value = task.storyPoint;
        document.getElementById('priority').value = task.priority;
    
        modal.style.display = 'block';
    
        function handleSaveClick() {
            const storyPointsValue = document.getElementById('storyPointsInput').value;

            if (isNaN(storyPointsValue) || storyPointsValue < 0) {
                alert('Please enter a valid number for Story Points.');
                return;
    }
            const editedTask = {
                taskName: document.getElementById('taskNameInput').value,
                tag: document.getElementById('tagInput').value,
                storyPoint: document.getElementById('storyPointsInput').value,
                priority: document.getElementById('priority').value,
            };
            
            task.taskName = editedTask.taskName;
            task.tag = editedTask.tag;
            task.storyPoint = editedTask.storyPoint;
            task.priority = editedTask.priority;
            editedTask.logTime = document.getElementById('logTimeInput').value;
            if (!isTotalTimeCleared) {
                editedTask.totalLogTime = addTimes(task.totalLogTime || "0:0", editedTask.logTime);
            } else {
                editedTask.totalLogTime = "0:0";
                isTotalTimeCleared = false;
            }            

            task.logTime = editedTask.logTime;
            task.totalLogTime = editedTask.totalLogTime;
            
            taskElement.querySelector('p:nth-child(1)').innerText = 'Task Name: ' + task.taskName;
            taskElement.querySelector('p:nth-child(2)').innerText = 'Tag: ' + task.tag;
            taskElement.querySelector('p:nth-child(3)').innerText = 'Story Points: ' + task.storyPoint;
            taskElement.querySelector('p:nth-child(4)').innerText = 'Priority: ' + task.priority;
            taskElement.querySelector('p:nth-child(5)').innerText = 'Log Time: ' + task.logTime;
            taskElement.querySelector('p:nth-child(6)').innerText = 'Total Log Time: ' + task.totalLogTime;
            
            closeTaskDetailsModal();

            let tasks = JSON.parse(localStorage.getItem('sprintBacklogTasks') || '[]');
            let index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks[index] = task;
                localStorage.setItem('sprintBacklogTasks', JSON.stringify(tasks));
            }
            
            saveDetailsButton.removeEventListener('click', handleSaveClick);
        }
    
        const saveDetailsButton = document.getElementById('saveDetailsButton');
        saveDetailsButton.addEventListener('click', handleSaveClick);

        const closeDetailsButton = document.querySelector('.close-details-button');
        closeDetailsButton.addEventListener('click', closeTaskDetailsModal);
    }

    function addTimes(time1, time2) {
        let [hours1, minutes1] = time1.split(":").map(Number);
        let [hours2, minutes2] = time2.split(":").map(Number);
    
        let totalHours = hours1 + hours2;
        let totalMinutes = minutes1 + minutes2;
    
        if (totalMinutes >= 60) {
            totalHours += Math.floor(totalMinutes / 60);
            totalMinutes %= 60;
        }
    
        return `${totalHours}:${totalMinutes}`;
    }

    const addTimeButton = document.getElementById('addTimeButton');
    if (addTimeButton) { 
        addTimeButton.addEventListener('click', addToTotalLogTime);
    }
    
    function addToTotalLogTime() {
        let currentLogTime = document.getElementById('logTimeInput').value;
        
        const lastTaskCard = document.querySelector('.task-card:last-child');
        if (lastTaskCard) {
            const totalLogTimeElement = lastTaskCard.querySelector('p:nth-child(6)');
            const currentTotalLogTimeText = totalLogTimeElement.innerText.split(": ")[1]; 
            
            let newTotalLogTime = addTimes(currentLogTime, currentTotalLogTimeText);
            totalLogTimeElement.innerText = 'Total Log Time: ' + newTotalLogTime;
        }
    }
    
    const clearTotalTimeButton = document.getElementById('clearTotalTimeButton');
    if (clearTotalTimeButton) {
        clearTotalTimeButton.addEventListener('click', function() {
            const lastTaskCard = document.querySelector('.task-card:last-child');
            if (lastTaskCard) {
                const totalLogTimeElement = lastTaskCard.querySelector('p:nth-child(6)');
                totalLogTimeElement.innerText = 'Total Log Time: 0:0';
                isTotalTimeCleared = true; 
            }
        });
    }


    function closeTaskDetailsModal() {
        const modal = document.getElementById('taskDetailsModal');

        modal.style.display = 'none';
    }

    function loadSprintBacklogTasks() {
        let tasks = JSON.parse(localStorage.getItem('sprintBacklogTasks') || '[]');
        tasks.forEach(task => {
            let taskElement = document.createElement('div');
            taskElement.className = 'task-card';
    
            let taskNameElement = document.createElement('p');
            let tagElement = document.createElement('p');
            let storyPointsElement = document.createElement('p');
            let priorityElement = document.createElement('p');
    
            taskNameElement.innerText = 'Task Name: ' + task.taskName;
            tagElement.innerText = 'Tag: ' + task.tag;
            storyPointsElement.innerText = 'Story Points: ' + task.storyPoint;
            priorityElement.innerText = 'Priority: ' + task.priority;

            task.logTime = task.logTime || "0:0";
            task.totalLogTime = task.totalLogTime || "0:0";

            let logTimeElement = document.createElement('p');
            let totalLogTimeElement = document.createElement('p');

            logTimeElement.innerText = 'Log Time: ' + task.logTime;
            totalLogTimeElement.innerText = 'Total Log Time: ' + task.totalLogTime;
    
            taskElement.draggable = true;
            taskElement.id = "task_" + task.id;
            taskElement.addEventListener("dragstart", drag);

            taskElement.addEventListener("click", function () {
                openTaskDetailsModal(task, taskElement);
            });
    
            taskElement.appendChild(taskNameElement);
            taskElement.appendChild(tagElement);
            taskElement.appendChild(storyPointsElement);
            taskElement.appendChild(priorityElement);
            taskElement.appendChild(logTimeElement);
            taskElement.appendChild(totalLogTimeElement);
    
            let targetColumn = document.getElementById(task.state || 'sprintBacklogNotStarted');
            targetColumn.appendChild(taskElement);
        });
    }
    
    function addTaskToSprintBacklogNotStarted(task) {
        let tasks = JSON.parse(localStorage.getItem('sprintBacklogTasks') || '[]');
        
        task.id = new Date().getTime();
        task.state = 'sprintBacklogNotStarted';
        
        tasks.push(task);
        localStorage.setItem('sprintBacklogTasks', JSON.stringify(tasks));
    
        addTaskToTable(task);
    }

        
    btn.onclick = function() {
        console.log("Button clicked");
        modal.style.display = "block";
        modal.classList.add("display-flex");
    }

    btn_prtcpnt.onclick = function() {
        console.log("Button clicked 2");
        console.log(loggedUser);
        participantModal.style.display = "block";
        participantModal.classList.add("display-flex");
    }

    btn_add_prtcpnt.onclick = function() {
        inputParticipantModal.style.display = "block";
        inputParticipantModal.classList.add("display-flex");
    }


    span.onclick = function() {
        modal.style.display = "none";
        modal.classList.remove("display-flex");
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            modal.classList.remove("display-flex");
        }
    }

    
    closeBacklogButton.onclick = function() {
        sprintBacklogModal.style.display = "none";
        sprintBacklogModal.classList.remove("display-flex");
    }    

    closeParticipantButton.onclick = function() {
        participantModal.style.display = "none";
        participantModal.classList.remove("display-flex");
    }   
    
    closeAddParticipantButton.onclick = function() {
        inputParticipantModal.style.display = "none";
        inputParticipantModal.classList.remove("display-flex");
    }

    closeEditParticipantButton.onclick = function() {
        editParticipantModal.style.display = "none";
        editParticipantModal.classList.remove("display-flex");
    }


    submitSprintBtn.onclick = function() {

        const inputsForScrum = [document.getElementById("sprintName"), document.getElementById("startDate"), document.getElementById("endDate"), document.getElementById("sprintStatus"), document.getElementById("taskStage")];
        const sprintValues = inputsForScrum.map(input => input.value);
        const [sprintName, startDate, endDate, sprintStatus, taskStage] = sprintValues;

        if (new Date(endDate) < new Date(startDate)){
            alert('End date cannot be before the start date.');
            return;
        }

        for (let input of inputsForScrum) {
            if (!input.value.trim()) {
                alert('Please fill out all fields before adding a sprint.');
                return;
            }
        }
        
        let table = document.querySelector('.scrum-table tbody');
        let row = table.insertRow();
        let scrumcell1 = row.insertCell(0);
        let scrumcell2 = row.insertCell(1);
        let scrumcell3 = row.insertCell(2);

        scrumcell1.innerText = document.getElementById("sprintName").value;
        scrumcell2.innerHTML = "Start: " + document.getElementById("startDate").value + "<br>End: " + document.getElementById("endDate").value;
        scrumcell3.innerText = document.getElementById("sprintStatus").value;
        

        row.style.backgroundColor = "#A4D9FF";


        let deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash delete-icon';
        scrumcell1.prepend(deleteIcon);
        
        let backlogIcon = document.createElement('i');
        backlogIcon.className = 'fas fa-list backlog-icon';
        backlogIcon.addEventListener('click', function() {
            sprintBacklogModal.style.display = "block";
            sprintBacklogModal.classList.add("display-flex");
        });

        scrumcell1.appendChild(backlogIcon);
        
        let rowID = saveRowToLocalStorage({
            sprintName: document.getElementById("sprintName").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            sprintStatus: document.getElementById("sprintStatus").value,
            taskStage: document.getElementById("taskStage").value
        });
        row.dataset.id = rowID; 
    
        modal.style.display = "none";
    }


    submitParticipantButton.onclick = function() {

        const inputsForParticipant = [document.getElementById("participantName"), document.getElementById("participantEmail"), document.getElementById("participantPassword")];
        const participantValues = inputsForParticipant.map(input => input.value);
        const [participantName, participantEmail, participantPassword] = participantValues;


        for (let input of inputsForParticipant) {
            if (!input.value.trim()) {
                alert('Please fill out all fields before adding a sprint.');
                return;
            }
        }

        const newUser = {email: participantEmail, password: participantPassword, name: participantName, role: "user"}

        const localStoredUsers = JSON.parse(localStorage.getItem('localStoredUsers')) || [];
        localStoredUsers.push(newUser);
        localStorage.setItem('localStoredUsers', JSON.stringify(localStoredUsers));
        console.log("local check-", localStoredUsers);
        
        
        let table = document.getElementById("participantModal-table");
        let row = table.insertRow();
        let scrumcell1 = row.insertCell(0);
        let scrumcell2 = row.insertCell(1);
        let scrumcell3 = row.insertCell(2);
        let scrumcell4 = row.insertCell(3);
        let scrumcell5 = row.insertCell(4);

        let count2 = localStoredUsers.length;

        scrumcell2.innerHTML = participantName;
        scrumcell3.innerText = participantEmail;
        scrumcell4.innerText = participantPassword;

        document.getElementById("participantName").value = "";
        document.getElementById("participantEmail").value = "";
        document.getElementById("participantPassword").value = "";


        let deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash delete-icon2';
        scrumcell5.prepend(deleteIcon);


        let editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit edit-icon2';
        scrumcell1.prepend(editIcon);
    
        inputParticipantModal.style.display = "none";
        inputParticipantModal.classList.remove("display-flex");
    }
    

    document.querySelector('.scrum-table tbody').addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-icon')) {
            let row = e.target.closest('tr');
            console.log(row);
            deleteRowFromLocalStorage(row);
            row.remove();
        }
    });

    document.getElementById('participantModal-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-icon2')) {
            let row = e.target.closest('tr');
            console.log(row);
            deleteUserFromLocalStorage(row);
            row.remove();
        }
    });

    document.getElementById('participantModal-table').addEventListener('click', function(e) {

        if (e.target.classList.contains('edit-icon2')) {
            let row = e.target.closest('tr');
            
            const serial = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            const email = row.cells[2].textContent;
            const password = row.cells[3].textContent;
            
            console.log(serial, name, email, password);   

            editParticipantModal.style.display = "block";
            editParticipantModal.classList.add("display-flex");

            const nameInput = document.getElementById('editParticipantName');
            const emailInput = document.getElementById('editParticipantEmail');
            const passwordInput = document.getElementById('editParticipantPassword');

            if(loggedUser.role !== "admin" || loggedUser.email === email){
                nameInput.disabled = true;
                emailInput.disabled = true;
            }

            nameInput.value = name;
            emailInput.value = email;
            passwordInput.value = password;

            submitEditParticipantButton.onclick = function() {
 
                const localStoredUsers = JSON.parse(localStorage.getItem('localStoredUsers')) || [];
                
                localStoredUsers[row.rowIndex - 1].email = emailInput.value;
                localStoredUsers[row.rowIndex - 1].password = passwordInput.value;
                localStoredUsers[row.rowIndex - 1].name = nameInput.value;

                localStorage.setItem('localStoredUsers', JSON.stringify(localStoredUsers));
                console.log("local check-", localStoredUsers);
        
                
                console.log("row number", row.rowIndex);

                row.cells[1].textContent = nameInput.value;
                row.cells[2].textContent = emailInput.value;
                row.cells[3].textContent = passwordInput.value;
    
                editParticipantModal.style.display = "none";
                editParticipantModal.classList.remove("display-flex");
            }

        }

    });


    function loadRowsFromLocalStorage() {
        let rows = JSON.parse(localStorage.getItem('scrumRows') || '[]');
        rows.forEach(rowData => addRowToTable(rowData));
    }    
    

    function addRowToTable(data) {
        let table = document.querySelector('.scrum-table tbody');
        let row = table.insertRow();
    
        let scrumcell1 = row.insertCell(0);
        let scrumcell2 = row.insertCell(1);
        let scrumcell3 = row.insertCell(2);
    
        scrumcell1.innerText = data.sprintName;
        scrumcell2.innerHTML = "Start: " + data.startDate + "<br>End: " + data.endDate;
        scrumcell3.innerText = data.sprintStatus;
    
        let deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash delete-icon';
        scrumcell1.prepend(deleteIcon);
        

        let backlogIcon = document.createElement('i');
        backlogIcon.className = 'fas fa-list backlog-icon';
        backlogIcon.addEventListener('click', function() {
            sprintBacklogModal.style.display = "block";
            sprintBacklogModal.classList.add("display-flex");
        });
        scrumcell1.appendChild(backlogIcon);
    
        row.style.backgroundColor = "#A4D9FF"; 

        row.dataset.id = data.id;
    }

    function saveRowToLocalStorage(data) {
        let rows = JSON.parse(localStorage.getItem('scrumRows') || '[]');
        data.id = new Date().getTime();
        rows.push(data);
        localStorage.setItem('scrumRows', JSON.stringify(rows));
        return data.id;
    }
    
    
    function deleteRowFromLocalStorage(row) {
        let rows = JSON.parse(localStorage.getItem('scrumRows') || '[]');
        let rowID = row.dataset.id;
    
        let index = rows.findIndex(r => r.id == rowID);
        if (index > -1) {
            rows.splice(index, 1);
            localStorage.setItem('scrumRows', JSON.stringify(rows));
        }
    }

    function deleteUserFromLocalStorage(row) {
        let rows = JSON.parse(localStorage.getItem('localStoredUsers') || '[]');
        let rowID = row.dataset.id;
    
        let index = rows.findIndex(r => r.id == rowID);
        if (index > -1) {
            rows.splice(index, 1);
            localStorage.setItem('localStoredUsers', JSON.stringify(rows));
        }
    }
    

    function loadAllParticipant(){
        const localStoredUsers = JSON.parse(localStorage.getItem('localStoredUsers')) || [];

        console.log("local check-", localStoredUsers);
        
        for(let i = 0; i < localStoredUsers.length; i++){

            let table = document.getElementById("participantModal-table");
            let row = table.insertRow();

            let scrumcell1 = row.insertCell(0);
            let scrumcell2 = row.insertCell(1);
            let scrumcell3 = row.insertCell(2);
            let scrumcell4 = row.insertCell(3);
            let scrumcell5 = row.insertCell(4);

                        scrumcell2.innerHTML = localStoredUsers[i].name;
            scrumcell3.innerText = localStoredUsers[i].email;
            if(loggedUser.role === 'admin' || (localStoredUsers[i].email === loggedUser.email)){
                scrumcell4.innerText = localStoredUsers[i].password;
            }

            let deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash delete-icon2';
            scrumcell5.prepend(deleteIcon);  
            if(loggedUser.role !== 'admin'){
                deleteIcon.style.display = 'none';
            }

            let editIcon = document.createElement('i');
            editIcon.className = 'fas fa-edit edit-icon2';
            scrumcell1.prepend(editIcon); 
            if(loggedUser.role !== 'admin' && (localStoredUsers[i].email !== loggedUser.email)){
                editIcon.style.display = 'none';
            }

            if(loggedUser.role !== 'admin' && (localStoredUsers[i].email !== loggedUser.email)){
                document.getElementById("addParticipantButton").style.display = 'none';
            }

        }
    }

});
