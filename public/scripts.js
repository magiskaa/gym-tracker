
window.exercises = window.exercises || [];
window.completed_workouts = window.completed_workouts || [];

// ----------------------------Exercises Functionality----------------------------

document.addEventListener('DOMContentLoaded', function() {
    const exerciseDataElement = document.getElementById('exercise-data');
    if (!exerciseDataElement) return;
    let exercises = [];
    try {
        window.exercises = JSON.parse(exerciseDataElement.textContent);
    } catch (e) {
        console.error('Error parsing exercise data:', e);
        window.exercises = [];
        return;
    }

    window.exercises.forEach(exercise => {
        const safeName = exercise.name.replace(/\s+/g, '-');
        const ctxReps = document.getElementById('chart-reps-' + safeName);
        const ctxWeight = document.getElementById('chart-weight-' + safeName);
        const labels = exercise.journey.map(j => {
            if (!j.date) return '';
            const parts = j.date.split('.');
            if (parts.length < 3) return '';
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            return `${day}.${month}.`;
        });
        const reps = exercise.journey.map(j => j.reps || 0);
        const weight = exercise.journey.map(j => j.weight || 0);

        if (ctxReps) {
            new Chart(ctxReps, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Reps / Set',
                        data: reps,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.1)',
                        fill: true,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false } }
                }
            });
        }
        if (ctxWeight) {
            new Chart(ctxWeight, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Weight (kg)',
                        data: weight,
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255,193,7,0.1)',
                        fill: true,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false } }
                }
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const list = document.getElementById('exercise-list');
    const filterButtons = document.getElementById('category-sort');
    if (!list || !filterButtons) return;

    const ex_cards = Array.from(list.querySelectorAll('.exercise'));

    function filterByCategory(category) {
        ex_cards.forEach(card => {
            const isMatch = category === 'All' || card.dataset.category === category;
            card.style.display = isMatch ? '' : 'none';
        });
    };

    filterButtons.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-category]');
        if (!button) return;

        const category = button.dataset.category;
        filterByCategory(category);

        filterButtons.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
    });

    const defaultButton = filterButtons.querySelector('button[data-category="All"]');
    if (defaultButton) defaultButton.click();
});

document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category-select');

    if (!categorySelect) return;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    if (!window.exercises) return;

    let categories = new Set();
    window.exercises.forEach(ex => {
        if (!categories.has(ex.category)) {
            categories.add(ex.category);
            const option = document.createElement('option');
            option.value = ex.category;
            option.textContent = ex.category;
            categorySelect.appendChild(option);
        }
    });
});


// ----------------------------Calendar Functionality----------------------------

function formatDate(d) {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

let currentDate = new Date();

function generateCalendar(year, month) {
    const calendar = document.getElementById('calendar');
    const monthTitle = document.getElementById('current-month');

    if (!calendar || !monthTitle) return; // guard for non-calendar pages
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
    
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.background = '#333';
        dayHeader.style.color = 'white';
        dayHeader.style.padding = '10px 5px';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.fontWeight = 'bold';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 1; i < firstDay; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.style.background = '#ddd';
        calendar.appendChild(dayCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';

        const today = new Date();
        if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()
        ) {
            dayCell.classList.add('calendar-today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Show workouts for this day
        const dateStr = formatDate(new Date(year, month, day));
        const dayWorkouts = window.completed_workouts.filter(w => w.date === dateStr);
        
        dayWorkouts.forEach(workout => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout-dot';
            workoutDiv.textContent = workout.name;
            dayCell.appendChild(workoutDiv);
        });
        
        calendar.appendChild(dayCell);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function loadWorkoutData() {
    // Get workout data from a hidden element in the HTML
    const workoutDataElement = document.getElementById('workout-data');
    if (workoutDataElement) {
        try {
            window.completed_workouts = JSON.parse(workoutDataElement.textContent);
        } catch (e) {
            console.error('Error parsing workout data:', e);
            window.completed_workouts = [];
        }
    }
}

function loadExerciseData() {
    // Get exercise data from a hidden element in the HTML
    const exerciseDataElement = document.getElementById('exercise-data');
    if (exerciseDataElement) {
        try {
            window.exercises = JSON.parse(exerciseDataElement.textContent);
        } catch (e) {
            console.error('Error parsing exercise data:', e);
            window.exercises = [];
        }
    }
}

// Initialize calendar when page loads and if calendar exists
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    loadWorkoutData();
    loadExerciseData();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

// ----------------------------Workout Functionality----------------------------

document.addEventListener('DOMContentLoaded', function() {
    let exerciseCount = 0;
    const exerciseFields = document.getElementById('exercise-fields');
    const addExerciseButton = document.getElementById('add-exercise-button');
    const deleteExerciseButton = document.getElementById('delete-exercise-button');
    if (!exerciseFields || !addExerciseButton || !deleteExerciseButton) return; // not on the workout page

    function createExerciseField(index) {
        const wrapper = document.createElement('div');

        const nameSelect = document.createElement('select');
        nameSelect.name = `exercise-${index}`;
        nameSelect.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Select Exercise ${index + 1}`;
        defaultOption.disabled = true;
        defaultOption.selected = true;
        nameSelect.appendChild(defaultOption);

        window.exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.name;
            option.textContent = ex.name;
            nameSelect.appendChild(option);
        });

        wrapper.append(nameSelect);
        exerciseFields.appendChild(wrapper);
    }

    // Create datalist for suggestions
    const datalist = document.createElement('datalist');
    datalist.id = 'exercise-suggestions';
    window.exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex.name;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);

    for (let i = 0; i < 3; i++) {
        createExerciseField(i);
        exerciseCount++;
    }

    // Add more fields on button click
    addExerciseButton.addEventListener('click', () => {
        createExerciseField(exerciseCount);
        exerciseCount++;
    });

    // Delete an exercise field on button click
    deleteExerciseButton.addEventListener('click', () => {
        if (exerciseCount > 1) {
            const lastChild = exerciseFields.lastElementChild;
            if (lastChild) {
                exerciseFields.removeChild(lastChild);
                exerciseCount--;
            }
        } else {
            alert('At least one exercise is required.')
        }
    })
});


// ----------------------------Workout in Progress----------------------------

const timerElem = document.getElementById('timer');
if (timerElem) {
    let startTime = localStorage.getItem('workoutStartTime');
    if (!startTime) {
        startTime = Date.now();
        localStorage.setItem('workoutStartTime', startTime);
    }

    function updateTimer() {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        timerElem.textContent = `${hours}:${minutes}:${secs}`;
        document.getElementById('duration-field').value = elapsed; // Set duration in the form
    }

    setInterval(updateTimer, 1000);
    updateTimer();

    const workoutForm = document.querySelector('form[action=\"/end-workout\"]');
    if (workoutForm) {
        workoutForm.addEventListener('submit', () => {
            localStorage.removeItem('workoutStartTime');
        });
    }

    const deleteWorkoutForm = document.querySelector('form[action=\"/delete-workout\"]');
    if (deleteWorkoutForm) {
        deleteWorkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to delete this workout? All progress will be lost.')) {
                localStorage.removeItem('workoutStartTime');
                deleteWorkoutForm.submit();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action="/end-workout"]');
    if (!form) return;

    form.addEventListener('click', async (e) => {
        console.log('Delete exercise button pressed');
        const button = e.target.closest('button[data-name]');
        if (!button) return;

        const entry = button.closest('.workout-exercise-entry');
        if (!entry) return;

        const exName = button.dataset.name || 'this exercise';
        if (!confirm(`Are you sure you want to remove "${exName}"? Any entered values for it will be lost.`)) return;

        entry.remove();

        reindexWorkoutEntries(form);

        const currentExercises = Array.from(form.querySelectorAll('input[name^="exercise-"]'))
            .map(input => input.value)
            .filter(value => value);
        console.log('Current exercises: ', currentExercises);

        try {
            console.log('Sending fetch');
            const response = await fetch('/update-exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exercises: currentExercises })
            });
            if (!response.ok) {
                console.error('Failed to update exercises');
            } else {
                console.log('Update ok');
            }
        } catch (error) {
            console.error('Error updating exercises: ', error);
        }
    });

    function reindexWorkoutEntries(formE1) {
        const entries = Array.from(formE1.querySelectorAll('.workout-exercise-entry'));
        entries.forEach((entry, i) => {
            const sets = entry.querySelector('input[name^="sets-"]');
            const reps = entry.querySelector('input[name^="reps-"]');
            const weight = entry.querySelector('input[name^="weight-"]');
            const hidden = entry.querySelector('input[name^="exercise-"]');

            if (sets) sets.name = `sets-${i}`;
            if (reps) reps.name = `reps-${i}`;
            if (weight) weight.name = `weight-${i}`;
            if (hidden) hidden.name = `exercise-${i}`;
        });
    }
});


// ----------------------------PWA Service Worker----------------------------

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('SW registration failed:', err);
    });
  });
}
    