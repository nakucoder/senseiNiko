// Hamburger Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    menuToggle.classList.toggle('open');
});

// Dark Mode Toggle
const colorModeSwitch = document.getElementById('color-mode-switch');
const switchInput = document.getElementById('switch');

// Check for saved preference
const currentMode = localStorage.getItem('colorMode');
if (currentMode) {
    document.body.classList.add(currentMode);
    if (currentMode === 'dark-mode') {
        switchInput.checked = true;
    }
}

colorModeSwitch.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('colorMode', 'light-mode'); // Save preference
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('colorMode', 'dark-mode'); // Save preference
    }
});

// Dog Fetching Code (for about.html)
document.addEventListener('DOMContentLoaded', () => {
    const fetchDogButton = document.getElementById('fetch-dog');
    const dogImage = document.getElementById('dog-image');

    if (fetchDogButton && dogImage) {
        fetchDogButton.addEventListener('click', function() {
            fetch('https://dog.ceo/api/breeds/image/random')
                .then(response => response.json())
                .then(data => {
                    dogImage.src = data.message;
                    dogImage.style.display = 'block';
                })
                .catch(error => console.error('Error fetching dog image:', error));
        });
    }
});

// --- Mock Login Form Handling ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginErrorMessage = document.getElementById('login-error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // *** MOCK LOGIN - Replace with real logic later ***
            if (username === 'test' && password === 'test') {
                // Simulate a successful login
                // alert('Login successful! (Mock)'); //Removed the alert
                window.location.href = 'calendar.html'; // Redirect (create a placeholder calendar.html)
            } else {
                loginErrorMessage.textContent = 'Invalid username or password. (Mock)';
            }
        });
    }
});

// --- FullCalendar Initialization ---
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('calendar')) { // Check if the calendar element exists
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth', // Show month view by default
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay' // Add week and day views
      },
      events: [ // Example events (replace with data from your backend)
        {
          title: 'Event 1',
          start: '2023-12-01',
          allDay : true
        },
        {
          title: 'Event 2',
          start: '2023-12-05T10:00:00',
          end: '2023-12-05T12:00:00'
        },
        {
          title: 'Long Event',
          start: '2023-12-07',
          end: '2023-12-10'
        }
      ],
       //Make the calendar responsive
      aspectRatio: 1.35, // You can adjust this value
      handleWindowResize: true,
    });
    calendar.render();
  }
});

// --- Trophy Hover Effect (Smooth Transition) ---
document.addEventListener('DOMContentLoaded', () => {
    const trophies = document.querySelectorAll('.trophy');

    trophies.forEach(trophy => {
        trophy.addEventListener('mouseenter', () => {
            trophies.forEach(t => t.classList.remove('hovered'));
            trophy.classList.add('hovered');
        });

        trophy.addEventListener('mouseleave', () => {
            trophy.classList.remove('hovered');
        });
    });
});