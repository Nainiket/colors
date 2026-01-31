// Game state
let score = 0;
let bestScore = 0;
let timeLeft = 30;
let gameActive = false;
let timerInterval = null;
let colors = [];
let targetColor = null;

// Game tracking for security
let gameStartTime = null;
let clickCount = 0;
let correctClicks = 0;

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    loadBestScore();
    generateColors();
    setupEventListeners();
    setupModals();
    updateGlobalLeaderboard();
    updateLocalLeaderboard();
    
    // Update global leaderboard every 5 seconds
    setInterval(updateGlobalLeaderboard, 5000);
});

function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('shareBtn').addEventListener('click', showShareModal);
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboardModal);
    document.getElementById('closeLeaderboard').addEventListener('click', hideLeaderboardModal);
    document.getElementById('closeShare').addEventListener('click', hideShareModal);
    
    // Leaderboard tabs
    document.querySelectorAll('.modal-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            document.querySelectorAll('.modal-tab').forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            document.querySelectorAll('.leaderboard-content').forEach(function(content) {
                content.classList.remove('active');
            });
            
            if (tabName === 'global') {
                document.getElementById('globalLeaderboard').classList.add('active');
            } else {
                document.getElementById('localLeaderboard').classList.add('active');
            }
        });
    });
    
    // Share buttons
    setupShareButtons();
    
    // Close modals on overlay click
    document.getElementById('leaderboardModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideLeaderboardModal();
        }
    });
    
    document.getElementById('shareModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideShareModal();
        }
    });
}

function setupModals() {
    // Modal functionality
}

function showLeaderboardModal() {
    document.getElementById('leaderboardModal').classList.add('active');
    updateGlobalLeaderboard();
    updateLocalLeaderboard();
}

function hideLeaderboardModal() {
    document.getElementById('leaderboardModal').classList.remove('active');
}

function showShareModal() {
    document.getElementById('shareScoreValue').textContent = score;
    document.getElementById('shareModal').classList.add('active');
    updateShareLinks();
}

function hideShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

function setupShareButtons() {
    const gameUrl = 'https://friday-night-colors.netlify.app/';
    
    document.getElementById('copyShare').addEventListener('click', function() {
        const shareText = '🎨 I scored ' + score + ' points in Color Match! Can you beat me? 🎯\n\nPlay now: ' + gameUrl;
        copyToClipboard(shareText);
    });
}

function updateShareLinks() {
    const gameUrl = 'https://friday-night-colors.netlify.app/';
    const shareText = '🎨 I scored ' + score + ' points in Color Match! Can you beat me? 🎯\n\nPlay now: ' + gameUrl;
    const twitterText = encodeURIComponent('🎨 I scored ' + score + ' points in Color Match! Can you beat me? 🎯\n\nPlay now: ' + gameUrl);
    
    document.getElementById('twitterShare').href = 'https://twitter.com/intent/tweet?text=' + twitterText;
    document.getElementById('facebookShare').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(gameUrl);
    document.getElementById('whatsappShare').href = 'https://wa.me/?text=' + encodeURIComponent(shareText);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showMessage('📋 Link copied to clipboard!', 'success');
        hideShareModal();
    }).catch(function() {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showMessage('📋 Link copied to clipboard!', 'success');
        hideShareModal();
    });
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
    
    clickCount++;
    
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
        correctClicks++;
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
    clickCount = 0;
    correctClicks = 0;
    gameStartTime = Date.now();
    
    updateScore();
    updateTimer();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-label">Running...</span>';
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
    
    const gameDuration = Date.now() - gameStartTime;
    
    // Validate and submit score
    if (validateGameScore(score, gameDuration, clickCount, correctClicks)) {
        if (window.MultiplayerService && window.MultiplayerService.connected) {
            window.MultiplayerService.submitScore(score, {
                duration: gameDuration,
                clicks: clickCount,
                correct: correctClicks,
                timestamp: Date.now()
            });
        }
    }
    
    const startBtn = document.getElementById('startBtn');
    startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-label">Play Again</span>';
    startBtn.disabled = false;
    document.getElementById('shareBtn').style.display = 'flex';
    
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
        showMessage('🏆 New Best: ' + score + '!', 'success');
    } else {
        showMessage('Game Over! Score: ' + score, 'error');
    }
    
    updateGlobalRank();
    updateGlobalLeaderboard();
    updateLocalLeaderboard();
}

function validateGameScore(finalScore, duration, clicks, correct) {
    if (duration < 25000 || duration > 35000) return false;
    if (finalScore > 600) return false;
    if (clicks > 100) return false;
    return true;
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
    messageEl.className = 'game-feedback ' + (type || '');
    
    setTimeout(function() {
        messageEl.textContent = '';
        messageEl.className = 'game-feedback';
    }, 2000);
}

function saveBestScore() {
    localStorage.setItem('colorMatchBest', bestScore);
    updateLocalLeaderboard();
}

function loadBestScore() {
    const saved = localStorage.getItem('colorMatchBest');
    if (saved) {
        bestScore = parseInt(saved);
        document.getElementById('bestScore').textContent = bestScore;
    }
}

function updateLocalLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('colorMatchLeaderboard') || '[]');
    
    if (!gameActive && score > 0) {
        leaderboard.push({
            score: score,
            date: new Date().toLocaleDateString()
        });
        
        leaderboard.sort(function(a, b) {
            return b.score - a.score;
        });
        
        const top5 = leaderboard.slice(0, 5);
        localStorage.setItem('colorMatchLeaderboard', JSON.stringify(top5));
    }
    
    const finalLeaderboard = JSON.parse(localStorage.getItem('colorMatchLeaderboard') || '[]');
    const listEl = document.getElementById('localLeaderboardList');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (finalLeaderboard.length === 0) {
        listEl.innerHTML = '<div class="loading-state">No scores yet. Be the first!</div>';
        return;
    }
    
    finalLeaderboard.forEach(function(entry, index) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        const rankSpan = document.createElement('span');
        rankSpan.textContent = '#' + (index + 1) + ' - ' + entry.date;
        const scoreSpan = document.createElement('span');
        scoreSpan.innerHTML = '<strong>' + entry.score + '</strong> pts';
        item.appendChild(rankSpan);
        item.appendChild(scoreSpan);
        listEl.appendChild(item);
    });
}

window.updateGlobalLeaderboard = function() {
    if (!window.MultiplayerService) return;
    
    const listEl = document.getElementById('globalLeaderboard');
    if (!listEl) return;
    
    window.MultiplayerService.getGlobalLeaderboard(function(scores) {
        listEl.innerHTML = '';
        
        if (scores.length === 0) {
            listEl.innerHTML = '<div class="loading-state">No global scores yet. Be the first!</div>';
            return;
        }
        
        scores.forEach(function(entry, index) {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (entry.playerId === window.MultiplayerService.playerId) {
                item.classList.add('your-score');
            }
            
            const rankSpan = document.createElement('span');
            rankSpan.textContent = '#' + (index + 1) + ' - Player ' + (entry.playerId ? entry.playerId.substr(7, 6) : 'Unknown');
            const scoreSpan = document.createElement('span');
            scoreSpan.innerHTML = '<strong>' + entry.score + '</strong> pts';
            item.appendChild(rankSpan);
            item.appendChild(scoreSpan);
            listEl.appendChild(item);
        });
    });
};

function updateGlobalRank() {
    if (!window.MultiplayerService) return;
    
    window.MultiplayerService.getGlobalLeaderboard(function(scores) {
        const rankEl = document.getElementById('globalRank');
        if (!rankEl) return;
        
        let rank = '#-';
        for (let i = 0; i < scores.length; i++) {
            if (scores[i].playerId === window.MultiplayerService.playerId) {
                rank = '#' + (i + 1);
                break;
            }
        }
        
        rankEl.textContent = rank;
    });
}

// Add pulse animation for timer
const style = document.createElement('style');
style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }';
document.head.appendChild(style);
