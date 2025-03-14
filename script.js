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
document.addEventListener('DOMContentLoaded', () => { // Ensure DOM is loaded
  const fetchDogButton = document.getElementById('fetch-dog');
  const dogImage = document.getElementById('dog-image');

  if (fetchDogButton && dogImage) { // Check if elements exist
      fetchDogButton.addEventListener('click', function() {
          fetch('https://dog.ceo/api/breeds/image/random')
              .then(response => response.json())
              .then(data => {
                  dogImage.src = data.message;
                  dogImage.style.display = 'block'; // Use class for styling
              })
              .catch(error => console.error('Error fetching dog image:', error));
      });
  }
});