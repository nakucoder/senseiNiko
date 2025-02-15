// Dark Mode Toggle Functions
const toggleDarkMode = () => {
    const root = document.querySelector('html');
    root.classList.toggle('dark');
  }
  
  // Update local storage value for colorScheme
  const toggleColorScheme = () => {
    const colorScheme = localStorage.getItem('colorScheme');
    if (colorScheme === 'light') localStorage.setItem('colorScheme', 'dark');
    else localStorage.setItem('colorScheme', 'light');
  }
  
  // Set toggle input handler
  const toggle = document.querySelector('#color-mode-switch input[type="checkbox"]');
  if (toggle) toggle.onclick = () => {
    toggleDarkMode();
    toggleColorScheme();
  }
  
  // Check for color scheme on init
  const checkColorScheme = () => {
    const colorScheme = localStorage.getItem('colorScheme');
    // Default to light for first view
    if (colorScheme === null || colorScheme === undefined) localStorage.setItem('colorScheme', 'light');
    // If previously saved to dark, toggle switch and update colors
    if (colorScheme === 'dark') {
      toggle.checked = true;
      toggleDarkMode();
    }
  }
  checkColorScheme();
  
  // Member Since
  const memberSinceDate = new Date('2023-03-15'); 
  document.getElementById('member-since').textContent = memberSinceDate.toDateString();
  
  // Motivational Quote (Example - You'll likely fetch these from an API)
  const quotes = [
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      "Hard work beats talent when talent doesn’t work hard.",
      // Add more quotes as needed
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('motivational-quote').textContent = randomQuote;
  
  // Calendar Generation
  function generateCalendar(year, month) {
      const calendarBody = document.querySelector('.calendar tbody');
      calendarBody.innerHTML = ''; // Clear previous calendar
  
      const date = new Date(year, month - 1); // Month is 0-indexed
      const firstDay = (new Date(year, month - 1)).getDay(); 
      const daysInMonth = 32 - new Date(year, month - 1, 32).getDate();
  
      let dateCounter = 1;
      for (let i = 0; i < 6; i++) { 
          const row = calendarBody.insertRow();
          for (let j = 0; j < 7; j++) { 
              const cell = row.insertCell();
              if (i === 0 && j < firstDay) {
                  // Leave cells before the first day empty
                  cell.textContent = '';
              } else if (dateCounter > daysInMonth) {
                  // Stop adding days after the end of the month
                  break;
              } else {
                  cell.textContent = dateCounter;
                  dateCounter++;
              }
          }
      }
  }
  
  // Initial call to generate the current month's calendar
  const today = new Date();
  generateCalendar(today.getFullYear(), today.getMonth() + 1);
  


// Generate the calendar

// Initialize the current date
const calendarTable = document.querySelector('.calendar table tbody');
let currentDate = new Date();

// Render the calendar for the current month
function renderCalendar() {
    // Get the first day of the month and number of days in the month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Clear the previous calendar
    calendarTable.innerHTML = '';

    // Create the table rows for the calendar
    let row = document.createElement('tr');
    
    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        row.appendChild(document.createElement('td'));
    }

    // Add the days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendarTable.appendChild(row);
            row = document.createElement('tr');
        }

        const cell = document.createElement('td');
        cell.textContent = day;
        cell.addEventListener('click', () => alert(`You selected: ${currentDate.getMonth() + 1}/${day}/${currentDate.getFullYear()}`)); // Simple click event for selecting a date
        row.appendChild(cell);
    }

    // Append the last row if it has any remaining cells
    if (row.children.length > 0) {
        calendarTable.appendChild(row);
    }

    // Update the header to reflect the current month
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

// CSS code moved to style.css