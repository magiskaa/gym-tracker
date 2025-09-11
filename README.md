# Gym Tracker

A comprehensive web-based gym workout tracker built with Node.js and Express. Track your workouts, monitor your progress, and view your fitness journey over time with interactive charts and a visual calendar.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Table of Contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Features](#features)
- [Configuration](#configuration)
- [License](#license)
- [Contact](#contact)

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/magiskaa/gym-tracker.git
   cd gym-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the server
   ```bash
   npm start
   ```

4. Open your browser
   Navigate to `http://localhost:4000`

## Project Structure

```
gym-tracker/
├── data/                   # JSON data storage
│   ├── exercises.json      # Exercise database
│   ├── workouts.json       # Completed and preset workouts
│   ├── nutrition.json      # Nutrition stats and foods list
│   └── users.json          # User data (future feature)
├── public/                 # Static assets
│   ├── scripts.js          # Client-side JavaScript
│   └── styles.css          # CSS styling
├── views/                  # EJS templates
│   ├── index.ejs           # Home page
│   ├── workout.ejs         # Active workout page
│   ├── exercises.ejs       # Exercise management
│   ├── calendar.ejs        # Calendar view
│   └── login.ejs           # Login page (future feature)
├── server.js               # Express server
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Features

### Workout Management
- **Start New Workouts**: Create custom workouts by selecting exercises
- **Live Timer**: Track workout duration with a real-time timer
- **Exercise Logging**: Record sets, reps, and weights for each exercise
- **Workout History**: View all completed workouts with detailed statistics

### Progress Tracking
- **Exercise Database**: Manage your personal exercise library with categories
- **Progress Charts**: Visual charts showing weight and reps / set progression over time
- **Starting vs Current Stats**: Compare your initial performance with current stats
- **Exercise Journey**: Detailed history of each exercise performance

### Calendar View
- **Monthly Calendar**: Visual representation of your workout schedule
- **Workout Dots**: See workout indicators on specific dates
- **Navigation**: Browse through different months to track consistency

### Nutrition Monitoring
- **Track calories and Protein**: Track your daily calorie and protein intake
- **Adding foods**: Add foods either from a food list or enter custom amount of calories and protein

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Automatic theme switching based on system preferences

## Configuration

### Data Storage
The application uses JSON files for data storage:
- **exercises.json**: Stores your exercise database with categories and progress tracking
- **workouts.json**: Contains completed workout history and preset workouts
- **nutrition.json**: Contains your nutrition stats and foods list
- **users.json**: Not yet implemented

### Customization
- **Port**: Change the port in `server.js` (default: 4000)
- **Exercise Categories**: Modify exercise categories in `server.js` (i.e. chest, legs, back)
- **Styling**: Customize colors and themes in `public/styles.css`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Valtteri Antikainen**
vantikaine@gmail.com
