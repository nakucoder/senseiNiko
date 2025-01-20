// Member Since
const memberSinceDate = new Date('2023-03-15'); 
document.getElementById('member-since').textContent = memberSinceDate.toDateString();

// Motivational Quote (Example - You'll likely fetch these from an API)
const quotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    // ... more quotes
];
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
document.getElementById('motivational-quote').textContent = randomQuote;

// Calendar (Basic - You'll need a library or more code for a full calendar)
// ... (Code to generate calendar with workout stickers)

// Rewards (Example - Add logic to update badges based on user progress)
// ... (Code to update badges)