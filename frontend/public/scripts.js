
window.addEventListener("DOMContentLoaded", () => {
    loadData();
    createCustomWorkoutFields();
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

        for (const [index, exercise] of Object.entries(window.exercises)) {
            const option = document.createElement("option");
            option.value = index;
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
    setsInput.style.gridColumn = 1;
    setsInput.style.gridRow = 2;

    const repsInput = document.createElement("input");
    repsInput.type = "number";
    repsInput.name = `reps-${exercise}`;
    repsInput.placeholder = "Reps";
    repsInput.style.gridColumn = 2;
    repsInput.style.gridRow = 2;

    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.step = "0.5";
    weightInput.name = `weight-${exercise}`;
    weightInput.placeholder = "Weight";
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

        for (const [index, ex] of Object.entries(window.exercises)) {
            const exerciseOption = document.createElement("option");
            if (ex["name"] === exerciseName) { continue; }
            exerciseOption.value = index;
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
