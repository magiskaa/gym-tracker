
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
    workoutInProgressBackground.style.display = "block";

    const exercisesFieldset = document.getElementById("exercises-fieldset");

    for (const [ index, exercise ] of workout["exercises"].entries()) {
        const exerciseLabel = document.createElement("label");
        exerciseLabel.name = exercise;

        const exerciseNameSpan = document.createElement("span");
        exerciseNameSpan.textContent = `${index+1}. ${window.exercises[exercise]["name"]}`;

        const deleteExerciseButton = document.createElement("button");
        deleteExerciseButton.textContent = "Poista";

        deleteExerciseButton.addEventListener("click", () => {
            console.log("Poista");
        });

        const repsInput = document.createElement("input");
        repsInput.type = "number";
        repsInput.name = "reps";
        repsInput.placeholder = "Reps / Set";
        repsInput.style.gridColumn = 1;
        repsInput.style.gridRow = 2;

        const weightInput = document.createElement("input");
        weightInput.type = "number";
        weightInput.name = "weight";
        weightInput.placeholder = "Weight";
        weightInput.style.gridColumn = 2;
        weightInput.style.gridRow = 2;

        exerciseLabel.append(exerciseNameSpan, deleteExerciseButton, repsInput, weightInput);
        exercisesFieldset.appendChild(exerciseLabel);
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