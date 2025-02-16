// Dark Mode Toggle Functions (Consolidated)
const toggleDarkMode = () => {
    const root = document.querySelector('html');
    root.classList.toggle('dark'); // Use 'dark' class consistently
}

const toggleColorScheme = () => {
    const colorScheme = localStorage.getItem('colorScheme');
    localStorage.setItem('colorScheme', colorScheme === 'light' ? 'dark' : 'light');
}

// Set toggle input handler (Only one toggle)
const darkModeToggle = document.getElementById('color-mode-switch'); // Use one ID consistently
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        toggleDarkMode();
        toggleColorScheme();
    });
}

// Check for color scheme on init
const checkColorScheme = () => {
    const colorScheme = localStorage.getItem('colorScheme');
    if (colorScheme === null || colorScheme === undefined) {
        localStorage.setItem('colorScheme', 'light');
    }
    if (colorScheme === 'dark') {
        if (darkModeToggle) darkModeToggle.checked = true;
        toggleDarkMode();
    }
}
checkColorScheme();

// Member Since
const memberSinceDate = new Date('2023-03-15');
document.getElementById('member-since').textContent = memberSinceDate.toDateString();

// Motivational Quote
const quotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Hard work beats talent when talent doesn’t work hard.",
    // Add more quotes as needed
];
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
document.getElementById('motivational-quote').textContent = randomQuote;

// Calendar Generation (Fixed potential infinite loop)
function generateCalendar(year, month) {
    const calendarBody = document.querySelector('.calendar tbody');
    calendarBody.innerHTML = ''; // Clear previous calendar

    const firstDay = new Date(year, month - 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate(); // Correct way to get days in month

    let dateCounter = 1;
    for (let i = 0; i < 6; i++) {
        const row = calendarBody.insertRow();
        for (let j = 0; j < 7; j++) {
            const cell = row.insertCell();
            if (i === 0 && j < firstDay) {
                cell.textContent = '';
            } else if (dateCounter > daysInMonth) {
                break; // Exit inner loop
            } else {
                cell.textContent = dateCounter;
                dateCounter++;
            }
        }
        if (dateCounter > daysInMonth) break; // Exit outer loop
    }
}

// Initial call to generate the current month's calendar
const today = new Date();
generateCalendar(today.getFullYear(), today.getMonth() + 1);

// Calendar Interaction (Improved and more concise)
const calendarTable = document.querySelector('.calendar table tbody');
let currentDate = new Date();

function renderCalendar() {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();

    calendarTable.innerHTML = '';

    let row = calendarTable.insertRow();
    for (let i = 0; i < firstDayOfWeek; i++) {
        row.insertCell();
    }

    let dayCounter = 1;
    while (dayCounter <= daysInMonth) {
        if (row.cells.length === 7) {
            row = calendarTable.insertRow();
        }
        const cell = row.insertCell();
        cell.textContent = dayCounter;
        cell.addEventListener('click', () => {
            alert(`You selected: ${currentDate.getMonth() + 1}/${dayCounter}/${currentDate.getFullYear()}`);
        });
        dayCounter++;
    }

    const monthYear = document.querySelector('.calendar h2');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Navigate to the previous month
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Navigate to the next month
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Initial render of the calendar
renderCalendar();

// Attach event listeners to the navigation buttons
document.querySelector('#prev-month').addEventListener('click', prevMonth);
document.querySelector('#next-month').addEventListener('click', nextMonth);

// Dark mode toggle functionality
const colorModeSwitch = document.getElementById('color-mode-switch');
if (colorModeSwitch) {
    colorModeSwitch.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// Dark mode toggle functionality
const darkModeToggleSwitch = document.getElementById("switch");
if (darkModeToggleSwitch) {
    darkModeToggleSwitch.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode", darkModeToggleSwitch.checked);
    });
}

/* Dark Mode Styles */
body.dark-mode {
    background-color: #121212;
    color: #ffffff;
}






/* Add any other dark mode styles as needed */
body.dark-mode header,
body.dark-mode .calendar table,
body.dark-mode header {
    background-color: #333;
}


body.dark-mode table, 
body.dark-mode td {
    border-color: #444;
}

body.dark-mode input[type="text"],
body.dark-mode input[type="password"],
body.dark-mode input[type="submit"] {
    background-color: #555;
    color: white;
}

body.dark-mode .menu {
    background-color: #222;
}
