
window.addEventListener("DOMContentLoaded", () => {
    loadData();
    createCustomWorkoutFields();
    createCalendar();
    createExerciseCharts();
});

/**
 * Loads all the data from the JSON-files
 */
function loadData() {
    const exercisesElement = document.getElementById("exercises-data");
    const presetWorkoutsElement = document.getElementById("preset-workouts-data");
    const completedWorkoutsElement = document.getElementById("completed-workouts-data");

    try {
        window.exercises = JSON.parse(exercisesElement.textContent);
        window.presetWorkouts = JSON.parse(presetWorkoutsElement.textContent);
        window.completedWorkouts = JSON.parse(completedWorkoutsElement.textContent);
        console.log("Data loaded.", exercises);
    } catch (e) {
        console.error("Error loading data: ", e);
        window.exercises = [];
        window.presetWorkouts = [];
        window.completedWorkouts = [];
    }
}

/**
 * 
 * @returns void
 */
function createExerciseCharts() {
    const exercisesListDiv = document.getElementById("exercises-list-div");
    if (!exercisesListDiv) { return; }

    for (const [id, exercise] of Object.entries(window.exercises)) {
        const repsCanvas = document.getElementById(`reps-chart-${id}`);
        const weightCanvas = document.getElementById(`weight-chart-${id}`);

        const data = exercise["history"].map(entry => {
            return ({ 
                date: formatDateWOYear(entry["date"]),
                repsPerSet: entry["reps"] / entry["sets"],
                weight: entry["weight"]
            });
        });

        new Chart(repsCanvas, {
            type: "line",
            options: {
                responsive: true,
                plugins: { legend: { labels: { boxWidth: 0, boxHeight: 0 } } },
                maintainAspectRatio: false
            },
            data: {
                labels: data.map(row => row["date"]),
                datasets: [{
                    label: "Reps / Set",
                    data: data.map(row => row["repsPerSet"]),
                    backgroundColor: "hsl(117, 66%, 45%)",
                    borderColor: "hsl(117, 66%, 45%)"
                }]
            }
        });

        new Chart(weightCanvas, {
            type: "line",
            options: {
                responsive: true,
                plugins: { legend: { labels: { boxWidth: 0, boxHeight: 0 } } },
                maintainAspectRatio: false
            },
            data: {
                labels: data.map(row => row["date"]),
                datasets: [{
                    label: "Weight (kg)",
                    data: data.map(row => row["weight"]),
                    backgroundColor: "hsl(20, 71%, 53%)",
                    borderColor: "hsl(20, 71%, 53%)"
                }]
            }
        });
    }
}

/**
 * Creates 3 exercise fields for the "Custom workout"-section
 */
function createCustomWorkoutFields() {
    const customWorkoutDiv = document.getElementById("custom-workout-div");
    const customWorkoutButtons = document.getElementById("custom-workout-buttons");

    if (!customWorkoutDiv || !customWorkoutButtons) { return; }

    const createField = () => {
        const div = document.createElement("div");
        div.className = "exercise-div";

        customWorkoutDiv.insertBefore(div, customWorkoutButtons);

        const select = document.createElement("select");
        select.name = "exercise";

        div.appendChild(select);

        const defaultOption = document.createElement("option");
        defaultOption.textContent = "Select an exercise";
        defaultOption.disabled = true;
        defaultOption.selected = true;

        select.appendChild(defaultOption);

        for (const [id, exercise] of Object.entries(window.exercises)) {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = exercise["name"];

            select.appendChild(option);
        }

        const button = document.createElement("button");
        button.textContent = "Delete";

        button.addEventListener("click", () => {
            div.remove();
        });

        div.appendChild(button);
    };

    for (let i=0; i<3; i++) {
        createField();
    }

    const addExerciseButton = document.getElementById("custom-workout-add-exercise-button");
    
    addExerciseButton.addEventListener("click", () => {
        createField();
    });
}

let currentDate = new Date();
/**
 * 
 * @param {Number} direction Either 1 or -1 depending on which button has been clicked (Last month or Next month)
 */
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    createCalendar(currentDate.getMonth(), currentDate.getFullYear())
}

/**
 * Creates a calendar that shows all the days when a workout has been logged
 * @param {Number} monthIndex Index of the month
 * @param {Number} year Full year
 * @returns void
 */
function createCalendar(monthIndex=(new Date().getMonth()), year=(new Date).getFullYear()) {
    const calendarDiv = document.getElementById("calendar-div");
    if (!calendarDiv) { return; }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currentMonth = months[monthIndex];

    const calendarMonthSpan = document.getElementById("calendar-month-span");
    calendarMonthSpan.textContent = `${currentMonth} ${year}`;

    const calendar = document.getElementById("calendar");
    calendar.textContent = "";

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    dayNames.forEach(day => {
        const div = document.createElement("div");
        div.className = "calendar-weekday-div";
        div.textContent = day;
        calendar.appendChild(div);
    });

    let firstDay = new Date(year, monthIndex, 1).getDay();
    if (firstDay === 0) { firstDay = 7; }
    for (let i=1; i<firstDay; i++) {
        const div = document.createElement("div");
        div.className = "calendar-empty-div";
        calendar.appendChild(div);
    }
    
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    for (let i=0; i<daysInMonth; i++) {
        const div = document.createElement("div");
        div.className = "calendar-day-div";
        div.textContent = i + 1;
        if (i + 1 === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear()) { 
            div.style.background = "var(--bg-lighter)";
        }
        calendar.appendChild(div);

        const date = formatDate(new Date(year, monthIndex, i+1));
        const workouts = window.completedWorkouts.filter(workout => workout["date"] === date);

        workouts.forEach(workout => {
            const workoutDiv = document.createElement("div");
            workoutDiv.className = "calendar-workout-div";
            workoutDiv.textContent = workout["name"];
            div.appendChild(workoutDiv);
        });
    }

    let emptyDivCount = 35 - (firstDay - 1) - daysInMonth;
    if (emptyDivCount < 0) { emptyDivCount += 7; }
    for (let i=0; i<emptyDivCount; i++) {
        const div = document.createElement("div");
        div.className = "calendar-empty-div";
        calendar.appendChild(div);
    }
}

/**
 * Applies a fade-in animation to the provided element
 * @param {Element} background The element for which the fade-in animation is being applied to
 */
function showBackground(background) {
    background.style.display = "flex";
    background.style.animation = "fade-in 0.3s ease-in-out";
}

/**
 * Applies a fade-out animation to the provided element and then hides the element
 * @param {Element} background The element for which the fade-out animation is being applied to
 */
function hideBackground(background) {
    background.style.animation = "fade-out 0.3s ease-in-out";
    background.addEventListener("animationend", () => {
        background.style.display = "none";
    }, { once: true });
}


/**
 * Displays a log-workout form with the exercises that are in the preset workout
 * @param {Array} workout An array of the exercise id:s that are in the preset workout
 */
function startPresetWorkout(workout) {
    const exercisesFieldset = document.getElementsByClassName("exercises-fieldset")[0];
    exercisesFieldset.textContent = "";

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[0];
    showBackground(startEditWorkoutBackground);

    const workoutNameInput = document.createElement("input");
    workoutNameInput.type = "hidden";
    workoutNameInput.name = "name";
    workoutNameInput.value = workout["name"];
    exercisesFieldset.appendChild(workoutNameInput);

    for (const exercise of workout["exercises"]) {
        createExerciseFields(exercisesFieldset, exercise);
    }
}

/**
 * Displays a log-workout form with the exercises that are selected in the "Custom workout"-section
 */
function startCustomWorkout() {
    const exercisesFieldset = document.getElementsByClassName("exercises-fieldset")[0];
    exercisesFieldset.textContent = "";

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[0];
    showBackground(startEditWorkoutBackground);

    const selectElements = Array.from(document.querySelectorAll("select[name='exercise']"));
    const chosenExercises = selectElements
        .map(exercise => exercise.value.trim())
        .filter(exercise => exercise !== "Select an exercise");

    const chosenExercisesSet = new Set(chosenExercises);

    const workoutNameInput = document.createElement("input");
    workoutNameInput.type = "hidden";
    workoutNameInput.name = "name";
    workoutNameInput.value = "Custom workout";
    exercisesFieldset.appendChild(workoutNameInput);

    for (const exercise of chosenExercisesSet) {
        createExerciseFields(exercisesFieldset, exercise);
    }
}

/**
 * Creates fields for exercises in the log-workout form
 * @param {Element} exercisesFieldset Fieldset-element where the exercise fields are created
 * @param {String} exercise Id of the exercise
 */
function createExerciseFields(exercisesFieldset, exercise) {
    const exerciseDiv = document.createElement("div");
    exerciseDiv.name = exercise;

    const exerciseNameSpan = document.createElement("span");
    exerciseNameSpan.textContent = window.exercises[exercise]["name"];

    const deleteExerciseButton = document.createElement("button");
    deleteExerciseButton.textContent = "Delete";
    deleteExerciseButton.type = "button";
    deleteExerciseButton.style.gridColumn = 3;
    deleteExerciseButton.style.gridRow = 1;

    deleteExerciseButton.addEventListener("click", () => {
        const deleteExercise = window.confirm(`Are you sure you want to delete ${window.exercises[exercise]["name"]}?`);
        if (!deleteExercise) { return; }
        exerciseDiv.remove();
    });

    const setsInput = document.createElement("input");
    setsInput.type = "number";
    setsInput.name = `sets-${exercise}`;
    setsInput.placeholder = "Sets";
    setsInput.required = true;
    setsInput.style.gridColumn = 1;
    setsInput.style.gridRow = 2;

    const repsInput = document.createElement("input");
    repsInput.type = "number";
    repsInput.name = `reps-${exercise}`;
    repsInput.placeholder = "Reps";
    repsInput.required = true;
    repsInput.style.gridColumn = 2;
    repsInput.style.gridRow = 2;

    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.step = "0.5";
    weightInput.name = `weight-${exercise}`;
    weightInput.placeholder = "Weight";
    weightInput.required = true;
    weightInput.style.gridColumn = 3;
    weightInput.style.gridRow = 2;

    exerciseDiv.append(exerciseNameSpan, deleteExerciseButton, setsInput, repsInput, weightInput);
    exercisesFieldset.appendChild(exerciseDiv);
}

/**
 * Cancels the active workout
 * @returns void
 */
function cancelWorkout() {
    const cancel = window.confirm("Are you sure you want to cancel this workout?");
    if (!cancel) { return; }

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[0];
    hideBackground(startEditWorkoutBackground);
}

/**
 * Displays and allows the exercises in the preset workout to be edited
 * @param {Array} workout An array of the exercise id:s that are in the preset workout
 */
function editPresetWorkout(workout) {
    const exercisesFieldset = document.getElementsByClassName("exercises-fieldset")[1];
    exercisesFieldset.textContent = "";

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[1];
    showBackground(startEditWorkoutBackground);

    for (const exercise of workout["exercises"]) {
        const exerciseName = window.exercises[exercise]["name"];

        const exerciseDiv = document.createElement("div");

        const exerciseSelect = document.createElement("select");
        exerciseSelect.name = exercise;

        const exerciseDefaultOption = document.createElement("option");
        exerciseDefaultOption.value = exercise;
        exerciseDefaultOption.textContent = exerciseName;
        exerciseDefaultOption.selected = true;

        exerciseSelect.appendChild(exerciseDefaultOption);

        for (const [id, ex] of Object.entries(window.exercises)) {
            const exerciseOption = document.createElement("option");
            if (ex["name"] === exerciseName) { continue; }
            exerciseOption.value = id;
            exerciseOption.textContent = ex["name"];
            exerciseSelect.appendChild(exerciseOption);
        }

        const deleteExerciseButton = document.createElement("button");
        deleteExerciseButton.textContent = "Delete";
        deleteExerciseButton.type = "button";

        deleteExerciseButton.addEventListener("click", () => {
            const deleteExercise = window.confirm(`Are you sure you want to delete ${exerciseName}?`);
            if (!deleteExercise) { return; }
            exerciseDiv.remove();
        });

        exerciseDiv.append(exerciseSelect, deleteExerciseButton);
        exercisesFieldset.appendChild(exerciseDiv);
    }
}

/**
 * Cancels the editing of a preset workout
 * @returns void
 */
function cancelEdit() {
    const cancel = window.confirm("Are you sure you want to cancel editing?");
    if (!cancel) { return; }

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[1];
    hideBackground(startEditWorkoutBackground);
}

/**
 * Formats the given date, or todays date if no date has been given
 * @param {Object} date Date object
 * @returns Formatted date as a String
 */
function formatDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${d}.${m}.${y}`;
}


function formatDateWOYear(date) {
    const [d, m, y] = date.split(".");
    return `${d}.${m}.`;
}
