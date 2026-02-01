// ==========================================
// Guddan's Parking Parikhya - Game Logic
// ==========================================

// Audio Context for synthesized sounds
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playHonkSound() {
    initAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playCrashSound() {
    initAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
}

function playCollectSound() {
    initAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playWinSound() {
    initAudio();
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }, i * 100);
    });
}

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gameWon = false;

// Localized messages
const MESSAGES = {
    crashGeneric: "Dhire chala!",
    crashWall: "Kan Karuchu?!",
    crashCow: "Arey! Gai ku badhei dela!",
    crashUncle: "Eita kana driving?",
    chaosStart: "Aye Bhokua!",
    chaosEnd: "Thik Achhi",
    honk: "Hato!",
    parkHere: "Eithi Rakha",
    win: "Janmadina Ra Hardhika Shubhechha!"
};

// Car state
const car = {
    x: 0,
    y: 0,
    width: 40,
    height: 60,
    angle: 0,
    velocity: 0,
    angularVelocity: 0,
    maxSpeed: 5,
    acceleration: 0.15,
    friction: 0.98,
    turnSpeed: 0.05,
    angularFriction: 0.9,
    spinning: false,
    spinTime: 0
};

// Controls
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    honk: false
};

// Chaos Mode
let chaosMode = false;
let chaosTimer = 0;
let nextChaosTime = 0;
let chaosDuration = 0;

// Collection items
const collectibles = [];
const collectedItems = {
    kitten: false,
    treat: false,
    key: false
};
let lastCollected = null;

// Obstacles
const obstacles = [];
const potholes = [];

// Bad Vibes (enemies)
const badVibes = [];

// Honk waves
const honkWaves = [];

// Parking spot
const parkingSpot = {
    x: 0,
    y: 0,
    width: 60,
    height: 80,
    locked: true
};

// Map boundaries
let mapWidth = 800;
let mapHeight = 600;

// Resize handler
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const mobileControls = document.getElementById('mobile-controls');
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    canvas.width = window.innerWidth;
    
    if (isMobile) {
        const controlsHeight = mobileControls.offsetHeight || 180;
        canvas.height = window.innerHeight - controlsHeight;
    } else {
        canvas.height = window.innerHeight;
    }
    
    mapWidth = canvas.width;
    mapHeight = canvas.height;
    
    if (!gameRunning && !gameWon) {
        initGame();
    }
}

// Initialize game
function initGame() {
    // Reset car
    car.x = mapWidth * 0.2;
    car.y = mapHeight * 0.8;
    car.angle = -Math.PI / 2;
    car.velocity = 0;
    car.angularVelocity = 0;
    car.spinning = false;
    car.spinTime = 0;
    
    // Reset collections
    collectedItems.kitten = false;
    collectedItems.treat = false;
    collectedItems.key = false;
    lastCollected = null;
    updateCollectionUI();
    
    // Reset chaos
    chaosMode = false;
    chaosTimer = 0;
    nextChaosTime = randomRange(5000, 10000);
    document.getElementById('chaos-warning').classList.add('hidden');
    
    // Clear arrays
    collectibles.length = 0;
    obstacles.length = 0;
    potholes.length = 0;
    badVibes.length = 0;
    honkWaves.length = 0;
    
    // Setup parking spot (top right area)
    parkingSpot.x = mapWidth * 0.8 - parkingSpot.width / 2;
    parkingSpot.y = mapHeight * 0.15;
    parkingSpot.locked = true;
    
    // Create collectibles
    collectibles.push({
        type: 'kitten',
        emoji: '🐱',
        x: mapWidth * 0.5,
        y: mapHeight * 0.3,
        size: 35,
        collected: false
    });
    
    collectibles.push({
        type: 'treat',
        emoji: '🍫',
        x: mapWidth * 0.3,
        y: mapHeight * 0.5,
        size: 35,
        collected: false
    });
    
    collectibles.push({
        type: 'key',
        emoji: '🔑',
        x: mapWidth * 0.7,
        y: mapHeight * 0.6,
        size: 35,
        collected: false
    });
    
    // Create obstacles
    obstacles.push({
        type: 'cow',
        emoji: '🐄',
        x: mapWidth * 0.4,
        y: mapHeight * 0.4,
        size: 50
    });
    
    obstacles.push({
        type: 'uncle',
        emoji: '👴',
        x: parkingSpot.x + 80,
        y: parkingSpot.y + 40,
        size: 45
    });
    
    // Create potholes
    for (let i = 0; i < 3; i++) {
        potholes.push({
            x: mapWidth * (0.3 + i * 0.2),
            y: mapHeight * (0.5 + Math.random() * 0.3),
            radius: 20
        });
    }
    
    // Spawn initial bad vibes
    spawnBadVibe();
    spawnBadVibe();
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function spawnBadVibe() {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    
    switch (side) {
        case 0: // Top
            x = Math.random() * mapWidth;
            y = -30;
            vx = randomRange(-1, 1);
            vy = randomRange(0.5, 1.5);
            break;
        case 1: // Right
            x = mapWidth + 30;
            y = Math.random() * mapHeight;
            vx = randomRange(-1.5, -0.5);
            vy = randomRange(-1, 1);
            break;
        case 2: // Bottom
            x = Math.random() * mapWidth;
            y = mapHeight + 30;
            vx = randomRange(-1, 1);
            vy = randomRange(-1.5, -0.5);
            break;
        case 3: // Left
            x = -30;
            y = Math.random() * mapHeight;
            vx = randomRange(0.5, 1.5);
            vy = randomRange(-1, 1);
            break;
    }
    
    badVibes.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: 35
    });
}

// Update collection UI
function updateCollectionUI() {
    document.getElementById('slot-kitten').classList.toggle('collected', collectedItems.kitten);
    document.getElementById('slot-treat').classList.toggle('collected', collectedItems.treat);
    document.getElementById('slot-key').classList.toggle('collected', collectedItems.key);
    
    parkingSpot.locked = !(collectedItems.kitten && collectedItems.treat && collectedItems.key);
}

// Show message
function showMessage(text) {
    const msgEl = document.getElementById('message-display');
    msgEl.textContent = text;
    msgEl.classList.remove('hidden');
    
    // Reset animation
    msgEl.style.animation = 'none';
    msgEl.offsetHeight; // Trigger reflow
    msgEl.style.animation = 'fadeInOut 2s forwards';
    
    setTimeout(() => {
        msgEl.classList.add('hidden');
    }, 2000);
}

// Crash handler
function handleCrash(type = 'generic') {
    playCrashSound();
    
    let message = MESSAGES.crashGeneric;
    switch (type) {
        case 'wall': message = MESSAGES.crashWall; break;
        case 'cow': message = MESSAGES.crashCow; break;
        case 'uncle': message = MESSAGES.crashUncle; break;
    }
    
    showMessage(message);
    
    // Drop last collected item
    if (lastCollected) {
        collectedItems[lastCollected] = false;
        
        // Put item back on map
        const droppedItem = collectibles.find(c => c.type === lastCollected);
        if (droppedItem) {
            droppedItem.collected = false;
            droppedItem.x = car.x + randomRange(-50, 50);
            droppedItem.y = car.y + randomRange(-50, 50);
            // Keep in bounds
            droppedItem.x = Math.max(50, Math.min(mapWidth - 50, droppedItem.x));
            droppedItem.y = Math.max(50, Math.min(mapHeight - 50, droppedItem.y));
        }
        
        lastCollected = findLastCollected();
        updateCollectionUI();
    }
    
    // Reset car position
    car.x = mapWidth * 0.2;
    car.y = mapHeight * 0.8;
    car.angle = -Math.PI / 2;
    car.velocity = 0;
    car.angularVelocity = 0;
    car.spinning = false;
}

function findLastCollected() {
    if (collectedItems.key) return 'key';
    if (collectedItems.treat) return 'treat';
    if (collectedItems.kitten) return 'kitten';
    return null;
}

// Collision detection
function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Honk action
function fireHonk() {
    playHonkSound();
    showMessage(MESSAGES.honk);
    
    honkWaves.push({
        x: car.x + Math.cos(car.angle) * 40,
        y: car.y + Math.sin(car.angle) * 40,
        angle: car.angle,
        radius: 20,
        maxRadius: 120,
        speed: 8
    });
}

// Update game
function update(deltaTime) {
    if (!gameRunning || gameWon) return;
    
    // Chaos mode timer
    chaosTimer += deltaTime;
    
    if (!chaosMode && chaosTimer >= nextChaosTime) {
        chaosMode = true;
        chaosDuration = randomRange(3000, 5000);
        chaosTimer = 0;
        showMessage(MESSAGES.chaosStart);
        document.getElementById('chaos-warning').classList.remove('hidden');
    }
    
    if (chaosMode && chaosTimer >= chaosDuration) {
        chaosMode = false;
        chaosTimer = 0;
        nextChaosTime = randomRange(5000, 10000);
        showMessage(MESSAGES.chaosEnd);
        document.getElementById('chaos-warning').classList.add('hidden');
    }
    
    // Handle spinning from pothole
    if (car.spinning) {
        car.spinTime -= deltaTime;
        car.angularVelocity = 0.3;
        if (car.spinTime <= 0) {
            car.spinning = false;
            car.angularVelocity = 0;
        }
    } else {
        // Car controls
        if (keys.up) {
            car.velocity += car.acceleration;
        }
        if (keys.down) {
            car.velocity -= car.acceleration * 0.7;
        }
        
        // Steering (swap if chaos mode)
        let leftKey = chaosMode ? keys.right : keys.left;
        let rightKey = chaosMode ? keys.left : keys.right;
        
        if (leftKey && Math.abs(car.velocity) > 0.1) {
            car.angularVelocity -= car.turnSpeed * Math.sign(car.velocity);
        }
        if (rightKey && Math.abs(car.velocity) > 0.1) {
            car.angularVelocity += car.turnSpeed * Math.sign(car.velocity);
        }
    }
    
    // Apply friction (slippery feel)
    car.velocity *= car.friction;
    car.angularVelocity *= car.angularFriction;
    
    // Clamp speed
    car.velocity = Math.max(-car.maxSpeed * 0.5, Math.min(car.maxSpeed, car.velocity));
    
    // Update position
    car.x += Math.cos(car.angle) * car.velocity;
    car.y += Math.sin(car.angle) * car.velocity;
    car.angle += car.angularVelocity;
    
    // Wall collision
    const carHalfW = car.width / 2;
    const carHalfH = car.height / 2;
    
    if (car.x - carHalfW < 0 || car.x + carHalfW > mapWidth ||
        car.y - carHalfH < 0 || car.y + carHalfH > mapHeight) {
        handleCrash('wall');
        return;
    }
    
    // Obstacle collision
    for (const obs of obstacles) {
        if (distanceBetween(car.x, car.y, obs.x, obs.y) < (obs.size / 2 + car.width / 2)) {
            handleCrash(obs.type);
            return;
        }
    }
    
    // Pothole collision
    for (const pot of potholes) {
        if (distanceBetween(car.x, car.y, pot.x, pot.y) < pot.radius + 10) {
            if (!car.spinning) {
                car.spinning = true;
                car.spinTime = 1000;
            }
        }
    }
    
    // Collectible pickup
    for (const item of collectibles) {
        if (!item.collected && distanceBetween(car.x, car.y, item.x, item.y) < item.size) {
            item.collected = true;
            collectedItems[item.type] = true;
            lastCollected = item.type;
            playCollectSound();
            updateCollectionUI();
        }
    }
    
    // Bad vibes movement and collision
    for (let i = badVibes.length - 1; i >= 0; i--) {
        const vibe = badVibes[i];
        vibe.x += vibe.vx;
        vibe.y += vibe.vy;
        
        // Bounce off walls
        if (vibe.x < 0 || vibe.x > mapWidth) vibe.vx *= -1;
        if (vibe.y < 0 || vibe.y > mapHeight) vibe.vy *= -1;
        
        // Check collision with car
        if (distanceBetween(car.x, car.y, vibe.x, vibe.y) < vibe.size / 2 + car.width / 2) {
            handleCrash('generic');
            return;
        }
    }
    
    // Maintain bad vibe count
    if (badVibes.length < 3 && Math.random() < 0.01) {
        spawnBadVibe();
    }
    
    // Update honk waves
    for (let i = honkWaves.length - 1; i >= 0; i--) {
        const wave = honkWaves[i];
        wave.radius += wave.speed;
        wave.x += Math.cos(wave.angle) * wave.speed;
        wave.y += Math.sin(wave.angle) * wave.speed;
        
        // Check collision with bad vibes
        for (let j = badVibes.length - 1; j >= 0; j--) {
            const vibe = badVibes[j];
            if (distanceBetween(wave.x, wave.y, vibe.x, vibe.y) < wave.radius + vibe.size / 2) {
                badVibes.splice(j, 1);
            }
        }
        
        if (wave.radius >= wave.maxRadius) {
            honkWaves.splice(i, 1);
        }
    }
    
    // Check parking spot
    if (!parkingSpot.locked) {
        const parkCenterX = parkingSpot.x + parkingSpot.width / 2;
        const parkCenterY = parkingSpot.y + parkingSpot.height / 2;
        
        if (distanceBetween(car.x, car.y, parkCenterX, parkCenterY) < 30 && 
            Math.abs(car.velocity) < 0.5) {
            winGame();
        }
    }
    
    // Handle honk input
    if (keys.honk) {
        keys.honk = false;
        fireHonk();
    }
}

// Win game
function winGame() {
    gameWon = true;
    gameRunning = false;
    playWinSound();
    
    document.getElementById('win-screen').classList.remove('hidden');
    createConfetti();
}

// Create confetti
function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    const colors = ['#ff69b4', '#00ff00', '#ffff00', '#ff0000', '#00ffff', '#ff00ff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road markings
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, mapHeight / 2);
    ctx.lineTo(mapWidth, mapHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw potholes
    for (const pot of potholes) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(pot.x, pot.y, pot.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw parking spot
    ctx.strokeStyle = parkingSpot.locked ? '#ff0000' : '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(parkingSpot.x, parkingSpot.y, parkingSpot.width, parkingSpot.height);
    
    // Draw parking spot indicator
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (parkingSpot.locked) {
        ctx.fillText('🔒', parkingSpot.x + parkingSpot.width / 2, parkingSpot.y + parkingSpot.height / 2);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Comic Sans MS';
        ctx.fillText(MESSAGES.parkHere, parkingSpot.x + parkingSpot.width / 2, parkingSpot.y + parkingSpot.height + 20);
    }
    
    // Draw collectibles
    ctx.font = '35px Arial';
    for (const item of collectibles) {
        if (!item.collected) {
            ctx.fillText(item.emoji, item.x - item.size / 2, item.y + item.size / 4);
        }
    }
    
    // Draw obstacles
    for (const obs of obstacles) {
        ctx.font = obs.size + 'px Arial';
        ctx.fillText(obs.emoji, obs.x - obs.size / 2, obs.y + obs.size / 4);
    }
    
    // Draw bad vibes
    ctx.font = '35px Arial';
    for (const vibe of badVibes) {
        ctx.fillText('😡', vibe.x - 17, vibe.y + 10);
    }
    
    // Draw honk waves
    for (const wave of honkWaves) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${1 - wave.radius / wave.maxRadius})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, wave.angle - 0.5, wave.angle + 0.5);
        ctx.stroke();
    }
    
    // Draw car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle + Math.PI / 2);
    
    // Car body (emoji)
    ctx.font = '45px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚗', 0, 0);
    
    ctx.restore();
}

// Game loop
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            keys.up = true;
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 'KeyS':
            keys.down = true;
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            e.preventDefault();
            break;
        case 'Space':
            keys.honk = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            keys.down = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
        case 'Space':
            keys.honk = false;
            break;
    }
});

// Mobile controls
function setupMobileControls() {
    const btnGas = document.getElementById('btn-gas');
    const btnBrake = document.getElementById('btn-brake');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnHonk = document.getElementById('btn-honk');
    
    // Touch handlers
    const addTouchHandlers = (btn, key) => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[key] = true;
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[key] = false;
        });
        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            keys[key] = false;
        });
    };
    
    addTouchHandlers(btnGas, 'up');
    addTouchHandlers(btnBrake, 'down');
    addTouchHandlers(btnLeft, 'left');
    addTouchHandlers(btnRight, 'right');
    
    btnHonk.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.honk = true;
    });
    btnHonk.addEventListener('touchend', (e) => {
        e.preventDefault();
    });
    
    // Also add mouse handlers for testing
    btnGas.addEventListener('mousedown', () => keys.up = true);
    btnGas.addEventListener('mouseup', () => keys.up = false);
    btnGas.addEventListener('mouseleave', () => keys.up = false);
    
    btnBrake.addEventListener('mousedown', () => keys.down = true);
    btnBrake.addEventListener('mouseup', () => keys.down = false);
    btnBrake.addEventListener('mouseleave', () => keys.down = false);
    
    btnLeft.addEventListener('mousedown', () => keys.left = true);
    btnLeft.addEventListener('mouseup', () => keys.left = false);
    btnLeft.addEventListener('mouseleave', () => keys.left = false);
    
    btnRight.addEventListener('mousedown', () => keys.right = true);
    btnRight.addEventListener('mouseup', () => keys.right = false);
    btnRight.addEventListener('mouseleave', () => keys.right = false);
    
    btnHonk.addEventListener('click', () => keys.honk = true);
}

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
    initAudio();
    document.getElementById('start-screen').classList.add('hidden');
    gameRunning = true;
    gameWon = false;
    initGame();
});

// Play again button
document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('win-screen').classList.add('hidden');
    gameRunning = true;
    gameWon = false;
    initGame();
});

// Initialize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    resizeCanvas();
    setupMobileControls();
    requestAnimationFrame(gameLoop);
});

// Prevent scrolling on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('#game-container')) {
        e.preventDefault();
    }
}, { passive: false });
