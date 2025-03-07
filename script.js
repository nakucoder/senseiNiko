// Dark Mode Toggle
const darkModeToggle = document.getElementById("switch");
const body = document.body;

darkModeToggle.addEventListener("change", () => {
    body.classList.toggle("dark-mode", darkModeToggle.checked);
    localStorage.setItem("dark-mode", darkModeToggle.checked);
});

// Check for saved dark mode preference
if (localStorage.getItem("dark-mode") === "true") {
    darkModeToggle.checked = true;
    body.classList.add("dark-mode");
}

// Motivational Quote
const quotes = [
    "You miss 100% of the shots you don’t take.",
    "The journey of a thousand miles begins with one step.",
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "It’s not whether you get knocked down, it’s whether you get up.",
    "Winners never quit and quitters never win.",
    "Persistence can change failure into extraordinary achievement.",
    "Nobody who ever gave his best regretted it.",
    "The harder the battle, the sweeter the victory.",
    "If you can believe it, the mind can achieve it.",
    "There may be people that have more talent than you, but there’s no excuse for anyone to work harder than you do.",
    "Ever tried. Ever failed. No matter. Try Again. Fail again. Fail better."
];

const quoteElement = document.getElementById("motivational-quote");
const randomIndex = Math.floor(Math.random() * quotes.length);
quoteElement.textContent = quotes[randomIndex];

// Progress Bar Animation
const progressBar = document.querySelector(".progress");
setTimeout(() => {
    progressBar.style.width = "75%"; // Example progress
}, 500);

// Custom Cursor
const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.pageX}px`;
    cursor.style.top = `${e.pageY}px`;
});

// Loading Animation
window.addEventListener("load", () => {
    const loading = document.querySelector(".loading");
    setTimeout(() => {
        loading.style.display = "none";
    }, 1000); // Simulate loading time
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});
// Parallax Scrolling Effect
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.body.style.backgroundPositionY = `-${scrollY * 0.5}px`;
});

// Dynamic Content Loading
function loadGoals() {
    const goals = ["Run 5km", "Lift 100kg", "Meditate Daily"];
    const goalsList = document.querySelector(".user-info ul");
    goalsList.innerHTML = goals.map(goal => `<li>${goal}</li>`).join("");
    goalsList.classList.add("dynamic-content");
}

function loadRewards() {
    const rewards = ["🏆", "🎖️", "🥇"];
    const badgeContainer = document.querySelector(".badge-container");
    badgeContainer.innerHTML = rewards.map(reward => `<div class="badge">${reward}</div>`).join("");
    badgeContainer.classList.add("dynamic-content");
}

// Simulate loading dynamic content
setTimeout(() => {
    loadGoals();
    loadRewards();
}, 1000);

// Animated Gradient Buttons
const buttons = document.querySelectorAll(".button-gradient");
buttons.forEach(button => {
    button.addEventListener("mousemove", (e) => {
        const rect = button.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        button.style.backgroundPosition = `${x}% ${y}%`;
    });
});
