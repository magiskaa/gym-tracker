
// ----------------------------Calendar Functionality----------------------------

let currentDate = new Date();
let workouts = []; // Will be populated from the page

function generateCalendar(year, month) {
    const calendar = document.getElementById('calendar');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
    
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.background = '#333';
        dayHeader.style.color = 'white';
        dayHeader.style.padding = '10px 5px';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.fontWeight = 'bold';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.style.background = '#f8f9fa';
        calendar.appendChild(dayCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Show workouts for this day
        const dateStr = new Date(year, month, day).toLocaleDateString();
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        
        dayWorkouts.forEach(workout => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout-dot';
            workoutDiv.textContent = workout.exercise.substring(0, 8) + '...';
            dayCell.appendChild(workoutDiv);
        });
        
        calendar.appendChild(dayCell);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function loadWorkoutData() {
    // Get workout data from a hidden element in the HTML
    const workoutDataElement = document.getElementById('workout-data');
    if (workoutDataElement) {
        try {
            workouts = JSON.parse(workoutDataElement.textContent);
        } catch (e) {
            console.error('Error parsing workout data:', e);
            workouts = [];
        }
    }
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadWorkoutData();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});
