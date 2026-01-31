// Game state
let score = 0;
let bestScore = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval = null;
let colors = [];
let targetColor = null;

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    loadBestScore();
    generateColors();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('shareBtn').addEventListener('click', shareScore);
}

function generateColors() {
    colors = [];
    for (let i = 0; i < 9; i++) {
        colors.push(generateRandomColor());
    }
    renderColorGrid();
}

function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function renderColorGrid() {
    const grid = document.getElementById('colorGrid');
    grid.innerHTML = '';
    
    // Shuffle colors
    const shuffled = [...colors].sort(function() { return Math.random() - 0.5; });
    
    shuffled.forEach(function(color) {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = color;
        box.dataset.color = color;
        box.addEventListener('click', function() {
            handleColorClick(color);
        });
        grid.appendChild(box);
    });
    
    // Set target color
    targetColor = shuffled[Math.floor(Math.random() * shuffled.length)];
    document.getElementById('targetColor').style.backgroundColor = targetColor;
}

function handleColorClick(clickedColor) {
    if (!gameActive) return;
    
    const boxes = document.querySelectorAll('.color-box');
    let clickedBox = null;
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].dataset.color === clickedColor) {
            clickedBox = boxes[i];
            break;
        }
    }
    
    if (!clickedBox) return;
    
    if (clickedColor === targetColor) {
        // Correct!
        clickedBox.classList.add('correct');
        score += 10;
        updateScore();
        showMessage('🎉 Correct! +10', 'success');
        
        setTimeout(function() {
            clickedBox.classList.remove('correct');
            generateColors();
        }, 500);
    } else {
        // Wrong!
        clickedBox.classList.add('wrong');
        score = Math.max(0, score - 5);
        updateScore();
        showMessage('❌ Wrong! -5', 'error');
        
        setTimeout(function() {
            clickedBox.classList.remove('wrong');
        }, 500);
    }
}

function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    timeLeft = 30;
    updateScore();
    updateTimer();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.textContent = '⏸ Running...';
    startBtn.disabled = true;
    document.getElementById('shareBtn').style.display = 'none';
    
    generateColors();
    showMessage('🚀 Game Started!', 'success');
    
    timerInterval = setInterval(function() {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    
    const startBtn = document.getElementById('startBtn');
    startBtn.textContent = '▶ Play Again';
    startBtn.disabled = false;
    document.getElementById('shareBtn').style.display = 'flex';
    
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
        showMessage('🏆 New Best: ' + score + '!', 'success');
    } else {
        showMessage('Game Over! Score: ' + score, 'error');
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
}

function updateTimer() {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = timeLeft;
    
    if (timeLeft <= 10) {
        timerEl.style.color = 'var(--error)';
        timerEl.style.animation = 'pulse 1s infinite';
    } else {
        timerEl.style.color = '';
        timerEl.style.animation = '';
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + (type || '');
    
    setTimeout(function() {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 2000);
}

function saveBestScore() {
    localStorage.setItem('colorMatchBest', bestScore);
}

function loadBestScore() {
    const saved = localStorage.getItem('colorMatchBest');
    if (saved) {
        bestScore = parseInt(saved);
        document.getElementById('bestScore').textContent = bestScore;
    }
}

function shareScore() {
    const gameUrl = window.location.href;
    const shareText = '🎨 I scored ' + score + ' points in Color Match! Can you beat me? 🎯\n\nPlay now: ' + gameUrl;
    
    if (navigator.share) {
        navigator.share({
            title: '🎨 Color Match - I scored ' + score + ' points!',
            text: shareText,
            url: gameUrl
        }).catch(function(err) {
            console.log('Error sharing', err);
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(function() {
            showMessage('📋 Link copied!', 'success');
        }).catch(function() {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showMessage('📋 Link copied!', 'success');
        });
    }
}

// Add pulse animation for timer
const style = document.createElement('style');
style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }';
document.head.appendChild(style);
