// scoreTimer.js

let score = 0;
let timer = 180; // 3 minutes in seconds
let timerInterval;

export function initScoreDisplay() {
    // Initialize score display
    // You can create a DOM element to display the score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.textContent = `Score: ${score}`;
    document.body.appendChild(scoreDisplay);
}

export function initTimerDisplay() {
    // Initialize timer display
    // You can create a DOM element to display the timer
    const timerDisplay = document.createElement('div');
    timerDisplay.textContent = `Time left: ${formatTime(timer)}`;
    document.body.appendChild(timerDisplay);
}

export function updateScoreDisplay() {
    // Update score display
    const scoreDisplay = document.querySelector('#score-display');
    scoreDisplay.textContent = `Score: ${score}`;
}

export function updateTimerDisplay() {
    // Update timer display
    const timerDisplay = document.querySelector('#timer-display');
    timerDisplay.textContent = `Time left: ${formatTime(timer)}`;
}

export function startTimer() {
    // Start the timer
    timerInterval = setInterval(() => {
        timer--;
        updateTimerDisplay();

        if (timer === 0) {
            gameOver();
        }
    }, 1000);
}

export function gameOver() {
    // Game over logic
    clearInterval(timerInterval);
    alert(`Game over! Your final score is ${score}`);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
