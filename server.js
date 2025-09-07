const { name } = require('ejs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

// Set EJS as our template engine
app.set('view engine', 'ejs');

app.set('trust proxy', true);

// Serve static files from public folder
app.use(express.static('public', {
  setHeaders: function (res, path, stat) {
    // Prevent caching of CSS and JS files
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Simple in-memory storage (will reset when server restarts)
let preset_workouts = [];
let completed_workouts = [];
let exercises = [];
let submittedExercises = [];
let workoutName = '';
let nutrition = [];
let food_list = [];

// Path to the exercises JSON file
const exercisesPath = path.join(__dirname, 'data', 'exercises.json');

// Path to the workouts JSON file
const workoutsPath = path.join(__dirname, 'data', 'workouts.json');

// Path to the nutrition JSON file
const nutritionPath = path.join(__dirname, 'data', 'nutrition.json');

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

function loadNutrition() {
  try {
    const data = fs.readFileSync(nutritionPath, 'utf8');
    const parsedData = JSON.parse(data);
    nutrition = parsedData.nutrition || [];
    food_list = parsedData.food_list || [];
  } catch (error) {
    console.error('Error loading nutrition:', error);
    nutrition = []; // fallback to empty array
    food_list = []; // fallback to empty array
  }
}
// Load nutrition when server starts
loadNutrition();


// =============================================== GET ============================================

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

// Nutrition route
app.get('/nutrition', (req, res) => {
  res.render('nutrition' , { nutrition: nutrition, food_list: food_list });
})

// Workout route
app.get('/workout', (req, res) => {
  res.render('workout', { workouts: completed_workouts, exercises: exercises, submittedExercises: submittedExercises });
});


// Format date to DD.MM.YYYY
function formatDate(d) {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// =============================================== POST ============================================

// Handle adding a new exercise
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
        date: formatDate(new Date()),
        sets: exerciseData.sets,
        reps: exerciseData.reps / exerciseData.sets,
        weight: exerciseData.weight
      });
      // Update current stats
      exercise.current_stats = {
        date: formatDate(new Date()),
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
    date: formatDate(new Date()),
    exercises: exercisesData
  };

  completed_workouts.push(newWorkout);

  fs.writeFileSync(workoutsPath, JSON.stringify({ preset_workouts, completed_workouts }, null, 2), 'utf8');

  fs.writeFileSync(exercisesPath, JSON.stringify({ exercises }, null, 2), 'utf8');

  res.redirect('/calendar');
});

app.post('/update-exercises', express.json(), (req, res) => {
  const { exercises: updatedExercises } = req.body;
  if (Array.isArray(updatedExercises)) {
    submittedExercises = updatedExercises;
    res.status(200).send('Exercises updated');
  } else {
    res.status(400).send('Invalid exercises data');
  }
});

// Handle deleting workout in progress
app.post('/delete-workout', (req, res) => {
  // Clear the submitted exercises and workout name
  submittedExercises = [];
  workoutName = '';
  
  res.redirect('/');
});

app.post('/add-custom', (req, res) => {
  const calories = parseInt(req.body.calories);
  const protein = parseInt(req.body.protein);
  if(!isNaN(calories) && !isNaN(protein)) {
    nutrition.calories += calories;
    nutrition.protein += protein;
    nutrition.foods.push({
      name: 'Custom',
      calories: calories,
      protein: protein
    });
    fs.writeFileSync(nutritionPath, JSON.stringify({ nutrition }, null, 2), 'utf8');
  }
  res.redirect('/nutrition');
});

app.post('/add-food', (req, res) => {
  const foodName = req.body.name;
  const foodCalories = parseInt(req.body.calories);
  const foodProtein = parseInt(req.body.protein);

  if (foodName && !isNaN(foodCalories) && !isNaN(foodProtein)) {
    nutrition.calories += foodCalories;
    nutrition.protein += foodProtein;
    nutrition.foods.push({
      name: foodName,
      calories: foodCalories,
      protein: foodProtein
    });
    fs.writeFileSync(nutritionPath, JSON.stringify({ nutrition, food_list }, null, 2), 'utf8');
  }
  res.redirect('/nutrition');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});