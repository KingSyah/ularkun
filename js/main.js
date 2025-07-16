/**
 * Snake Classic - Main Application
 * Handles initialization, controls, and UI interactions
 */

/* ==========================================================================
   Application Class
   ========================================================================== */
class SnakeApp {
  constructor() {
    this.game = null;
    this.soundManager = null;
    this.deviceType = DeviceDetector.getDeviceType();
    this.isInitialized = false;
    
    // DOM elements
    this.elements = {
      canvas: null,
      soundToggle: null,
      pauseBtn: null,
      restartBtn: null,
      mobileControls: null,
      deviceMode: null,
      loadingScreen: null,
      loadingProgress: null
    };
    
    // Control handlers
    this.keyboardHandler = this.handleKeyboard.bind(this);
    this.touchHandlers = new Map();
    
    this.initialize();
  }

  /**
   * Initialize application
   */
  async initialize() {
    try {
      await this.showLoadingScreen();
      this.updateCopyright();
      this.cacheElements();
      this.setupDevice();
      this.initializeGame();
      this.initializeSound();
      this.setupControls();
      this.setupUI();
      await this.hideLoadingScreen();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }

  /**
   * Show loading screen with progress
   */
  async showLoadingScreen() {
    const loadingScreen = DOMUtils.$('loadingScreen');
    const loadingProgress = DOMUtils.$('loadingProgress');
    
    if (loadingScreen && loadingProgress) {
      const steps = [
        'Initializing game engine...',
        'Setting up audio system...',
        'Configuring controls...',
        'Loading game assets...',
        'Finalizing setup...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        const progress = ((i + 1) / steps.length) * 100;
        loadingProgress.style.width = `${progress}%`;
        
        const loadingText = DOMUtils.select('.loading-text');
        if (loadingText) {
          loadingText.textContent = steps[i];
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  /**
   * Hide loading screen
   */
  async hideLoadingScreen() {
    const loadingScreen = DOMUtils.$('loadingScreen');
    if (loadingScreen) {
      await new Promise(resolve => setTimeout(resolve, 500));
      DOMUtils.addClass(loadingScreen, 'hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Update copyright year automatically
   */
  updateCopyright() {
    const currentYear = new Date().getFullYear();

    // Update desktop copyright
    const yearElement = DOMUtils.$('currentYear');
    if (yearElement) {
      yearElement.textContent = currentYear;
    }

    // Update mobile copyright
    const yearElementMobile = DOMUtils.$('currentYearMobile');
    if (yearElementMobile) {
      yearElementMobile.textContent = currentYear;
    }
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      canvas: this.deviceType === 'mobile' ? DOMUtils.$('gameCanvasMobile') : DOMUtils.$('gameCanvas'),
      soundToggle: this.deviceType === 'mobile' ? DOMUtils.$('soundToggleMobile') : DOMUtils.$('soundToggle'),
      pauseBtn: this.deviceType === 'mobile' ? DOMUtils.$('pauseBtnMobile') : DOMUtils.$('pauseBtn'),
      restartBtn: this.deviceType === 'mobile' ? DOMUtils.$('restartBtnMobile') : DOMUtils.$('restartBtn'),
      gameOverlay: this.deviceType === 'mobile' ? DOMUtils.$('gameOverlayMobile') : DOMUtils.$('gameOverlay'),
      overlayTitle: this.deviceType === 'mobile' ? DOMUtils.$('overlayTitleMobile') : DOMUtils.$('overlayTitle'),
      overlayMessage: this.deviceType === 'mobile' ? DOMUtils.$('overlayMessageMobile') : DOMUtils.$('overlayMessage'),
      deviceMode: DOMUtils.$('deviceMode'),
      loadingScreen: DOMUtils.$('loadingScreen'),
      loadingProgress: DOMUtils.$('loadingProgress'),
      startBtn: DOMUtils.$('startBtn'),
      selectBtn: DOMUtils.$('selectBtn'),
      upBtn: DOMUtils.$('upBtn'),
      downBtn: DOMUtils.$('downBtn'),
      leftBtn: DOMUtils.$('leftBtn'),
      rightBtn: DOMUtils.$('rightBtn')
    };
  }

  /**
   * Setup device-specific configurations
   */
  setupDevice() {
    const deviceMode = this.elements.deviceMode;
    const gameboyContainer = DOMUtils.select('.gameboy-container');
    const desktopLayout = DOMUtils.select('.desktop-layout');
    const pcInstructions = DOMUtils.select('.pc-instructions');
    const mobileInstructions = DOMUtils.select('.mobile-instructions');

    if (deviceMode) {
      deviceMode.textContent = `${this.deviceType.charAt(0).toUpperCase() + this.deviceType.slice(1)} Mode`;
    }

    if (this.deviceType === 'mobile') {
      // Show GameBoy container and mobile instructions
      if (gameboyContainer) DOMUtils.removeClass(gameboyContainer, 'hidden');
      if (desktopLayout) DOMUtils.addClass(desktopLayout, 'hidden');
      if (mobileInstructions) DOMUtils.removeClass(mobileInstructions, 'hidden');
      if (pcInstructions) DOMUtils.addClass(pcInstructions, 'hidden');

      // Add mobile-specific body class
      DOMUtils.addClass(document.body, 'mobile-device');
      DOMUtils.removeClass(document.body, 'desktop-device');
    } else {
      // Show desktop layout and PC instructions
      if (gameboyContainer) DOMUtils.addClass(gameboyContainer, 'hidden');
      if (desktopLayout) DOMUtils.removeClass(desktopLayout, 'hidden');
      if (mobileInstructions) DOMUtils.addClass(mobileInstructions, 'hidden');
      if (pcInstructions) DOMUtils.removeClass(pcInstructions, 'hidden');

      // Add desktop-specific body class
      DOMUtils.addClass(document.body, 'desktop-device');
      DOMUtils.removeClass(document.body, 'mobile-device');
    }
  }

  /**
   * Initialize game instance
   */
  initializeGame() {
    if (this.elements.canvas) {
      this.game = new SnakeGame(this.elements.canvas);
    } else {
      throw new Error('Canvas element not found');
    }
  }

  /**
   * Initialize sound system
   */
  initializeSound() {
    this.soundManager = getSoundManager();
    this.updateSoundButton();
  }

  /**
   * Setup control handlers
   */
  setupControls() {
    // Keyboard controls (always active)
    document.addEventListener('keydown', this.keyboardHandler);
    
    // Touch controls for mobile
    if (this.deviceType === 'mobile') {
      this.setupTouchControls();
    }
    
    // Button controls
    this.setupButtonControls();
    
    // Prevent context menu on canvas
    if (this.elements.canvas) {
      this.elements.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
  }

  /**
   * Setup touch controls for mobile
   */
  setupTouchControls() {
    const touchButtons = [
      { element: this.elements.upBtn, direction: DIRECTIONS.UP },
      { element: this.elements.downBtn, direction: DIRECTIONS.DOWN },
      { element: this.elements.leftBtn, direction: DIRECTIONS.LEFT },
      { element: this.elements.rightBtn, direction: DIRECTIONS.RIGHT }
    ];

    touchButtons.forEach(({ element, direction }) => {
      if (element) {
        const handler = (e) => {
          e.preventDefault();
          this.handleDirectionInput(direction);
          this.soundManager.play('buttonClick');
        };

        element.addEventListener('touchstart', handler, { passive: false });
        element.addEventListener('click', handler);
        this.touchHandlers.set(element, handler);
      }
    });
    
    // Start/Select buttons
    if (this.elements.startBtn) {
      const startHandler = (e) => {
        e.preventDefault();
        this.handleStartButton();
        this.soundManager.play('buttonClick');
      };
      this.elements.startBtn.addEventListener('touchstart', startHandler, { passive: false });
      this.elements.startBtn.addEventListener('click', startHandler);
    }
    
    if (this.elements.selectBtn) {
      const selectHandler = (e) => {
        e.preventDefault();
        this.handleSelectButton();
        this.soundManager.play('buttonClick');
      };
      this.elements.selectBtn.addEventListener('touchstart', selectHandler, { passive: false });
      this.elements.selectBtn.addEventListener('click', selectHandler);
    }
  }

  /**
   * Setup button controls
   */
  setupButtonControls() {
    // Sound toggle
    if (this.elements.soundToggle) {
      this.elements.soundToggle.addEventListener('click', () => {
        this.toggleSound();
      });
    }
    
    // Pause button
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => {
        this.game.togglePause();
      });
    }
    
    // Restart button
    if (this.elements.restartBtn) {
      const restartHandler = () => {
        this.game.start();
        this.soundManager.play('buttonClick');
      };

      this.elements.restartBtn.addEventListener('click', restartHandler);
      this.elements.restartBtn.addEventListener('touchstart', restartHandler, { passive: false });
    }
  }

  /**
   * Setup UI interactions
   */
  setupUI() {
    // Update copyright on setup
    this.updateCopyright();

    // Handle window resize
    const resizeHandler = PerformanceUtils.debounce(() => {
      this.handleResize();
    }, 250);

    window.addEventListener('resize', resizeHandler);
    
    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.game && this.game.getState() === GAME_STATES.PLAYING) {
        this.game.pause();
      }
    });
    
    // Initialize sound on first user interaction
    const initSound = () => {
      this.soundManager.initialize();
      document.removeEventListener('click', initSound);
      document.removeEventListener('touchstart', initSound);
      document.removeEventListener('keydown', initSound);
    };
    
    document.addEventListener('click', initSound);
    document.addEventListener('touchstart', initSound);
    document.addEventListener('keydown', initSound);

    // Auto update copyright every hour (in case year changes while app is running)
    setInterval(() => {
      this.updateCopyright();
    }, 3600000); // 1 hour = 3600000ms
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event 
   */
  handleKeyboard(event) {
    if (!this.game) return;
    
    const key = event.key.toLowerCase();
    
    // Prevent default for game keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'r', 'm'].includes(key)) {
      event.preventDefault();
    }
    
    switch (key) {
      case 'arrowup':
        this.handleDirectionInput(DIRECTIONS.UP);
        break;
      case 'arrowdown':
        this.handleDirectionInput(DIRECTIONS.DOWN);
        break;
      case 'arrowleft':
        this.handleDirectionInput(DIRECTIONS.LEFT);
        break;
      case 'arrowright':
        this.handleDirectionInput(DIRECTIONS.RIGHT);
        break;
      case ' ':
        this.handleSpaceKey();
        break;
      case 'r':
        this.game.start();
        break;
      case 'm':
        this.toggleSound();
        break;
    }
  }

  /**
   * Handle direction input
   * @param {object} direction
   */
  handleDirectionInput(direction) {
    if (!this.game) return;

    const gameState = this.game.getState();

    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
      this.game.start();
    } else if (gameState === GAME_STATES.PLAYING) {
      this.game.changeDirection(direction);
    }
  }

  /**
   * Handle space key press
   */
  handleSpaceKey() {
    if (!this.game) return;

    const gameState = this.game.getState();

    if (gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER) {
      this.game.start();
    } else if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
      this.game.togglePause();
    }
  }

  /**
   * Handle start button (mobile)
   */
  handleStartButton() {
    if (!this.game) return;
    
    const gameState = this.game.getState();
    
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
      this.game.togglePause();
    } else {
      this.game.start();
    }
  }

  /**
   * Handle select button (mobile)
   */
  handleSelectButton() {
    if (!this.game) return;
    this.game.start();
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    if (this.soundManager) {
      const isMuted = this.soundManager.toggleMute();
      this.updateSoundButton();

      if (!isMuted) {
        this.soundManager.play('buttonClick');
      }
    }
  }

  /**
   * Update sound button appearance
   */
  updateSoundButton() {
    const soundIcon = this.elements.soundToggle?.querySelector('.sound-icon');
    if (soundIcon && this.soundManager) {
      soundIcon.textContent = this.soundManager.getMuted() ? '🔇' : '🔊';
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const newDeviceType = DeviceDetector.getDeviceType();

    if (newDeviceType !== this.deviceType) {
      this.deviceType = newDeviceType;
      this.setupDevice();

      if (this.game) {
        this.game.setupCanvas();
      }
    }
  }

  /**
   * Get game instance
   * @returns {SnakeGame}
   */
  getGame() {
    return this.game;
  }

  /**
   * Get sound manager instance
   * @returns {SoundManager}
   */
  getSoundManager() {
    return this.soundManager;
  }

  /**
   * Check if app is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.keyboardHandler);

    // Remove touch handlers
    this.touchHandlers.forEach((handler, element) => {
      element.removeEventListener('touchstart', handler);
      element.removeEventListener('click', handler);
    });
    this.touchHandlers.clear();

    // Cleanup game
    if (this.game) {
      this.game.destroy();
    }

    // Cleanup sound
    if (this.soundManager) {
      this.soundManager.destroy();
    }
  }
}

/* ==========================================================================
   Application Initialization
   ========================================================================== */
let app = null;

/**
 * Initialize application when DOM is ready
 */
function initializeApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      app = new SnakeApp();
    });
  } else {
    app = new SnakeApp();
  }
}

/**
 * Get application instance
 * @returns {SnakeApp}
 */
function getApp() {
  return app;
}

/* ==========================================================================
   Error Handling
   ========================================================================== */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);

  // Show user-friendly error message
  const errorMessage = 'An error occurred. Please refresh the page to continue.';
  alert(errorMessage);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

/* ==========================================================================
   Performance Monitoring
   ========================================================================== */
if ('performance' in window && 'measure' in performance) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
      }
    }, 0);
  });
}

/* ==========================================================================
   Service Worker Registration (Optional)
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    /*
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    */
  });
}

/* ==========================================================================
   Initialize Application
   ========================================================================== */
initializeApp();
