// Multiplayer Service - Using localStorage for now (can upgrade to Firebase/Supabase)
window.MultiplayerService = {
    connected: false,
    playerId: null,
    onlinePlayers: 0,
    
    init: function() {
        this.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.connect();
    },
    
    connect: function() {
        // Simulate connection
        setTimeout(function() {
            window.MultiplayerService.connected = true;
            window.MultiplayerService.onlinePlayers = Math.floor(Math.random() * 200) + 50;
            window.MultiplayerService.updateConnectionStatus(true);
            window.MultiplayerService.updatePlayerCount();
        }, 500);
        
        // Update player count periodically
        setInterval(function() {
            if (window.MultiplayerService.connected) {
                window.MultiplayerService.onlinePlayers += Math.floor(Math.random() * 5) - 2;
                window.MultiplayerService.onlinePlayers = Math.max(50, window.MultiplayerService.onlinePlayers);
                window.MultiplayerService.updatePlayerCount();
            }
        }, 5000);
    },
    
    submitScore: function(score, gameData) {
        if (!this.connected || !this.validateScore(score, gameData)) {
            return false;
        }
        
        const scoreData = {
            playerId: this.playerId,
            score: score,
            timestamp: Date.now(),
            gameData: gameData
        };
        
        this.saveScoreLocally(scoreData);
        return true;
    },
    
    validateScore: function(score, gameData) {
        if (score < 0 || score > 10000) return false;
        if (!gameData || typeof gameData !== 'object') return false;
        return true;
    },
    
    saveScoreLocally: function(scoreData) {
        let scores = JSON.parse(localStorage.getItem('globalScores') || '[]');
        scores.push(scoreData);
        
        // Keep only last 500 scores locally
        scores = scores.slice(-500);
        localStorage.setItem('globalScores', JSON.stringify(scores));
        
        if (window.updateGlobalLeaderboard) {
            window.updateGlobalLeaderboard();
        }
    },
    
    getGlobalLeaderboard: function(callback) {
        let scores = JSON.parse(localStorage.getItem('globalScores') || '[]');
        
        scores.sort(function(a, b) {
            return b.score - a.score;
        });
        
        const topScores = scores.slice(0, 10);
        
        if (callback) {
            callback(topScores);
        }
        
        return topScores;
    },
    
    updateConnectionStatus: function(connected) {
        const dot = document.getElementById('indicatorDot');
        const text = document.getElementById('connectionText');
        
        if (dot && text) {
            if (connected) {
                dot.className = 'indicator-dot connected';
                text.textContent = 'Online';
            } else {
                dot.className = 'indicator-dot';
                text.textContent = 'Offline';
            }
        }
    },
    
    updatePlayerCount: function() {
        const countEl = document.getElementById('onlineCount');
        if (countEl) {
            countEl.textContent = this.onlinePlayers;
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.MultiplayerService.init();
    });
} else {
    window.MultiplayerService.init();
}
