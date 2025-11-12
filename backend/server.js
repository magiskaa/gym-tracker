const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));
app.use(express.urlencoded({ extended: true }));

const workoutsPath = path.join(__dirname,"..", "data", "workouts.json");
const exercisesPath = path.join(__dirname,"..", "data", "exercises.json");

let presetWorkouts = [];
let completedWorkouts = [];
let exercises = [];

function loadData() {
    try {
        const workoutData = fs.readFileSync(workoutsPath, "utf8");
        const workoutDataParsed = JSON.parse(workoutData);
        presetWorkouts = workoutDataParsed.preset_workouts || [];
        completedWorkouts = workoutDataParsed.completedWorkouts || [];

        const exerciseData = fs.readFileSync(exercisesPath, "utf8");
        const exercisesDataParsed = JSON.parse(exerciseData);
        exercises = exercisesDataParsed.exercises || [];
    } catch (e) {
        console.error("Error loading data: ", e);
    }
}
loadData();

app.get("/", (req, res) => {
    res.render("workouts", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, exercisesData: exercises });
});

app.get("/exercises", (req, res) => {
    res.render("exercises", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, exercisesData: exercises });
});

app.get("/calendar", (req, res) => {
    res.render("calendar", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, exercisesData: exercises });
});

app.get("/workout", (req, res) => {
    res.render("workout-in-progress", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, exercisesData: exercises });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
