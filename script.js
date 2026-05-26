// Game State
let gameState = {
    currentPage: 1,
    players: [],
    currentPlayerIndex: 0,
    gameTime: 60,
    timerInterval: null,
    timeLeft: 60,
    graphics: 270,
    soundEnabled: true,
    words: [],
    currentWordIndex: 0,
    isPaused: false,
    gameStarted: false,
    wordRevealed: false,
    currentWord: '',
    timerRunning: false
};

// Kurdish words for the game
const defaultWords = [
    'ئاری گەیمینگ', 'ئاری', 'دانا عزەدین', 'ژەنیار قاتیل', 'سوورە قاتیل', 'دابان قاتیل', 'سوورە قاتیل',
    'ئەحمەد قاتیل', 'عەباس قاتیل', 'شاهۆ قاتیل', 'لاوە قاتیل', 'ئەکتەر گەیمینگ', 'ئاوات بۆکانی', 'ئۆژین نەوزاد',
    'هۆزان هەڵۆ', 'هۆزان بی ١٢', 'پێشەوا بەرزنجی', 'مستەربیست', 'مستەربین', 'حەمەکوردش',
    'زیزۆئاغا', 'حاجی جادر', 'سیروان بدر', 'زانا ڕۆشان',
    'موستەفا١٢٢', 'مانۆ١٢٢', 'مامۆستا سۆران', 'ترامپ', 'پوتین',
    'مەسعود بارزانی', 'مەسرور بارزانی', 'ئارین بارزانی', 'کاروان خەباتی', 'ڕەنجۆ', 'نێچیرڤان بارزانی',
    'هەوراز گوڵپی', 'چێنەر', 'فاخیرهەریری', 'سپید گەیمینگ', 'سپید',
    'نامۆفازیڵ', 'کریستیانۆ ڕۆناڵدۆ', 'ئێم پاپێ', 'نایماڕ', 'بەرەباف',
    'مێسی', 'ڤینی سیۆس', 'بێنزیما', 'لەمین یەماڵ', 'شاهۆ کەریم',
    'شادی کەریم', 'هەڵۆکەریم', 'حەمکۆ', 'ڕافینیا', 'بێلینگ هام',
    'کۆڕتوە', 'باڤڵ تاڵەبانی', 'ڕاجو ئاکشەی کۆمار', 'شارۆخان',
    'ئازا بێمنەت', 'لیوا دابان', 'ژیار کوردش', 'یوسف گەیمینگ',
    'حەمەڤاینەر', 'موعسین گەیمەر', 'ئەشکان ڕیڤیس', 'مستەرشکۆ',
    'ڕێژین', 'سەلمان ڤاینەر', 'مستەرمیر', 'ڕامۆکوردش',
    'قەڵای هەولێر', 'منارە', 'سلێمانی', ' هەولێر',
    ' فڕۆکەخانەی هەولێر', 'چایاخانە', 'قوتابخانە', 'کارگە',
    'یوکەی پیزا', 'مزگەوت', 'داخیلی کچان', 'پاڕکی شانەدەر',
    'گێل', 'سەرئێشە', 'سک ئێشە', 'خەواڵو',
    'پڕخەپڕخ', 'خەوتن', 'پێکەنین', 'سەگ',
    'گورگ', 'ڕێوی', 'کەروێشک', 'کێوەر',
    'پەلەوەر', 'سیسرکە', 'کۆتر', 'چۆلەکە',
    'هەنگ', 'موش', 'مار', 'کەروێشک',
    'شێر', 'پڵنگ', 'فیل', 'زەڕافە',
    'قاز', 'باز', 'کەنگر', 'بەراز',
    'پشیلە', 'سەگ', 'گورگ', 
];

// Initialize
window.onload = function() {
    loadSettings();

    setTimeout(() => {
        if (gameState.currentPage === 1) {
            goToPage(2);
        }
    }, 3000);

    // Add click sound to all buttons EXCEPT page 1
    document.querySelectorAll('button').forEach(btn => {
        const isInPage1 = btn.closest('#page1') !== null;
        if (!isInPage1) {
            btn.addEventListener('click', playClickSound);
        }
    });

    // Initialize audio context on first user interaction to bypass autoplay policy
    const initAudioOnInteraction = function() {
        if (!globalAudioContext) {
            globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (globalAudioContext.state === 'suspended') {
            globalAudioContext.resume();
        }
        // Remove listeners after first interaction
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
        document.removeEventListener('keydown', initAudioOnInteraction);
    };

    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
};

// Navigation
function goToPage(pageNum) {
    // Clear any running timer if leaving game
    if (gameState.currentPage === 4 && pageNum !== 4) {
        clearInterval(gameState.timerInterval);
        gameState.gameStarted = false;
        gameState.isPaused = false;
        // Hide any open modals
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('gameOver').classList.remove('active');
    }

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById('page' + pageNum);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    gameState.currentPage = pageNum;

    if (pageNum === 3) {
        initPlayerSetup();
    } else if (pageNum === 4) {
        initGame();
    } else if (pageNum === 5) {
        initPage5();
    } else if (pageNum === 6) {
        // Page 6 tutorial - no special init needed
    }

    // Play sound only if not page 1
    if (pageNum !== 1) {
        playClickSound();
    }
}

// Sound Functions - with fallback beep
function playClickSound() {
    if (!gameState.soundEnabled) return;

    const sound = document.getElementById('clickSound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().then(() => {
            console.log('Click sound played!');
        }).catch(e => {
            console.log('Click sound file error, using beep');
            playBeep(800, 0.1);
        });
    } else {
        playBeep(800, 0.1);
    }
}

// Web Audio API Beep
function playBeep(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.3;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch(err) {
        console.log('Beep error:', err);
    }
}

// Global audio context for reuse (avoids autoplay policy issues)
let globalAudioContext = null;

function getAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
    }
    return globalAudioContext;
}

// Play synthesized BOMB explosion sound using Web Audio API
function playExplosionSound() {
    if (!gameState.soundEnabled) return;

    try {
        const audioContext = getAudioContext();
        const now = audioContext.currentTime;

        // ===== BOMB BOOM - Sharp attack, fast decay =====

        // 1. Sharp noise burst (the initial "BOOM")
        const bufferSize = audioContext.sampleRate * 0.5; // 0.5 seconds
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter - starts high then drops fast for "BOOM" effect
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        // Sharp envelope - LOUD attack, fast decay
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.5, now + 0.02); // Sharp attack
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8); // Fast decay

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        noise.start(now);
        noise.stop(now + 0.8);

        // 2. Deep sine wave for the "thump" body
        const thump = audioContext.createOscillator();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(80, now);
        thump.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        const thumpGain = audioContext.createGain();
        thumpGain.gain.setValueAtTime(0, now);
        thumpGain.gain.linearRampToValueAtTime(1.2, now + 0.03);
        thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        thump.connect(thumpGain);
        thumpGain.connect(audioContext.destination);

        thump.start(now);
        thump.stop(now + 0.6);

        // 3. Sawtooth for crunch/distortion layer
        const crunch = audioContext.createOscillator();
        crunch.type = 'sawtooth';
        crunch.frequency.setValueAtTime(200, now);
        crunch.frequency.exponentialRampToValueAtTime(60, now + 0.2);

        const crunchGain = audioContext.createGain();
        crunchGain.gain.setValueAtTime(0, now);
        crunchGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        // Highpass to keep it crunchy
        const crunchFilter = audioContext.createBiquadFilter();
        crunchFilter.type = 'highpass';
        crunchFilter.frequency.value = 800;

        crunch.connect(crunchFilter);
        crunchFilter.connect(crunchGain);
        crunchGain.connect(audioContext.destination);

        crunch.start(now);
        crunch.stop(now + 0.3);

        console.log('💣 BOOM! Bomb sound played!');
    } catch(e) {
        console.log('Explosion sound error:', e);
        playBeep(150, 0.3);
    }
}

// Player Setup
function initPlayerSetup() {
    const list = document.getElementById('playersList');
    list.innerHTML = '';

    // Start with 2 players
    for (let i = 0; i < 2; i++) {
        addPlayerInput(i + 1);
    }

    // Add input event listeners to check fields
    setTimeout(() => {
        document.querySelectorAll('.player-name').forEach(input => {
            input.addEventListener('input', checkAllFieldsFilled);
        });
    }, 100);
}

function addPlayerInput(num) {
    const list = document.getElementById('playersList');
    const div = document.createElement('div');
    div.className = 'player-input';
    div.innerHTML = `
        <input type="text" class="kurdish-font player-name" placeholder="ناوی یاریزان ${num}" maxlength="20">
        <button class="remove-btn" onclick="removePlayer(this)">✕</button>
    `;
    list.appendChild(div);

    // Add input event listener to new input
    const newInput = div.querySelector('.player-name');
    if (newInput) {
        newInput.addEventListener('input', checkAllFieldsFilled);
    }
}

function addPlayer() {
    const inputs = document.querySelectorAll('.player-input');
    if (inputs.length >= 4) {
        showError('ناتوانرێت زیاتر لە ٤ یاریزان بن!');
        return;
    }
    addPlayerInput(inputs.length + 1);
    playClickSound();
    checkAllFieldsFilled();
}

function removePlayer(btn) {
    const inputs = document.querySelectorAll('.player-input');
    if (inputs.length <= 1) {
        showError('کەمترین ١ یاریزان دەبێت!');
        return;
    }
    btn.parentElement.remove();
    playClickSound();
}

function showError(msg) {
    const errorEl = document.getElementById('playerError');
    errorEl.className = 'error-text kurdish-font';
    errorEl.textContent = msg;
    setTimeout(() => {
        errorEl.textContent = '';
    }, 3000);
}

function showFillError(msg) {
    const errorEl = document.getElementById('playerError');
    errorEl.className = 'error-text kurdish-font fill-error';
    errorEl.textContent = msg;
}

function clearFillError() {
    const errorEl = document.getElementById('playerError');
    errorEl.className = 'error-text kurdish-font';
    errorEl.textContent = '';
}

function checkAllFieldsFilled() {
    const inputs = document.querySelectorAll('.player-name');
    let allFilled = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
        }
    });

    if (allFilled && inputs.length > 0) {
        clearFillError();
    }
}

function startGame() {
    const inputs = document.querySelectorAll('.player-name');
    const players = [];
    let emptyFields = false;

    inputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            players.push(name);
        } else {
            emptyFields = true;
        }
    });

    // Check if any field is empty
    if (emptyFields) {
        showFillError('تکایە بۆشاییەکان پڕ بکەرەوە!');
        return;
    }

    if (players.length < 1) {
        showError('کەمترین ١ یاریزان دەبێت!');
        return;
    }

    if (players.length > 4) {
        showError('زیاترین ٤ یاریزان دەبێت!');
        return;
    }

    gameState.players = players;
    gameState.currentPlayerIndex = 0;
    gameState.words = [...defaultWords].sort(() => Math.random() - 0.5);
    gameState.currentWordIndex = 0;

    goToPage(4);
}

// ============================================
// ڕاوبۆچوون - Feedback Functions
// ============================================
function submitFeedback() {
    const nameInput = document.getElementById('feedbackName');
    const messageInput = document.getElementById('feedbackMessage');
    const errorEl = document.getElementById('feedbackMiniError');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    // Check if fields are empty
    if (!name && !message) {
        errorEl.textContent = '✗ بۆشاییەکان پڕبکەوە!';
        errorEl.style.color = '#e74c3c';
        return;
    }

    if (!name || !message) {
        errorEl.textContent = '✗ بۆشایی تەواو پڕبکەوە!';
        errorEl.style.color = '#e74c3c';
        return;
    }

    // Clear error
    errorEl.textContent = '';
    errorEl.style.color = '';

    // Send to Telegram
    sendToTelegram(name, message);
}

function sendToTelegram(name, message) {
    const errorEl = document.getElementById('feedbackMiniError');

    // Get config from HTML
    const config = document.getElementById('telegramConfig');
    if (!config) {
        errorEl.textContent = '⚠️ ڕێکخستنی تیلیگرام نەدۆزرایەوە!';
        errorEl.style.color = '#e74c3c';
        return;
    }

    const token = config.getAttribute('data-token');
    const chatId = config.getAttribute('data-chatid');

    // Check if configured
    if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
        errorEl.textContent = '⚠️ تۆکنی بۆت دانەنراوە!';
        errorEl.style.color = '#e74c3c';
        return;
    }

    if (!chatId || chatId === 'YOUR_CHAT_ID_HERE') {
        errorEl.textContent = '⚠️ چات ئایدی دانەنراوە!';
        errorEl.style.color = '#e74c3c';
        return;
    }

    // Show sending status
    errorEl.textContent = '⌲ ناردن...';
    errorEl.style.color = '#3498db';

    const text = `📩 نامەی نوێ!\n\n👤 ناو: ${name}\n📝 نامە: ${message}\n📅 کات: ${new Date().toLocaleString()}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.ok) {
            console.log('✓ Message sent to Telegram!');
            errorEl.textContent = '✓ نامەکە نێردرا!';
            errorEl.style.color = '#2ecc71';
            // Clear fields after 2 seconds
            setTimeout(() => {
                document.getElementById('feedbackName').value = '';
                document.getElementById('feedbackMessage').value = '';
                errorEl.textContent = '';
                errorEl.style.color = '';
            }, 2000);
        } else {
            console.error('Telegram error:', data);
            errorEl.textContent = '❌ هەڵە: ' + (data.description || 'نەنێردرا');
            errorEl.style.color = '#e74c3c';
        }
    })
    .catch(error => {
        console.error('Error sending to Telegram:', error);
        errorEl.textContent = '❌ هەڵەی نێتوەرک: ' + error.message;
        errorEl.style.color = '#e74c3c';
    });
}

function initGame() {
    gameState.timeLeft = gameState.gameTime;
    gameState.isPaused = false;
    gameState.gameStarted = true;
    gameState.wordRevealed = false;
    gameState.timerRunning = false;

    updateTimerDisplay();
    showCurrentPlayer();
    showNextWord();

    // Don't start timer here - wait for revealWord()
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            updateTimerDisplay();

            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('gameTimer').textContent = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function showCurrentPlayer() {
    const player = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('currentPlayer').textContent = 'نۆرەی: ' + player;
}

function showNextWord() {
    if (gameState.currentWordIndex >= gameState.words.length) {
        gameState.words = [...defaultWords].sort(() => Math.random() - 0.5);
        gameState.currentWordIndex = 0;
    }

    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.textContent = '؟؟؟';
    wordDisplay.classList.add('hidden-word');

    gameState.currentWord = gameState.words[gameState.currentWordIndex];
    gameState.wordRevealed = false;

    const revealBtn = document.getElementById('revealBtn');
    revealBtn.style.display = 'block';
    revealBtn.querySelector('.button-text').textContent = '𓁹 کەشف';
    revealBtn.disabled = false;
}

function revealWord() {
    if (gameState.wordRevealed) return;

    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.textContent = gameState.currentWord;
    wordDisplay.classList.remove('hidden-word');

    gameState.wordRevealed = true;

    const revealBtn = document.getElementById('revealBtn');
    revealBtn.style.display = 'none';

    // Start timer only after reveal is clicked
    if (!gameState.timerRunning) {
        gameState.timerRunning = true;
        startTimer();
    }

    playClickSound();
}

function nextPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.currentWordIndex++;

    showCurrentPlayer();
    showNextWord();
}

function pauseGame() {
    gameState.isPaused = true;
    document.getElementById('pauseMenu').classList.add('active');
    playClickSound();
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseMenu').classList.remove('active');
    playClickSound();
}

function restartGame() {
    clearInterval(gameState.timerInterval);
    document.getElementById('pauseMenu').classList.remove('active');
    document.getElementById('gameOver').classList.remove('active');

    // Reset game state
    gameState.timeLeft = gameState.gameTime;
    gameState.currentPlayerIndex = 0;
    gameState.currentWordIndex = 0;
    gameState.isPaused = false;
    gameState.gameStarted = true;
    gameState.wordRevealed = false;
    gameState.timerRunning = false;

    // Reshuffle words
    gameState.words = [...defaultWords].sort(() => Math.random() - 0.5);

    // Update display
    updateTimerDisplay();
    showCurrentPlayer();
    showNextWord();

    // Don't start timer - wait for revealWord()

    playClickSound();
    console.log('Game restarted!');
}

function quitToPlayers() {
    clearInterval(gameState.timerInterval);
    document.getElementById('pauseMenu').classList.remove('active');
    goToPage(3);
}

function quitToMainMenu() {
    clearInterval(gameState.timerInterval);
    document.getElementById('gameOver').classList.remove('active');

    // Reset game state completely
    gameState.timeLeft = gameState.gameTime;
    gameState.currentPlayerIndex = 0;
    gameState.currentWordIndex = 0;
    gameState.isPaused = false;
    gameState.gameStarted = false;
    gameState.wordRevealed = false;

    // Go to main menu (page 2)
    goToPage(2);
}

function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.gameStarted = false;
    gameState.isPaused = false;

    // Play explosion sound IMMEDIATELY when timer hits zero
    playExplosionSound();

    // Show game over screen
    const loser = gameState.players[gameState.currentPlayerIndex];
    const loserDisplay = document.getElementById('loserDisplay');
    const gameOverModal = document.getElementById('gameOver');

    if (loserDisplay) {
        loserDisplay.textContent = loser + ' بردیەوە!';
    }
    if (gameOverModal) {
        gameOverModal.classList.add('active');
    }

    console.log('Game Over! Loser:', loser);
}

// Settings Functions
function setGraphics(level) {
    gameState.graphics = level;

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        const img = page.querySelector('.background-container img');
        if (img) {
            if (level === 144) {
                img.style.imageRendering = 'pixelated';
                img.style.filter = 'contrast(1.2) saturate(0.8)';
            } else if (level === 270) {
                img.style.imageRendering = 'auto';
                img.style.filter = 'none';
            } else if (level === 400) {
                img.style.imageRendering = 'auto';
                img.style.filter = 'contrast(1.1) saturate(1.2) brightness(1.1)';
            }
        }
    });

    saveSettings();
    playClickSound();

    document.querySelectorAll('.graphics-options .old-button').forEach(btn => {
        btn.style.opacity = '0.6';
    });
    event.target.closest('.old-button').style.opacity = '1';
}

function setGameTime(minutes) {
    gameState.gameTime = minutes * 60;
    saveSettings();
    playClickSound();

    document.querySelectorAll('.time-options .old-button').forEach(btn => {
        btn.style.opacity = '0.6';
    });
    event.target.closest('.old-button').style.opacity = '1';
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (btn) {
        btn.querySelector('.button-text').textContent = gameState.soundEnabled ? '✓ چالاکە' : '✗ ناچالاکە';
    }
    saveSettings();
    playClickSound();
}

// Local Storage
function saveSettings() {
    const settings = {
        graphics: gameState.graphics,
        gameTime: gameState.gameTime,
        soundEnabled: gameState.soundEnabled
    };
    localStorage.setItem('pembilSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('pembilSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        gameState.graphics = settings.graphics || 270;
        gameState.gameTime = settings.gameTime || 60;
        gameState.soundEnabled = settings.soundEnabled !== false;
    }

    updateSettingsUI();
}

function updateSettingsUI() {
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
        soundBtn.querySelector('.button-text').textContent = 
            gameState.soundEnabled ? '✓ چالاکە' : '✗ ناچالاکە';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (gameState.currentPage === 4 && !gameState.isPaused) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            revealWord();
        }
    }

    if (e.code === 'Escape') {
        if (gameState.currentPage === 4 && gameState.gameStarted) {
            if (gameState.isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', function(e) {
    if (gameState.currentPage === 4) {
        e.preventDefault();
    }
});

// ============================================
// Page 5 - Tab Switching Functions
// ============================================

function showTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected panel
    const selectedPanel = document.getElementById('panel-' + tabName);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
    }

    // Activate selected tab button
    const selectedTab = document.getElementById('tab-' + tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    playClickSound();
}

// Initialize page 5 - show settings tab by default
function initPage5() {
    showTab('settings');
}

// Handle visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden && gameState.currentPage === 4 && gameState.gameStarted && !gameState.isPaused) {
        pauseGame();
    }
});