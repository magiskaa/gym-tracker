const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Set EJS as our template engine
app.set('view engine', 'ejs');

// Serve static files from public folder
app.use(express.static('public'));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Simple in-memory storage (will reset when server restarts)
let workouts = [];
let exercises = [];

// Path to the exercises JSON file
const exercisesPath = path.join(__dirname, 'data', 'exercises.json');

// Function to load exercises from JSON file
function loadExercises() {
  try {
    const data = fs.readFileSync(exercisesPath, 'utf8');
    const parsedData = JSON.parse(data);
    exercises = parsedData.exercises || [];
  } catch (error) {
    console.error('Error loading exercises:', error);
    exercises = []; // fallback to empty array
  }
}

// Load exercises when server starts
loadExercises();


// Simple route to show the main page
app.get('/', (req, res) => {
  res.render('index', { workouts: workouts, exercises: exercises });
});

// Calendar route
app.get('/calendar', (req, res) => {
  res.render('calendar', { workouts: workouts, exercises: exercises });
});

// Exercises route
app.get('/exercises', (req, res) => {
  res.render('exercises' , { workouts: workouts, exercises: exercises });
})

app.post('/add-exercise', (req, res) => {
  const { exercise, category } = req.body;
  const newExercise = {
    name: exercise,
    category: category,
    starting_stats: {
      date: "",
      sets: 0,
      reps: 0,
      weight: 0
    },
    current_stats: {
      date: "",
      sets: 0,
      reps: 0,
      weight: 0
    },
    journey: []
  };

  // Add to in-memory array
  exercises.push(newExercise);

  // Save to JSON file
  fs.writeFileSync(exercisesPath, JSON.stringify({ exercises }, null, 2), 'utf8');

  res.redirect('/exercises');
})

// Handle adding new workouts
app.post('/add-workout', (req, res) => {
  const { exercise, sets, reps, weight } = req.body;
  
  const newWorkout = {
    exercise: exercise,
    sets: parseInt(sets),
    reps: parseInt(reps),
    weight: parseFloat(weight) || 0,
    date: new Date().toLocaleDateString()
  };
  
  workouts.push(newWorkout);
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});