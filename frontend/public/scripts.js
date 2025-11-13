
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

function startPresetWorkout(workout) {
    console.log(workout);

    const workoutInProgressBackground = document.getElementById("workout-in-progress-background")
    workoutInProgressBackground.style.display = "flex";

    const exercisesFieldset = document.getElementById("exercises-fieldset");

    for (const exercise of workout["exercises"]) {
        const exerciseDiv = document.createElement("div");
        exerciseDiv.name = exercise;

        const exerciseNameSpan = document.createElement("span");
        exerciseNameSpan.textContent = window.exercises[exercise]["name"];

        const deleteExerciseButton = document.createElement("button");
        deleteExerciseButton.textContent = "Poista";
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

    const workoutInProgressBackground = document.getElementById("workout-in-progress-background")
    workoutInProgressBackground.style.display = "none";

    const exercisesFieldset = document.getElementById("exercises-fieldset");
    exercisesFieldset.textContent = "";
}