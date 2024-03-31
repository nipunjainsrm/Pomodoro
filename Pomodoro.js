
    document.addEventListener('DOMContentLoaded', function () {

	

      const taskTable = document.getElementById('task-table');
      const addTaskBtn = document.getElementById('add-task-btn');
      const startBtn = document.getElementById('start-btn');
      const pauseBtn = document.getElementById('pause-btn');
      const resetBtn = document.getElementById('reset-btn');
      const saveBtn = document.getElementById('save-btn'); // Added save button
      const timerDisplay = document.getElementById('timer');

      let tasks = [];
      const delimiter = '|'; // Delimiter for tasks.txt file

      function renderTasks() {
        const tbody = taskTable.querySelector('tbody');
        tbody.innerHTML = '';
        tasks.forEach((task, index) => {
          const row = document.createElement('tr');
          const radioCell = document.createElement('td');
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'selectedTask';
          radio.value = index;
          radio.checked = task.selected;
          radio.addEventListener('change', () => handleTaskSelection(index));
          radioCell.appendChild(radio);
          row.appendChild(radioCell);
          const descriptionCell = document.createElement('td');
          const descriptionInput = document.createElement('input');
          descriptionInput.type = 'text';
          descriptionInput.name = 'description';
          descriptionInput.value = task.description || '';
          descriptionInput.addEventListener('focus', (event) => clearPlaceholder(event));
          descriptionInput.addEventListener('blur', (event) => restorePlaceholder(event, index));
          descriptionCell.appendChild(descriptionInput);
          row.appendChild(descriptionCell);
          const unitCell = document.createElement('td');
          const unitSelect = document.createElement('select');
          const minOption = document.createElement('option');
          minOption.value = 'min';
          minOption.textContent = 'min';
          const secOption = document.createElement('option');
          secOption.value = 'sec';
          secOption.textContent = 'sec';
          unitSelect.appendChild(minOption);
          unitSelect.appendChild(secOption);
          unitSelect.value = task.unit || 'sec';
          unitSelect.addEventListener('change', (event) => handleUnitChange(event, index));
          unitCell.appendChild(unitSelect);
          row.appendChild(unitCell);
          const durationCell = document.createElement('td');
          const durationInput = document.createElement('input');
          durationInput.type = 'number';
          durationInput.name = 'duration';
          durationInput.value = task.duration || '';
          durationInput.addEventListener('focus', (event) => clearPlaceholder(event));
          durationInput.addEventListener('blur', (event) => restorePlaceholder(event, index));
          durationCell.appendChild(durationInput);
          row.appendChild(durationCell);
          const deleteCell = document.createElement('td');
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.addEventListener('click', () => handleDelete(index));
          deleteCell.appendChild(deleteBtn);
          row.appendChild(deleteCell);
          const statusCell = document.createElement('td');
          statusCell.textContent = task.status || 'Not Started';
          row.appendChild(statusCell);
          tbody.appendChild(row);
        });
        // Show save button only if there are tasks
        saveBtn.style.display = tasks.length > 0 ? 'inline-block' : 'none';
      }

      function handleTaskSelection(index) {
        tasks.forEach((task, i) => {
          task.selected = i === index;
        });
        renderTasks();
      }

      function clearPlaceholder(event) {
        if (event.target.value === 'Description' || event.target.value === 'Duration') {
          event.target.value = '';
        }
      }

      function restorePlaceholder(event, index) {
        if (!event.target.value) {
          if (event.target.name === 'description') {
            event.target.value = '';
          } else if (event.target.name === 'duration') {
            event.target.value = '';
          }
        } else {
          tasks[index][event.target.name] = event.target.value;
        }
      }

      function handleUnitChange(event, index) {
        tasks[index].unit = event.target.value;
      }

  function handleSave() {
  const tasksData = tasks.map(task => {
    const { description, unit, duration, status } = task;
    return `${description}${delimiter}${unit}${delimiter}${duration}${delimiter}${status}`;
  }).join('\n');

  const blob = new Blob([tasksData], { type: 'text/plain' });
  
  // Create object URL
  const url = window.URL.createObjectURL(blob);
  
  // Create temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks.txt';
  a.click();
  
  // Release object URL
  window.URL.revokeObjectURL(url);
}


     



      function handleDelete(index) {
        tasks.splice(index, 1);
        renderTasks();
      }

      let intervalId;
      let timerRunning = false;
      let time = 0;

      function startTimer() {
        intervalId = setInterval(() => {
          const selectedTask = tasks.find(task => task.selected);
          if (!selectedTask || !selectedTask.duration) {
            return;
          }
          let durationInSeconds = selectedTask.duration;
          if (selectedTask.unit === 'min') {
            durationInSeconds *= 60;
          }
          time++;
          const minutes = Math.floor(time / 60);
          const seconds = time % 60;
          updateTimerDisplay(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          if (time >= durationInSeconds) {
            clearInterval(intervalId);
            time = 0;
            timerRunning = false;
            updateTaskStatus(selectedTask, 'Completed');
            const beepSound = new Audio('beep.wav'); // Provide the path to your beep sound file
            beepSound.play();
          }
        }, 1000);
      }

      function pauseTimer() {
        clearInterval(intervalId);
      }

      function resetTimer() {
        clearInterval(intervalId);
        time = 0;
        timerRunning = false;
        updateTimerDisplay('00:00');
      }

      function updateTimerDisplay(time) {
        timerDisplay.textContent = time;
      }

      function updateTaskStatus(task, status) {
        task.status = status;
        renderTasks();
      }

      startBtn.addEventListener('click', () => {
        if (timerRunning) {
          return;
        }
        const selectedTask = tasks.find(task => task.selected);
        if (!selectedTask) {
          alert('Select a Task to start timer');
          return;
        }
        if (!selectedTask.duration) {
          alert('Please enter task duration.');
          return;
        }
        timerRunning = true;
        startTimer();
        updateTaskStatus(selectedTask, 'In-Progress');
      });

      pauseBtn.addEventListener('click', () => {
        if (!timerRunning) {
          return;
        }
        timerRunning = false;
        pauseTimer();
        const selectedTask = tasks.find(task => task.selected);
        updateTaskStatus(selectedTask, 'Paused');
      });

      resetBtn.addEventListener('click', () => {
        resetTimer();
        const selectedTask = tasks.find(task => task.selected);
        if (selectedTask) {
          updateTaskStatus(selectedTask, 'Not Started');
        }
      });

      addTaskBtn.addEventListener('click', () => {
        tasks.push({ description: '', unit: 'sec', duration: '', status: 'Not Started' });
        renderTasks();
      });

      saveBtn.addEventListener('click', handleSave); // Add event listener for save button

      
      renderTasks(); // Render tasks
    });
