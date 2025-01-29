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
  