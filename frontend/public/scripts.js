
window.addEventListener("DOMContentLoaded", () => {
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
});


function showBackground(background) {
    background.style.display = "flex";
    background.style.animation = "fade-in 0.3s ease-in-out";
}

function hideBackground(background) {
    background.style.animation = "fade-out 0.3s ease-in-out";
    background.addEventListener("animationend", () => {
        background.style.display = "none";
    }, { once: true });
}

function startPresetWorkout(workout) {
    const exercisesFieldset = document.getElementsByClassName("exercises-fieldset")[0];
    exercisesFieldset.textContent = "";

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[0];
    showBackground(startEditWorkoutBackground);

    for (const exercise of workout["exercises"]) {
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
}

function cancelWorkout() {
    const cancel = window.confirm("Are you sure you want to cancel this workout?");
    if (!cancel) { return; }

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[0];
    hideBackground(startEditWorkoutBackground);
}

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

function cancelEdit() {
    const cancel = window.confirm("Are you sure you want to cancel editing?");
    if (!cancel) { return; }

    const startEditWorkoutBackground = document.getElementsByClassName("start-edit-workout-background")[1];
    hideBackground(startEditWorkoutBackground);
}
