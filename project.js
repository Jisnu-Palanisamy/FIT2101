window.onload = function() {
    let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    //console.log(storedTasks);
    let isSortedNewestFirst = false;
    let showTransferIcon = new URL(window.location.href).searchParams.get('transfer') === 'true';

    document.getElementById('logoutButton').addEventListener('click', function() {
        window.location.href = 'login.html';
    });    


    function addRowToTable(task) {
        const table = document.getElementById("productBacklog");
        const newRow = table.insertRow(-1);

        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);

        cell1.style.position = 'relative';

        cell1.innerHTML = `<div style="background-color: #FFD582; min-height: 100px; display: flex; align-items: center; justify-content: center;">${task.taskName}</div>
        <span class="edit-icon" style="position: absolute; left: -30px; top: 30%; transform: translateY(-50%);">&#9998;</span>
        ${showTransferIcon ? '<span class="transfer-icon" style="position: absolute; font-size: 2em; right: 350px; top: 50%; transform: translateY(-50%);">🔁</span>' : ''}`;
        const tagsHTML = task.tag.split(', ').map(tag => `<span class="tag-pill">${tag}</span>`).join(' ');
        cell2.innerHTML = `<div style="background-color: #BDE3FF; min-height: 100px; display: flex; align-items: center; justify-content: center;">${tagsHTML}</div>`;
        cell3.innerHTML = `<div style="background-color: #EF755A; min-height: 100px; display: flex; align-items: center; justify-content: center;">${task.storyPoint}</div>`;
        cell4.innerHTML = `<div style="background-color: ${task.priorityColor}; min-height: 100px; display: flex; align-items: center; justify-content: center;">${task.priority}</div>`;



        const transferIcon = newRow.querySelector('.transfer-icon');
        if (transferIcon) {
            transferIcon.addEventListener('click', function() {
                const taskName = task.taskName; 
                const taskStatus = task.TaskStatus;
                const taskStages = task.TaskStages;
                const storyPoint = task.storyPoint;
                const priority = task.priority;
                const tag = task.tag;

                sessionStorage.setItem('transferTask', JSON.stringify({taskName, taskStatus, taskStages, storyPoint, priority, tag}));

                const indexToRemove = storedTasks.findIndex(task => task.taskName === taskName);
                if (indexToRemove !== -1) {
                    storedTasks.splice(indexToRemove, 1);
                    localStorage.setItem('tasks', JSON.stringify(storedTasks));
                }
                newRow.remove();
                window.location.href = 'scrumboard.html';
            });
        }

       
        const editIcon = newRow.querySelector('.edit-icon');
        editIcon.addEventListener('click', function() {
            populateForm(task);
            newRow.classList.add("editing");
            document.getElementById("taskModal").style.display = "block";
            isEditing = true;
            addTaskButton.textContent = "Confirm Changes";
        });

        const deleteIcon = document.createElement('span');
        deleteIcon.innerHTML = "&#10060;";
        deleteIcon.style.position = 'absolute';
        deleteIcon.style.left = '-30px';
        deleteIcon.style.top = '60%';
        deleteIcon.style.transform = 'translateY(-50%)';
        deleteIcon.style.cursor = 'pointer';
        cell1.appendChild(deleteIcon);

        deleteIcon.addEventListener('click', function() {
            newRow.remove();
            const indexToRemove = storedTasks.findIndex(t => t.taskName === task.taskName && t.tag === task.tag);
            if (indexToRemove !== -1) {
                storedTasks.splice(indexToRemove, 1);
                localStorage.setItem('tasks', JSON.stringify(storedTasks));
            }
        });
        const infoIcon = document.createElement('span');
        infoIcon.innerHTML = '&#8505;'; 
        infoIcon.style.position = 'absolute';
        infoIcon.style.left = '-20px';
        infoIcon.style.top = '90%'; 
        infoIcon.style.transform = 'translateY(-50%)';
        infoIcon.style.cursor = 'pointer';
        cell1.appendChild(infoIcon);

        infoIcon.addEventListener('click', function() {
            displayInfo(task);
        });
    }
    
    function displayInfo(task) {
        const infoModal = document.getElementById("infoModal");
        const infoContent = document.getElementById("infoContent");

       
        function createCategoryBox(categoryName, categoryValue) {
            return `
                <div class="category-box">
                    <div class="category-heading">${categoryName}</div>
                    <div class="category-content">${categoryValue}</div>
                </div>
            `;
        }
        const priorityColors = {
            "Urgent": "#EE0C0C",
            "Important": "#FF7A00",
            "Medium": "#FAFF07",
            "Low": "#14AE5C",
        };
        const priorityColor = priorityColors[task.priority] || "#000";



        // Populate the info modal with task information
        infoContent.innerHTML = `
            <h2><strong>Task Information</strong></h2>
            ${createCategoryBox("Task Name", task.taskName)}
            ${createCategoryBox("Task Description", task.taskDescription)}
            <div class="category-box"> <!-- Priority Category Box -->
                <div class="category-heading">Priority</div>
                <div class="category-content" style="color: ${priorityColor};">${task.priority}</div>
            </div>
            ${createCategoryBox("Task Type", task.taskType)}
            ${createCategoryBox("Tags", task.tag)}
            ${createCategoryBox("Story Point", task.storyPoint)}
            ${createCategoryBox("Assigned To", task.AssignedTo)} <!-- Use correct property name -->
            ${createCategoryBox("Task Stages", task.TaskStages)} <!-- Use correct property name -->
            ${createCategoryBox("Task Status", task.TaskStatus)}
        `;


        // Display the info modal
        infoModal.style.display = "block";


        // Close the info modal when the close button is clicked
        const closeInfoButton = document.querySelector(".close-info");
        closeInfoButton.addEventListener("click", function() {
            infoModal.style.display = "none";
        });

    }


    // Populate the table with stored tasks
    storedTasks.forEach(task => addRowToTable(task));

    // Code for showing/hiding the modal
    document.getElementById("addTaskButton").onclick = function() {
        document.getElementById("taskModal").style.display = "block";
    };

    document.getElementsByClassName("close")[0].onclick = function() {
        document.getElementById("taskModal").style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === document.getElementById("taskModal")) {
            document.getElementById("taskModal").style.display = "none";
        }
    };

    function populateForm(data) {
        document.getElementById("taskName").value = data.taskName || '';
        const tagsSelect = document.getElementById("tags");
        const selectedTags = data.tag.split(', ');
        for (let i = 0; i < tagsSelect.options.length; i++) {
            if (selectedTags.includes(tagsSelect.options[i].textContent)) {
                tagsSelect.options[i].selected = true;
            } else {
                tagsSelect.options[i].selected = false;
            }
        }
        document.getElementById("storyPoint").value = data.storyPoint || '';
        document.getElementById("priority").value = data.priority || '';
    }

    // Code for populating the table
    const addTaskButton = document.getElementById("addTask");

    let isEditing = false;

    const priorityColorMap = {
        "Urgent": "red",
        "Important": "orange",
        "Medium": "yellow",
        "Low": "green"
    };

    function getSelectedTagNames(selectElement) {
        const selectedOptions = Array.from(selectElement.selectedOptions);
        return selectedOptions.map(option => option.textContent).join(', ');
    }

    addTaskButton.addEventListener('click', function() {
        // Validation: Check if fields are empty
        const inputs = [document.getElementById("taskName"), document.getElementById("tags"), document.getElementById("storyPoint"), document.getElementById("priority"), document.getElementById("taskDescription"), document.getElementById("taskType"), document.getElementById("assignedTo"), document.getElementById("taskStages"), document.getElementById("taskStatus")];
    
        for (let input of inputs) {
            if (!input.value.trim()) {
                alert('Please fill out all fields before adding a task.');
                return; // Exit the function if any field is empty
            }
        }
    
        if (isEditing) {
            const editedRow = document.querySelector(".editing");
            const oldTaskName = editedRow.cells[0].querySelector('div').textContent;
            const oldTag = editedRow.cells[1].querySelector('div').textContent;

            // Find the corresponding task in storedTasks
            const indexToEdit = storedTasks.findIndex(t => t.taskName === oldTaskName && t.tag === oldTag);
            if (indexToEdit === -1) return;

            // Get new values from the form
            const newTaskName = document.getElementById("taskName").value;
            const newTag = getSelectedTagNames(document.getElementById("tags"));
            const newStoryPoint = document.getElementById("storyPoint").value;
            const newPriority = document.getElementById("priority").value;


            // Update the table display
            editedRow.cells[0].querySelector('div').textContent = newTaskName;
            editedRow.cells[1].querySelector('div').textContent = newTag;
            editedRow.cells[2].querySelector('div').textContent = newStoryPoint;
            editedRow.cells[3].querySelector('div').textContent = newPriority;
            editedRow.cells[3].querySelector('div').style.backgroundColor = priorityColorMap[newPriority];

            // Update storedTasks
            storedTasks[indexToEdit] = {
                taskName: newTaskName,
                tag: newTag,
                storyPoint: newStoryPoint,
                priority: newPriority,
                priorityColor: priorityColorMap[newPriority]
            };

            // Update localStorage
            localStorage.setItem('tasks', JSON.stringify(storedTasks));

            document.getElementById("taskModal").style.display = "none";
            isEditing = false;
            addTaskButton.textContent = "Add Task";
            editedRow.classList.remove("editing");
            return;
        } else {
            const taskName = document.getElementById("taskName").value;
            const tag = getSelectedTagNames(document.getElementById("tags"));
            const storyPoint = document.getElementById("storyPoint").value;
            const priority = document.getElementById("priority").value;
            const taskDescription = document.getElementById("taskDescription").value;
            const taskType = document.getElementById("taskType").value;
            const assignedTo = document.getElementById("assignedTo").value;
            const taskStages = document.getElementById("taskStages").value;
            const taskStatus = document.getElementById("taskStatus").value;
    
            const task = {
                taskName,
                tag,
                storyPoint,
                priority,
                taskDescription,
                taskType,
                AssignedTo: assignedTo,
                TaskStages: taskStages,
                TaskStatus: taskStatus,
                priorityColor: priorityColorMap[priority]
            };
    
            addRowToTable(task);
    
            storedTasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(storedTasks));
        }
    });


    function toggleSortDropdown() {
        const sortDropdown = document.getElementById("sortDropdown");
        if (sortDropdown.style.display === "block") {
            sortDropdown.style.display = "none";
        } else {
            sortDropdown.style.display = "block";
        }
    }

    
     function clearTable() {
         const table = document.getElementById("productBacklog");
         let rowCount = table.rows.length;

         
         for (let i = 1; i < rowCount; i++) {
             table.deleteRow(1); 
         }
     }

    // Sorting by Newest to Oldest
    function sortTasksByNewest() {
        if (!isSortedNewestFirst) {
            storedTasks.reverse();
            clearTable();
            storedTasks.forEach(task => addRowToTable(task));
            isSortedNewestFirst = true;  
        }
    }

    // Sorting by Oldest to Newest
    function sortTasksByOldest() {
        if (isSortedNewestFirst) {
            storedTasks.reverse();
            clearTable();
            storedTasks.forEach(task => addRowToTable(task));
            isSortedNewestFirst = false; 
        }
    }

    // Sorting by Priority
    function sortTasksByPriority(order) {
        const priorityOrder = { "Urgent": 1, "Important": 2, "Medium": 3, "Low": 4 };

        storedTasks.sort((taskA, taskB) => {
            if (order === "HighestToLowest") {
                return priorityOrder[taskA.priority] - priorityOrder[taskB.priority];
            } else {
                return priorityOrder[taskB.priority] - priorityOrder[taskA.priority];
            }
        });

        clearTable();
        storedTasks.forEach(task => addRowToTable(task));
    }



    document.getElementById("sortPriorityButton").onclick = function(event) {
        event.stopPropagation();
        toggleSortDropdown();
    }

    // Event Listeners for Sorting
    document.getElementById("sortNewestToOldest").addEventListener("click", function() {
        sortTasksByNewest();
    });

    document.getElementById("sortOldestToNewest").addEventListener("click", function() {
        sortTasksByOldest();
    });

    document.getElementById("sortHighestToLowest").addEventListener("click", function() {
        sortTasksByPriority("HighestToLowest");
    });

    document.getElementById("sortLowestToHighest").addEventListener("click", function() {
        sortTasksByPriority("LowestToHighest");
    });


    function toggleTagDropdown() {
        const tagDropdown = document.getElementById("tagDropdown");
        if (tagDropdown.style.display === "block") {
            tagDropdown.style.display = "none";
        } else {
            tagDropdown.style.display = "block";
        }
    }
    function filterTasksByTag(event) {
        event.preventDefault();
        const clickedLink = event.target;
        const tagToFilter = clickedLink.textContent.trim();
        const tableRows = document.getElementById("productBacklog").getElementsByTagName('tr');
        
        for (let i = 1; i < tableRows.length; i++) {
            const row = tableRows[i];
            const tagPills = row.cells[1].querySelectorAll('.tag-pill');
            const tagsArray = Array.from(tagPills).map(pill => pill.textContent.trim());
            
            if (tagToFilter === 'Clear Filter' || tagsArray.includes(tagToFilter)) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        }
    }
    
    document.getElementById("tagIconButton").onclick = function(event) {
        event.stopPropagation();
        toggleTagDropdown();
    } 

    const tagDropdown = document.getElementById("tagDropdown");
    tagDropdown.addEventListener('click', filterTasksByTag);


    const sidebar = document.querySelector(".sidebar");
    const sidebarClose = document.querySelector("#sidebar-close");

    sidebarClose.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });
};
