const { name } = require('ejs');
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
let preset_workouts = [];
let completed_workouts = [];
let exercises = [];
let submittedExercises = [];
let workoutName = '';

// Path to the exercises JSON file
const exercisesPath = path.join(__dirname, 'data', 'exercises.json');

// Path to the workouts JSON file
const workoutsPath = path.join(__dirname, 'data', 'workouts.json');

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

// Function to load workouts from JSON file
function loadWorkouts() {
  try {
    const data = fs.readFileSync(workoutsPath, 'utf8');
    const parsedData = JSON.parse(data);
    preset_workouts = parsedData.preset_workouts || [];
    completed_workouts = parsedData.completed_workouts || [];
  } catch (error) {
    console.error('Error loading workouts:', error);
    preset_workouts = []; // fallback to empty array
    completed_workouts = []; // fallback to empty array
  }
}
// Load workouts when server starts
loadWorkouts();

// Simple route to show the main page
app.get('/', (req, res) => {
  res.render('index', { preset_workouts: preset_workouts, workouts: completed_workouts, exercises: exercises });
});

// Calendar route
app.get('/calendar', (req, res) => {
  res.render('calendar', { workouts: completed_workouts, exercises: exercises });
});

// Exercises route
app.get('/exercises', (req, res) => {
  res.render('exercises' , { workouts: completed_workouts, exercises: exercises });
})

// Workout route
app.get('/workout', (req, res) => {
  res.render('workout', { workouts: completed_workouts, exercises: exercises, submittedExercises: submittedExercises });
});

// Handle adding a new exercise
app.post('/add-exercise', (req, res) => {
  const { exercise, category } = req.body;
  
  const validCategories = ['Rinta', 'Selkä', 'Jalat', 'Olkapäät', 'Hauis', 'Ojentajat'];
  if (!validCategories.includes(category)) {
    return res.status(400).send('Invalid category. Please select a valid category.');
  }

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

// Handle starting new workouts
app.post('/start-workout', (req, res) => {
  submittedExercises = Object.keys(req.body)
    .filter(key => key.startsWith('exercise-'))
    .map(key => req.body[key]);

  workoutName = req.body.workoutName || `Workout ${completed_workouts.length + 1}`;

  // Validate submitted exercises
  const validExerciseNames = exercises.map(e => e.name);
  const allValid = Array.isArray(submittedExercises) 
    ? submittedExercises.every(name => validExerciseNames.includes(name))
    : validExerciseNames.includes(submittedExercises);

  if (!allValid) {
    return res.status(400).send('One or more exercises are not in your list. Please add them first.');
  }
  
  res.redirect('/workout');
});

// Handle ending a workout
app.post('/end-workout', (req, res) => {
  const duration = parseInt(req.body.duration) || 0;
  const hours = String(Math.floor(duration / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');
  const workoutDuration = `${hours}:${minutes}:${secs}`;

  const indices = Object.keys(req.body)
    .filter(key => key.startsWith('exercise-'))
    .map(key => key.split('-')[1]);

  const exercisesData = indices.map(i => ({
    name: submittedExercises[i],
    sets: parseInt(req.body[`sets-${i}`], 10),
    reps: parseInt(req.body[`reps-${i}`], 10),
    weight: parseFloat(req.body[`weight-${i}`]) || 0
  }));

  // Update the journey for each exercise
  exercisesData.forEach(exerciseData => {
    const exercise = exercises.find(e => e.name === exerciseData.name);
    if (exercise) {
      exercise.journey.push({
        date: new Date().toLocaleDateString(),
        sets: exerciseData.sets,
        reps: exerciseData.reps / exerciseData.sets,
        weight: exerciseData.weight
      });
      // Update current stats
      exercise.current_stats = {
        date: new Date().toLocaleDateString(),
        sets: exerciseData.sets,
        reps: exerciseData.reps / exerciseData.sets,
        weight: exerciseData.weight
      };
      // Update starting stats if it's the first entry
      if (!exercise.starting_stats.date) {
        exercise.starting_stats = { ...exercise.current_stats };
      }
    }
  });

  // Create a new workout entry
  const newWorkout = {
    name: workoutName,
    duration: workoutDuration,
    date: new Date().toLocaleDateString(),
    exercises: exercisesData
  };

  completed_workouts.push(newWorkout);

  fs.writeFileSync(workoutsPath, JSON.stringify({ preset_workouts, completed_workouts }, null, 2), 'utf8');

  fs.writeFileSync(exercisesPath, JSON.stringify({ exercises }, null, 2), 'utf8');

  res.redirect('/calendar');
});

// Handle deleting workout in progress
app.post('/delete-workout', (req, res) => {
  // Clear the submitted exercises and workout name
  submittedExercises = [];
  workoutName = '';
  
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});