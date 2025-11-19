const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const workoutsPath = path.join(__dirname,"..", "data", "workouts.json");
const exercisesPath = path.join(__dirname,"..", "data", "exercises.json");

let presetWorkouts = [];
let completedWorkouts = [];
let categories = [];
let exercises = [];

function loadData() {
    try {
        const workoutData = fs.readFileSync(workoutsPath, "utf8");
        const workoutDataParsed = JSON.parse(workoutData);
        presetWorkouts = workoutDataParsed.preset_workouts || [];
        completedWorkouts = workoutDataParsed.completed_workouts || [];

        const exerciseData = fs.readFileSync(exercisesPath, "utf8");
        const exercisesDataParsed = JSON.parse(exerciseData);
        categories = exercisesDataParsed.categories || [];
        exercises = exercisesDataParsed.exercises || {};
    } catch (e) {
        console.error("Error loading data: ", e);
    }
}
loadData();

/*  ----------------------------------------------------------
 *  |                          GET                           |
 *  ----------------------------------------------------------
 */
app.get("/", (req, res) => {
    res.render("workouts", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, categoriesData: categories, exercisesData: exercises });
});

app.get("/exercises", (req, res) => {
    res.render("exercises", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, categoriesData: categories, exercisesData: exercises });
});

app.get("/calendar", (req, res) => {
    res.render("calendar", { presetWorkoutsData: presetWorkouts, completedWorkoutsData: completedWorkouts, categoriesData: categories, exercisesData: exercises });
});


/*  ----------------------------------------------------------
 *  |                         POST                           |
 *  ----------------------------------------------------------
 */
app.post("/log-workout", (req, res) => {
    const body = req.body;
    const exerciseIds = Object.keys(body)
        .filter(key => key !== "name")
        .map(key => key.split("-")[1]);
    const exerciseIdsSet = new Set(exerciseIds);

    Array.from(exerciseIdsSet).forEach(id => {
        // Exercise data
        const date = formatDate();
        const sets = Number(body[`sets-${id}`]);
        const reps = Number(body[`reps-${id}`]);
        const weight = Number(body[`weight-${id}`]);

        const entry = {
            date,
            sets,
            reps,
            weight
        };

        const exercise = exercises[id];
        if (exercise["starting_stats"]["date"] === "") { exercise["starting_stats"] = entry; }
        exercise["current_stats"] = entry;
        exercise["history"].push(entry);
    });

    // Workout data
    const workout = {
        date: formatDate(),
        name: body["name"],
        duration: "00:00:00",
        exercises: Array.from(exerciseIdsSet)
    };

    completedWorkouts.push(workout);

    // Write data to files
    fs.writeFileSync(exercisesPath, JSON.stringify({ exercises }, null, 4), 'utf8');
    fs.writeFileSync(workoutsPath, JSON.stringify({ preset_workouts: presetWorkouts, completed_workouts: completedWorkouts }, null, 4), 'utf8');

    res.redirect("calendar");
});


/*  ----------------------------------------------------------
 *  |                    HELPER FUNCTIONS                    |
 *  ----------------------------------------------------------
 */
function formatDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${d}.${m}.${y}`;
}


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
