/**
 * Snake Classic - Game Logic
 * © 2025 KingSyah
 */

class SnakeGame extends EventEmitter {
    constructor() {
        super();
        
        // Game state
        this.state = GameState.LOADING;
        this.isRunning = false;
        this.isPaused = false;
        
        // Game objects
        this.snake = [];
        this.food = null;
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        
        // Game stats
        this.score = 0;
        this.highScore = StorageUtils.getItem('highScore', 0);
        this.level = 1;
        this.foodEaten = 0;
        this.speed = GameConfig.INITIAL_SPEED;
        
        // Canvas and rendering
        this.canvas = null;
        this.ctx = null;
        this.gridSize = GameConfig.GRID_SIZE;
        this.canvasSize = GameConfig.CANVAS_SIZE;
        
        // Device detection
        this.isMobile = DeviceUtils.isMobile();
        this.deviceType = DeviceUtils.getDeviceType();

        // Fullscreen state
        this.isFullscreen = false;
        this.gameboyContainer = null;

        // Game loop
        this.lastUpdateTime = 0;
        this.gameLoopId = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeGame();
        this.updateUI();
        this.setupFullscreen();

        // Set initial state
        this.state = GameState.MENU;
        this.emit('stateChange', this.state);
    }
    
    setupCanvas() {
        // Select appropriate canvas based on device
        if (this.isMobile) {
            this.canvas = document.getElementById('gameCanvasMobile');
            this.canvasSize = GameConfig.MOBILE_CANVAS_SIZE;
        } else {
            this.canvas = document.getElementById('gameCanvas');
            this.canvasSize = GameConfig.CANVAS_SIZE;
        }
        
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        // Configure context for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Mobile controls
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        // Game controls
        this.setupGameControls();
        
        // Window events
        window.addEventListener('blur', () => {
            if (this.isRunning && !this.isPaused) {
                this.pauseGame();
            }
        });
        
        window.addEventListener('focus', () => {
            // Resume game logic handled by user input
        });
        
        // Context menu prevention is now handled in main.js optimizeTouchEvents()
    }
    
    setupMobileControls() {
        // D-Pad controls
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Action buttons
        const startBtn = document.getElementById('startBtn');
        const selectBtn = document.getElementById('selectBtn');
        
        // Add event listeners with proper touch handling
        if (upBtn) {
            this.addTouchListener(upBtn, () => this.changeDirection(Direction.UP));
        }
        if (downBtn) {
            this.addTouchListener(downBtn, () => this.changeDirection(Direction.DOWN));
        }
        if (leftBtn) {
            this.addTouchListener(leftBtn, () => this.changeDirection(Direction.LEFT));
        }
        if (rightBtn) {
            this.addTouchListener(rightBtn, () => this.changeDirection(Direction.RIGHT));
        }
        
        if (startBtn) {
            this.addTouchListener(startBtn, () => this.handleStartButton());
        }
        if (selectBtn) {
            this.addTouchListener(selectBtn, () => this.handleSelectButton());
        }
    }
    
    addTouchListener(element, callback) {
        // Handle touch events for game controls only
        element.addEventListener('touchstart', (e) => {
            // Only prevent default for game control elements
            if (element.classList.contains('dpad-btn') ||
                element.classList.contains('action-btn') ||
                element.classList.contains('gameboy-btn')) {
                e.preventDefault();
                e.stopPropagation();
            }
            soundManager.play('click');
            callback();
            Utils.vibrate([50]); // Short vibration feedback
        }, { passive: false });

        // Also handle click for desktop testing
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            soundManager.play('click');
            callback();
        });
    }
    
    setupGameControls() {
        // Pause buttons
        const pauseBtn = document.getElementById('pauseBtn');
        const pauseBtnMobile = document.getElementById('pauseBtnMobile');
        
        // Restart buttons
        const restartBtn = document.getElementById('restartBtn');
        const restartBtnMobile = document.getElementById('restartBtnMobile');
        
        // Sound toggle buttons
        const soundToggle = document.getElementById('soundToggle');
        const soundToggleMobile = document.getElementById('soundToggleMobile');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        if (pauseBtnMobile) {
            pauseBtnMobile.addEventListener('click', () => this.togglePause());
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.startNewGame());
        }
        if (restartBtnMobile) {
            restartBtnMobile.addEventListener('click', () => this.startNewGame());
        }
        
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                soundManager.toggleMute();
                soundManager.play('click');
            });
        }
        if (soundToggleMobile) {
            soundToggleMobile.addEventListener('click', () => {
                soundManager.toggleMute();
                soundManager.play('click');
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
                soundManager.play('click');
            });
        }
    }
    
    initializeGame() {
        // Initialize snake in center
        const centerX = Math.floor(this.canvasSize / this.gridSize / 2);
        const centerY = Math.floor(this.canvasSize / this.gridSize / 2);
        
        this.snake = [];
        for (let i = 0; i < GameConfig.INITIAL_SNAKE_LENGTH; i++) {
            this.snake.push({
                x: centerX - i,
                y: centerY
            });
        }
        
        // Set initial direction
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        
        // Generate first food
        this.generateFood();
        
        // Reset game stats
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.speed = this.isMobile ? GameConfig.MOBILE_INITIAL_SPEED : GameConfig.INITIAL_SPEED;
        
        // Update UI
        this.updateUI();
        
        // Initial render
        this.render();
    }
    
    generateFood() {
        this.food = Utils.generateFoodPosition(
            this.snake, 
            this.gridSize, 
            this.canvasSize
        );
    }
    
    handleKeyPress(event) {
        // Prevent default behavior for game keys
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyR', 'KeyM', 'KeyF', 'F11'];
        if (gameKeys.includes(event.code)) {
            event.preventDefault();
        }

        switch (event.code) {
            case 'ArrowUp':
                this.changeDirection(Direction.UP);
                break;
            case 'ArrowDown':
                this.changeDirection(Direction.DOWN);
                break;
            case 'ArrowLeft':
                this.changeDirection(Direction.LEFT);
                break;
            case 'ArrowRight':
                this.changeDirection(Direction.RIGHT);
                break;
            case 'Space':
                this.handleSpaceKey();
                break;
            case 'KeyR':
                this.startNewGame();
                break;
            case 'KeyM':
                soundManager.toggleMute();
                soundManager.play('click');
                break;
            case 'KeyF':
            case 'F11':
                if (this.isMobile) {
                    this.toggleFullscreen();
                }
                break;
        }
    }
    
    handleSpaceKey() {
        if (this.state === GameState.MENU || this.state === GameState.GAME_OVER) {
            this.startNewGame();
        } else if (this.state === GameState.PLAYING) {
            this.togglePause();
        } else if (this.state === GameState.PAUSED) {
            this.resumeGame();
        }
    }
    
    handleStartButton() {
        if (this.state === GameState.MENU || this.state === GameState.GAME_OVER) {
            this.startNewGame();
        } else {
            this.togglePause();
        }
    }
    
    handleSelectButton() {
        if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
            this.startNewGame();
        }
    }
    
    changeDirection(newDirection) {
        if (this.state !== GameState.PLAYING) return;
        
        // Check if direction change is valid (not opposite)
        if (Utils.isValidDirectionChange(this.direction, newDirection)) {
            this.nextDirection = newDirection;
            soundManager.play('move');
        }
    }
    
    startNewGame() {
        this.stopGameLoop();
        this.initializeGame();
        this.state = GameState.PLAYING;
        this.isRunning = true;
        this.isPaused = false;
        this.startGameLoop();
        this.hideOverlay();

        // Show mobile tutorial hint for first-time players
        if (this.isMobile && this.level === 1) {
            setTimeout(() => {
                this.showMobileTutorialHint();
            }, 1000);
        }

        this.emit('stateChange', this.state);
        soundManager.play('click');
    }

    showMobileTutorialHint() {
        if (this.state !== GameState.PLAYING) return;

        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(52, 152, 219, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.8rem;
            z-index: 1000;
            text-align: center;
            max-width: 80%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        hint.innerHTML = `
            <div>🐍 Level 1 - Take your time!</div>
            <div style="font-size: 0.7rem; margin-top: 5px;">Use D-Pad to move • Speed: ${this.speed}ms</div>
        `;

        document.body.appendChild(hint);

        setTimeout(() => {
            hint.remove();
        }, 4000);
    }
    
    pauseGame() {
        if (this.state !== GameState.PLAYING) return;
        
        this.isPaused = true;
        this.state = GameState.PAUSED;
        this.stopGameLoop();
        this.showOverlay('PAUSED', 'Press SPACE to resume');
        this.emit('stateChange', this.state);
        soundManager.play('pause');
    }
    
    resumeGame() {
        if (this.state !== GameState.PAUSED) return;
        
        this.isPaused = false;
        this.state = GameState.PLAYING;
        this.startGameLoop();
        this.hideOverlay();
        this.emit('stateChange', this.state);
        soundManager.play('click');
    }
    
    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.pauseGame();
        } else if (this.state === GameState.PAUSED) {
            this.resumeGame();
        }
    }

    gameOver() {
        this.isRunning = false;
        this.state = GameState.GAME_OVER;
        this.stopGameLoop();

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            StorageUtils.setItem('highScore', this.highScore);
            this.updateUI();
        }

        // Show game over overlay
        const message = this.isMobile ? 'Press START to restart' : 'Press SPACE to restart';
        this.showOverlay('GAME OVER', message);

        this.emit('stateChange', this.state);
        this.emit('gameOver', { score: this.score, level: this.level });
        soundManager.play('gameOver');

        // Vibrate on mobile
        if (this.isMobile) {
            Utils.vibrate([200, 100, 200]);
        }
    }

    levelUp() {
        this.level++;
        this.foodEaten = 0;
        this.speed = Utils.calculateSpeed(this.level, this.isMobile);

        // Show level up message briefly with speed info for mobile
        const speedInfo = this.isMobile ? ` (Speed: ${this.speed}ms)` : '';
        this.showOverlay(`LEVEL ${this.level}`, `Get ready!${speedInfo}`, 2000);

        this.updateUI();
        this.emit('levelUp', this.level);
        soundManager.play('levelUp');

        // Vibrate on mobile
        if (this.isMobile) {
            Utils.vibrate([100, 50, 100, 50, 100]);
        }

        console.log(`Level ${this.level} - Speed: ${this.speed}ms (${this.isMobile ? 'Mobile' : 'Desktop'})`);
    }

    update(currentTime) {
        if (!this.isRunning || this.isPaused) return;

        // Check if enough time has passed for next update
        if (currentTime - this.lastUpdateTime < this.speed) return;

        this.lastUpdateTime = currentTime;

        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Check wall collision
        if (!Utils.isInBounds(head, this.gridSize, this.canvasSize)) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => Utils.positionsEqual(segment, head))) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        if (Utils.positionsEqual(head, this.food)) {
            this.eatFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }

        // Render game
        this.render();
    }

    eatFood() {
        this.foodEaten++;

        // Calculate score with level bonus
        const baseScore = GameConfig.FOOD_SCORE;
        const levelScore = Utils.calculateScore(baseScore, this.level);
        this.score += levelScore;

        // Generate new food
        this.generateFood();

        // Check for level up (different requirements for mobile vs desktop)
        const foodRequired = this.isMobile ? GameConfig.MOBILE_FOOD_PER_LEVEL : GameConfig.FOOD_PER_LEVEL;
        if (this.foodEaten >= foodRequired) {
            this.levelUp();
        }

        // Update UI
        this.updateUI();

        // Play sound
        soundManager.play('eat');

        // Emit event
        this.emit('foodEaten', { score: levelScore, totalScore: this.score });
    }

    render() {
        if (!this.ctx) return;

        // Get colors based on device type
        const colors = this.isMobile ? GameConfig.MOBILE_COLORS : GameConfig.COLORS;

        // Clear canvas
        this.ctx.fillStyle = colors.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        // Draw grid (optional, subtle)
        this.drawGrid(colors.GRID);

        // Draw food
        this.drawFood(colors.FOOD);

        // Draw snake
        this.drawSnake(colors.SNAKE_HEAD, colors.SNAKE_BODY);
    }

    drawGrid(color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.1;

        // Draw vertical lines
        for (let x = 0; x <= this.canvasSize; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasSize);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.canvasSize; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasSize, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    drawFood(color) {
        if (!this.food) return;

        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

        // Add a subtle glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        this.ctx.shadowBlur = 0;
    }

    drawSnake(headColor, bodyColor) {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            // Use different color for head
            this.ctx.fillStyle = index === 0 ? headColor : bodyColor;
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

            // Add border for better visibility
            this.ctx.strokeStyle = this.isMobile ? '#0f380f' : '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
        });
    }

    startGameLoop() {
        this.stopGameLoop();

        const gameLoop = (currentTime) => {
            this.update(currentTime);
            PerformanceMonitor.update(currentTime);

            if (this.isRunning) {
                this.gameLoopId = requestAnimationFrame(gameLoop);
            }
        };

        this.gameLoopId = requestAnimationFrame(gameLoop);
    }

    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    showOverlay(title, message, duration = null) {
        const overlay = this.isMobile ?
            document.getElementById('gameOverlayMobile') :
            document.getElementById('gameOverlay');

        const titleElement = this.isMobile ?
            document.getElementById('overlayTitleMobile') :
            document.getElementById('overlayTitle');

        const messageElement = this.isMobile ?
            document.getElementById('overlayMessageMobile') :
            document.getElementById('overlayMessage');

        if (overlay && titleElement && messageElement) {
            titleElement.textContent = title;
            messageElement.textContent = message;
            overlay.classList.remove('hidden');

            // Auto-hide after duration
            if (duration) {
                setTimeout(() => {
                    this.hideOverlay();
                }, duration);
            }
        }
    }

    hideOverlay() {
        const overlay = this.isMobile ?
            document.getElementById('gameOverlayMobile') :
            document.getElementById('gameOverlay');

        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    updateUI() {
        // Update score displays
        const scoreElements = document.querySelectorAll('#scoreValue, #scoreValueMobile');
        const highScoreElements = document.querySelectorAll('#highScoreValue, #highScoreValueMobile');
        const levelElements = document.querySelectorAll('#levelValue, #levelValueMobile');

        scoreElements.forEach(element => {
            if (element) element.textContent = Utils.formatScore(this.score);
        });

        highScoreElements.forEach(element => {
            if (element) element.textContent = Utils.formatScore(this.highScore);
        });

        // Show level with progress indicator for mobile
        const foodRequired = this.isMobile ? GameConfig.MOBILE_FOOD_PER_LEVEL : GameConfig.FOOD_PER_LEVEL;
        const levelText = this.isMobile ?
            `${this.level} (${this.foodEaten}/${foodRequired})` :
            this.level.toString();

        levelElements.forEach(element => {
            if (element) element.textContent = levelText;
        });

        // Update device mode display
        const deviceModeElement = document.getElementById('deviceMode');
        if (deviceModeElement) {
            const speedInfo = this.isMobile ? ` - Speed: ${this.speed}ms` : '';
            deviceModeElement.textContent = `${this.isMobile ? 'Mobile' : 'PC'} Mode${speedInfo}`;
        }
    }

    // Public API methods
    getState() {
        return this.state;
    }

    getScore() {
        return this.score;
    }

    getHighScore() {
        return this.highScore;
    }

    getLevel() {
        return this.level;
    }

    isGameRunning() {
        return this.isRunning;
    }

    isGamePaused() {
        return this.isPaused;
    }

    setupFullscreen() {
        if (!this.isMobile) return;

        this.gameboyContainer = document.querySelector('.gameboy-container');

        // Check if fullscreen API is supported
        this.fullscreenSupported = !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        );

        if (!this.fullscreenSupported) {
            // Hide fullscreen button if not supported
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                fullscreenBtn.style.display = 'none';
            }
            return;
        }

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

        // Update fullscreen button tooltip
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.setAttribute('data-tooltip', 'Fullscreen');
            fullscreenBtn.setAttribute('aria-label', 'Toggle Fullscreen Mode');
        }
    }

    toggleFullscreen() {
        if (!this.isMobile || !this.gameboyContainer || !this.fullscreenSupported) return;

        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    async enterFullscreen() {
        try {
            // Add fullscreen class first
            this.gameboyContainer.classList.add('fullscreen');
            this.isFullscreen = true;

            // Request fullscreen on the gameboy container
            if (this.gameboyContainer.requestFullscreen) {
                await this.gameboyContainer.requestFullscreen();
            } else if (this.gameboyContainer.webkitRequestFullscreen) {
                await this.gameboyContainer.webkitRequestFullscreen();
            } else if (this.gameboyContainer.mozRequestFullScreen) {
                await this.gameboyContainer.mozRequestFullScreen();
            } else if (this.gameboyContainer.msRequestFullscreen) {
                await this.gameboyContainer.msRequestFullscreen();
            }

            // Update button
            this.updateFullscreenButton();

            // Resize canvas for fullscreen
            this.resizeCanvasForFullscreen();

            // Vibrate feedback
            Utils.vibrate([100]);

            console.log('Entered fullscreen mode');

        } catch (error) {
            console.warn('Failed to enter fullscreen:', error);
            this.gameboyContainer.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
    }

    async exitFullscreen() {
        try {
            // Exit fullscreen
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }

            console.log('Exited fullscreen mode');

        } catch (error) {
            console.warn('Failed to exit fullscreen:', error);
            // Force exit
            this.handleFullscreenChange();
        }
    }

    handleFullscreenChange() {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        if (!isCurrentlyFullscreen && this.isFullscreen) {
            // Exited fullscreen
            this.isFullscreen = false;
            if (this.gameboyContainer) {
                this.gameboyContainer.classList.remove('fullscreen');
            }
            this.updateFullscreenButton();
            this.resizeCanvasForNormal();
        }
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            if (this.isFullscreen) {
                fullscreenBtn.textContent = '⛶';
                fullscreenBtn.setAttribute('data-tooltip', 'Exit Fullscreen');
            } else {
                fullscreenBtn.textContent = '⛶';
                fullscreenBtn.setAttribute('data-tooltip', 'Fullscreen');
            }
        }
    }

    resizeCanvasForFullscreen() {
        if (!this.isMobile || !this.canvas) return;

        // Calculate optimal size for fullscreen
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6);
        const size = Math.min(maxSize, 400);

        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';

        // Re-render
        this.render();
    }

    resizeCanvasForNormal() {
        if (!this.isMobile || !this.canvas) return;

        // Reset to normal size
        this.canvas.style.width = '';
        this.canvas.style.height = '';

        // Re-render
        this.render();
    }

    // Cleanup
    destroy() {
        this.stopGameLoop();

        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));

        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        }

        // Reset state
        this.isRunning = false;
        this.isPaused = false;
        this.state = GameState.MENU;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SnakeGame };
}
