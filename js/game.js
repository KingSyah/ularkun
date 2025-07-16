/**
 * Snake Classic - Game Logic
 * Core game mechanics and state management
 */

/* ==========================================================================
   Game Constants
   ========================================================================== */
const GAME_CONFIG = {
  GRID_SIZE: 20,
  // Desktop speeds - faster for keyboard control
  INITIAL_SPEED: 150,
  SPEED_INCREMENT: 10,
  LEVEL_UP_THRESHOLD: 5,
  // Mobile speeds - slower for touch control adaptation
  INITIAL_SPEED_MOBILE: 280, // Much slower initial speed for mobile users to adapt
  SPEED_INCREMENT_MOBILE: 12, // Gentler speed increase for mobile
  LEVEL_UP_THRESHOLD_MOBILE: 7, // More food needed to level up on mobile
  // Common settings
  POINTS_PER_FOOD: 10,
  POINTS_PER_LEVEL: 100
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

/* ==========================================================================
   Snake Game Class
   ========================================================================== */
class SnakeGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.soundManager = getSoundManager();
    this.deviceType = DeviceDetector.getDeviceType();

    // Game state
    this.state = GAME_STATES.MENU;
    this.score = 0;
    this.highScore = StorageManager.load('highScore', 0);
    this.level = 1;
    this.speed = this.deviceType === 'mobile' ? GAME_CONFIG.INITIAL_SPEED_MOBILE : GAME_CONFIG.INITIAL_SPEED;
    this.foodEaten = 0;
    
    // Game objects
    this.snake = [];
    this.food = null;
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    
    // Game loop
    this.lastTime = 0;
    this.gameLoopId = null;
    
    // Canvas dimensions
    this.gridWidth = Math.floor(canvas.width / GAME_CONFIG.GRID_SIZE);
    this.gridHeight = Math.floor(canvas.height / GAME_CONFIG.GRID_SIZE);
    
    this.initialize();
  }

  /**
   * Initialize game
   */
  initialize() {
    this.resetGame();
    this.setupCanvas();
    this.render();
  }

  /**
   * Setup canvas properties
   */
  setupCanvas() {
    // Set canvas size based on device
    const deviceType = DeviceDetector.getDeviceType();
    let canvasSize;
    
    switch (deviceType) {
      case 'mobile':
        canvasSize = 280;
        break;
      case 'tablet':
        canvasSize = 360;
        break;
      default:
        canvasSize = 400;
    }
    
    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;
    this.gridWidth = Math.floor(canvasSize / GAME_CONFIG.GRID_SIZE);
    this.gridHeight = Math.floor(canvasSize / GAME_CONFIG.GRID_SIZE);
    
    // Set canvas style for crisp pixels
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.score = 0;
    this.level = 1;
    this.speed = this.deviceType === 'mobile' ? GAME_CONFIG.INITIAL_SPEED_MOBILE : GAME_CONFIG.INITIAL_SPEED;
    this.foodEaten = 0;
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    
    // Initialize snake in center
    const centerX = Math.floor(this.gridWidth / 2);
    const centerY = Math.floor(this.gridHeight / 2);
    
    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];
    
    this.generateFood();
    this.updateUI();
  }

  /**
   * Generate food at random position
   */
  generateFood() {
    let foodPosition;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      foodPosition = {
        x: MathUtils.randomInt(0, this.gridWidth - 1),
        y: MathUtils.randomInt(0, this.gridHeight - 1)
      };
      attempts++;
    } while (this.isSnakePosition(foodPosition) && attempts < maxAttempts);
    
    this.food = foodPosition;
  }

  /**
   * Check if position is occupied by snake
   * @param {object} position 
   * @returns {boolean}
   */
  isSnakePosition(position) {
    return this.snake.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  }

  /**
   * Start game
   */
  start() {
    if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.GAME_OVER) {
      this.resetGame();
    }

    this.state = GAME_STATES.PLAYING;
    this.hideOverlay(); // Ensure overlay is hidden when starting
    this.lastTime = performance.now();
    this.gameLoop();
    this.updateUI();
  }

  /**
   * Pause/Resume game
   */
  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.pause();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.resume();
    }
  }

  /**
   * Pause game
   */
  pause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.soundManager.play('pause');
      this.showOverlay('PAUSED', 'Press SPACE to resume');
      if (this.gameLoopId) {
        cancelAnimationFrame(this.gameLoopId);
        this.gameLoopId = null;
      }
    }
  }

  /**
   * Resume game
   */
  resume() {
    if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.soundManager.play('resume');
      this.hideOverlay();
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  /**
   * Game over
   */
  gameOver() {
    // Stop game loop first
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }

    this.state = GAME_STATES.GAME_OVER;
    this.soundManager.playGameOver();

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.save('highScore', this.highScore);
      this.showOverlay('NEW HIGH SCORE!', `Score: ${this.score} - Press SPACE to restart`);
    } else {
      this.showOverlay('GAME OVER', `Score: ${this.score} - Press SPACE to restart`);
    }

    this.updateUI();
  }

  /**
   * Change snake direction
   * @param {object} newDirection 
   */
  changeDirection(newDirection) {
    // Prevent reverse direction
    if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
      return;
    }
    
    this.nextDirection = newDirection;
  }

  /**
   * Main game loop
   */
  gameLoop() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.speed) {
      this.update();
      this.render();
      this.lastTime = currentTime;
    }
    
    if (this.state === GAME_STATES.PLAYING) {
      this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
  }

  /**
   * Update game state
   */
  update() {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    // Update direction
    this.direction = this.nextDirection;
    
    // Move snake
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= this.gridWidth || 
        head.y < 0 || head.y >= this.gridHeight) {
      this.gameOver();
      return;
    }
    
    // Check self collision
    if (this.isSnakePosition(head)) {
      this.gameOver();
      return;
    }
    
    // Add new head
    this.snake.unshift(head);
    
    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.eatFood();
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
    }
  }

  /**
   * Handle food consumption
   */
  eatFood() {
    this.score += GAME_CONFIG.POINTS_PER_FOOD;
    this.foodEaten++;
    this.soundManager.playEat();

    // Check level up with different threshold for mobile
    const levelUpThreshold = this.deviceType === 'mobile' ?
      GAME_CONFIG.LEVEL_UP_THRESHOLD_MOBILE : GAME_CONFIG.LEVEL_UP_THRESHOLD;

    if (this.foodEaten % levelUpThreshold === 0) {
      this.levelUp();
    }

    this.generateFood();
    this.updateUI();
  }

  /**
   * Level up
   */
  levelUp() {
    this.level++;
    this.score += GAME_CONFIG.POINTS_PER_LEVEL;

    // Use different speed increment for mobile vs desktop
    const speedIncrement = this.deviceType === 'mobile' ?
      GAME_CONFIG.SPEED_INCREMENT_MOBILE : GAME_CONFIG.SPEED_INCREMENT;

    // Set minimum speed based on device (mobile has higher minimum for easier control)
    const minSpeed = this.deviceType === 'mobile' ? 80 : 50;

    this.speed = Math.max(minSpeed, this.speed - speedIncrement);
    this.soundManager.playLevelUp();
    this.updateUI();
  }

  /**
   * Render game
   */
  render() {
    this.clearCanvas();
    this.drawGrid();
    this.drawFood();
    this.drawSnake();
  }

  /**
   * Clear canvas
   */
  clearCanvas() {
    const deviceType = DeviceDetector.getDeviceType();
    
    if (deviceType === 'mobile') {
      // Game Boy green background
      this.ctx.fillStyle = '#9bbc0f';
    } else {
      // Dark background for PC
      this.ctx.fillStyle = '#0a0a0a';
    }
    
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw grid (optional, for debugging)
   */
  drawGrid() {
    // Grid is optional and can be enabled for debugging
    if (false) { // Set to true to show grid
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 1;

      for (let x = 0; x <= this.gridWidth; x++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x * GAME_CONFIG.GRID_SIZE, 0);
        this.ctx.lineTo(x * GAME_CONFIG.GRID_SIZE, this.canvas.height);
        this.ctx.stroke();
      }

      for (let y = 0; y <= this.gridHeight; y++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y * GAME_CONFIG.GRID_SIZE);
        this.ctx.lineTo(this.canvas.width, y * GAME_CONFIG.GRID_SIZE);
        this.ctx.stroke();
      }
    }
  }

  /**
   * Draw food
   */
  drawFood() {
    if (!this.food) return;

    const deviceType = DeviceDetector.getDeviceType();
    const x = this.food.x * GAME_CONFIG.GRID_SIZE;
    const y = this.food.y * GAME_CONFIG.GRID_SIZE;
    const size = GAME_CONFIG.GRID_SIZE - 2;

    if (deviceType === 'mobile') {
      // Game Boy style food
      this.ctx.fillStyle = '#0f380f';
      this.ctx.fillRect(x + 1, y + 1, size, size);

      // Add simple pattern
      this.ctx.fillStyle = '#306230';
      this.ctx.fillRect(x + 3, y + 3, size - 4, size - 4);
    } else {
      // Modern PC style food with glow effect
      this.ctx.fillStyle = '#ff4444';
      this.ctx.fillRect(x + 1, y + 1, size, size);

      // Add glow effect
      this.ctx.shadowColor = '#ff4444';
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(x + 1, y + 1, size, size);
      this.ctx.shadowBlur = 0;
    }
  }

  /**
   * Draw snake
   */
  drawSnake() {
    const deviceType = DeviceDetector.getDeviceType();

    this.snake.forEach((segment, index) => {
      const x = segment.x * GAME_CONFIG.GRID_SIZE;
      const y = segment.y * GAME_CONFIG.GRID_SIZE;
      const size = GAME_CONFIG.GRID_SIZE - 2;

      if (deviceType === 'mobile') {
        // Game Boy style snake
        if (index === 0) {
          // Head
          this.ctx.fillStyle = '#0f380f';
          this.ctx.fillRect(x + 1, y + 1, size, size);

          // Eyes
          this.ctx.fillStyle = '#9bbc0f';
          this.ctx.fillRect(x + 4, y + 4, 3, 3);
          this.ctx.fillRect(x + 13, y + 4, 3, 3);
        } else {
          // Body
          this.ctx.fillStyle = '#306230';
          this.ctx.fillRect(x + 1, y + 1, size, size);
        }
      } else {
        // Modern PC style snake
        if (index === 0) {
          // Head with glow
          this.ctx.fillStyle = '#00ff00';
          this.ctx.shadowColor = '#00ff00';
          this.ctx.shadowBlur = 15;
          this.ctx.fillRect(x + 1, y + 1, size, size);
          this.ctx.shadowBlur = 0;

          // Eyes
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(x + 4, y + 4, 3, 3);
          this.ctx.fillRect(x + 13, y + 4, 3, 3);

          // Pupils
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(x + 5, y + 5, 1, 1);
          this.ctx.fillRect(x + 14, y + 5, 1, 1);
        } else {
          // Body with gradient effect
          const alpha = Math.max(0.3, 1 - (index * 0.1));
          this.ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
          this.ctx.fillRect(x + 1, y + 1, size, size);
        }
      }
    });
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Desktop elements
    const scoreElement = DOMUtils.$('scoreValue');
    const highScoreElement = DOMUtils.$('highScoreValue');
    const levelElement = DOMUtils.$('levelValue');

    // Mobile elements
    const scoreElementMobile = DOMUtils.$('scoreValueMobile');
    const highScoreElementMobile = DOMUtils.$('highScoreValueMobile');
    const levelElementMobile = DOMUtils.$('levelValueMobile');

    // Update desktop UI
    if (scoreElement) scoreElement.textContent = this.score;
    if (highScoreElement) highScoreElement.textContent = this.highScore;
    if (levelElement) levelElement.textContent = this.level;

    // Update mobile UI
    if (scoreElementMobile) scoreElementMobile.textContent = this.score;
    if (highScoreElementMobile) highScoreElementMobile.textContent = this.highScore;
    if (levelElementMobile) levelElementMobile.textContent = this.level;
  }

  /**
   * Show overlay message
   * @param {string} title
   * @param {string} message
   */
  showOverlay(title, message) {
    const deviceType = DeviceDetector.getDeviceType();
    const overlayId = deviceType === 'mobile' ? 'gameOverlayMobile' : 'gameOverlay';
    const titleId = deviceType === 'mobile' ? 'overlayTitleMobile' : 'overlayTitle';
    const messageId = deviceType === 'mobile' ? 'overlayMessageMobile' : 'overlayMessage';

    const overlay = DOMUtils.$(overlayId);
    const titleElement = DOMUtils.$(titleId);
    const messageElement = DOMUtils.$(messageId);

    if (overlay && titleElement && messageElement) {
      titleElement.textContent = title;
      // Adjust message for mobile
      if (deviceType === 'mobile') {
        messageElement.textContent = message.replace('Press SPACE', 'Press START');
      } else {
        messageElement.textContent = message;
      }
      DOMUtils.addClass(overlay, 'active');
    }
  }

  /**
   * Hide overlay
   */
  hideOverlay() {
    const deviceType = DeviceDetector.getDeviceType();
    const overlayId = deviceType === 'mobile' ? 'gameOverlayMobile' : 'gameOverlay';
    const overlay = DOMUtils.$(overlayId);

    if (overlay) {
      DOMUtils.removeClass(overlay, 'active');
    }
  }

  /**
   * Get current game state
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * Get current level
   * @returns {number}
   */
  getLevel() {
    return this.level;
  }

  /**
   * Cleanup game resources
   */
  destroy() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }
}
