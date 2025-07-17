/**
 * Snake Classic - Main Application
 * © 2025 KingSyah
 */

// Global game instance
let game = null;

// Application initialization
class App {
    constructor() {
        this.isInitialized = false;
        this.loadingScreen = null;
        this.loadingProgress = null;
        this.deviceType = DeviceUtils.getDeviceType();
        
        // Initialize app
        this.init();
    }
    
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize components step by step
            await this.initializeComponents();
            
            // Setup device-specific layout
            this.setupDeviceLayout();
            
            // Update copyright year
            Utils.updateCopyrightYear();
            
            // Initialize game
            this.initializeGame();
            
            // Register service worker for PWA
            await this.registerServiceWorker();

            // Hide loading screen
            await this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('Snake Classic initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load game. Please refresh the page.');
        }
    }
    
    showLoadingScreen() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    }
    
    async hideLoadingScreen() {
        return new Promise((resolve) => {
            if (this.loadingScreen) {
                // Animate progress to 100%
                if (this.loadingProgress) {
                    this.loadingProgress.style.width = '100%';
                }
                
                setTimeout(() => {
                    this.loadingScreen.classList.add('hidden');
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        });
    }
    
    updateLoadingProgress(percentage) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${percentage}%`;
        }
    }
    
    async initializeComponents() {
        const steps = [
            { name: 'Device Detection', action: () => this.detectDevice() },
            { name: 'Sound System', action: () => this.initializeSound() },
            { name: 'Input System', action: () => this.initializeInput() },
            { name: 'UI Components', action: () => this.initializeUI() },
            { name: 'Game Assets', action: () => this.loadGameAssets() }
        ];
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            console.log(`Initializing: ${step.name}`);
            
            try {
                await step.action();
                this.updateLoadingProgress((i + 1) / steps.length * 90); // 90% for components
            } catch (error) {
                console.warn(`Failed to initialize ${step.name}:`, error);
            }
            
            // Small delay for smooth loading animation
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    detectDevice() {
        this.deviceType = DeviceUtils.getDeviceType();
        console.log(`Device detected: ${this.deviceType}`);

        // Add device class to body
        document.body.classList.add(`device-${this.deviceType}`);

        // Set viewport for mobile
        if (this.deviceType === 'mobile') {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content',
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
                );
            }

            // Debug scroll capability
            console.log('Mobile device detected - scroll should be enabled');
            console.log('Body overflow-y:', window.getComputedStyle(document.body).overflowY);
            console.log('HTML overflow-y:', window.getComputedStyle(document.documentElement).overflowY);
            console.log('Document height:', document.documentElement.scrollHeight);
            console.log('Window height:', window.innerHeight);

            // Test scroll after a delay
            setTimeout(() => {
                this.testScrollCapability();
            }, 1000);
        }
    }
    
    async initializeSound() {
        // Sound system will initialize on first user interaction
        soundManager.updateSoundButtons();
    }
    
    initializeInput() {
        // Setup global input handlers
        this.setupGlobalInputHandlers();
        
        // Setup touch event optimization for mobile
        if (this.deviceType === 'mobile') {
            this.optimizeTouchEvents();
        }
    }
    
    setupGlobalInputHandlers() {
        // Prevent default behaviors for game keys
        document.addEventListener('keydown', (event) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
            if (gameKeys.includes(event.code)) {
                event.preventDefault();
            }
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && game && game.isGameRunning() && !game.isGamePaused()) {
                game.pauseGame();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    optimizeTouchEvents() {
        // Prevent zoom on double tap only on game controls
        let lastTouchEnd = 0;
        const gameControlsSelector = '.gameboy-controls, .dpad-btn, .action-btn, .gameboy-btn, canvas';

        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                // Only prevent if touching game controls
                if (event.target.closest(gameControlsSelector)) {
                    event.preventDefault();
                }
            }
            lastTouchEnd = now;
        }, false);

        // Prevent pull-to-refresh only on game area
        document.addEventListener('touchstart', (event) => {
            // Only prevent multi-touch on game controls
            if (event.touches.length > 1 && event.target.closest(gameControlsSelector)) {
                event.preventDefault();
            }
        }, { passive: false });

        // Prevent pinch zoom only on game area
        document.addEventListener('touchmove', (event) => {
            // Only prevent scaling on game controls
            if (event.scale !== 1 && event.target.closest(gameControlsSelector)) {
                event.preventDefault();
            }
        }, { passive: false });

        // Prevent context menu on game controls only
        document.addEventListener('contextmenu', (event) => {
            if (event.target.closest(gameControlsSelector)) {
                event.preventDefault();
            }
        });
    }
    
    initializeUI() {
        // Setup responsive layout
        this.setupResponsiveLayout();
        
        // Initialize UI components
        this.initializeButtons();
        
        // Setup accessibility
        this.setupAccessibility();
    }
    
    setupResponsiveLayout() {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.add(`layout-${this.deviceType}`);
        }
    }
    
    initializeButtons() {
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            this.addRippleEffect(button);
        });
        
        // Add hover effects for desktop
        if (this.deviceType === 'desktop') {
            this.addDesktopHoverEffects();
        }
    }
    
    addRippleEffect(button) {
        button.addEventListener('click', (event) => {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    addDesktopHoverEffects() {
        const interactiveElements = document.querySelectorAll('button, .control-btn, .dpad-btn, .action-btn');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }
    
    setupAccessibility() {
        // Add keyboard navigation support
        this.setupKeyboardNavigation();
        
        // Add screen reader support
        this.setupScreenReaderSupport();
    }
    
    setupKeyboardNavigation() {
        // Tab navigation for buttons
        const focusableElements = document.querySelectorAll('button, [tabindex]');
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index + 1);
        });
    }
    
    setupScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.setAttribute('role', 'application');
            canvas.setAttribute('aria-label', 'Snake Game Canvas');
        }
        
        // Add live region for score updates
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.setAttribute('aria-live', 'polite');
        }
    }
    
    loadGameAssets() {
        // Preload any assets if needed
        // For now, just simulate loading
        return new Promise(resolve => {
            setTimeout(resolve, 200);
        });
    }
    
    setupDeviceLayout() {
        const desktopLayout = document.querySelector('.desktop-layout');
        const gameboyContainer = document.querySelector('.gameboy-container');
        
        if (this.deviceType === 'mobile') {
            if (desktopLayout) desktopLayout.style.display = 'none';
            if (gameboyContainer) gameboyContainer.style.display = 'block';
        } else {
            if (desktopLayout) desktopLayout.style.display = 'block';
            if (gameboyContainer) gameboyContainer.style.display = 'none';
        }
    }
    
    initializeGame() {
        try {
            // Create game instance
            game = new SnakeGame();
            
            // Setup game event listeners
            this.setupGameEventListeners();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
    }
    
    setupGameEventListeners() {
        if (!game) return;
        
        // Listen to game events
        game.on('stateChange', (state) => {
            console.log('Game state changed:', state);
            this.handleGameStateChange(state);
        });
        
        game.on('foodEaten', (data) => {
            console.log('Food eaten:', data);
            this.handleFoodEaten(data);
        });
        
        game.on('levelUp', (level) => {
            console.log('Level up:', level);
            this.handleLevelUp(level);
        });
        
        game.on('gameOver', (data) => {
            console.log('Game over:', data);
            this.handleGameOver(data);
        });
    }
    
    handleGameStateChange(state) {
        // Update UI based on game state
        const pauseButtons = document.querySelectorAll('#pauseBtn, #pauseBtnMobile');
        
        pauseButtons.forEach(button => {
            if (button) {
                const icon = button.querySelector('.pause-icon') || button;
                if (state === GameState.PAUSED) {
                    icon.textContent = '▶️';
                    button.setAttribute('aria-label', 'Resume Game');
                } else {
                    icon.textContent = '⏸️';
                    button.setAttribute('aria-label', 'Pause Game');
                }
            }
        });
    }
    
    handleFoodEaten(data) {
        // Add visual feedback for food eaten
        this.showScorePopup(data.score);
    }
    
    handleLevelUp(level) {
        // Add visual feedback for level up
        this.showLevelUpEffect();
    }
    
    handleGameOver(data) {
        // Handle game over
        console.log(`Game Over! Score: ${data.score}, Level: ${data.level}`);
    }
    
    showScorePopup(score) {
        // Create floating score popup
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-size: 1.5rem;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            animation: scorePopup 1s ease-out forwards;
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    showLevelUpEffect() {
        // Add level up visual effect
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.textContent = 'LEVEL UP!';
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffaa00;
            font-size: 2rem;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            animation: levelUpEffect 2s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }
    
    handleResize() {
        // Handle window resize
        const newDeviceType = DeviceUtils.getDeviceType();
        if (newDeviceType !== this.deviceType) {
            this.deviceType = newDeviceType;
            this.setupDeviceLayout();
            
            // Reinitialize game with new canvas
            if (game) {
                game.destroy();
                this.initializeGame();
            }
        }
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff00;
            color: #000;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            font-family: var(--font-family-primary);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <div>New version available!</div>
            <button onclick="window.location.reload()" style="
                background: #000;
                color: #00ff00;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
            ">Update</button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    testScrollCapability() {
        if (this.deviceType !== 'mobile') return;

        const canScroll = document.documentElement.scrollHeight > window.innerHeight;
        console.log('Can scroll:', canScroll);
        console.log('Scroll height:', document.documentElement.scrollHeight);
        console.log('Window height:', window.innerHeight);

        if (canScroll) {
            console.log('✅ Scroll should work - page is taller than viewport');
        } else {
            console.log('⚠️ Page might not be tall enough to scroll');
        }

        // Test programmatic scroll
        const originalScrollTop = window.pageYOffset;
        window.scrollTo(0, 50);
        setTimeout(() => {
            const newScrollTop = window.pageYOffset;
            if (newScrollTop !== originalScrollTop) {
                console.log('✅ Programmatic scroll works');
            } else {
                console.log('❌ Programmatic scroll blocked');
            }
            window.scrollTo(0, originalScrollTop); // Reset
        }, 100);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes scorePopup {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -70%) scale(1.2); }
    }
    
    @keyframes levelUpEffect {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}

// Export for debugging
window.game = game;
window.soundManager = soundManager;
