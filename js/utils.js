/**
 * Snake Classic - Utility Functions
 * © 2025 KingSyah
 */

// Device detection utilities
const DeviceUtils = {
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },
    
    isTouch: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    getDeviceType: () => {
        if (DeviceUtils.isMobile()) {
            return 'mobile';
        }
        return 'desktop';
    }
};

// Local storage utilities
const StorageUtils = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    getItem: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },
    
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    }
};

// Game state management
const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
};

// Direction constants
const Direction = {
    UP: { x: 0, y: -1, key: 'ArrowUp' },
    DOWN: { x: 0, y: 1, key: 'ArrowDown' },
    LEFT: { x: -1, y: 0, key: 'ArrowLeft' },
    RIGHT: { x: 1, y: 0, key: 'ArrowRight' }
};

// Game configuration
const GameConfig = {
    // Canvas settings
    CANVAS_SIZE: 400,
    MOBILE_CANVAS_SIZE: 280,
    GRID_SIZE: 20,
    
    // Game mechanics
    INITIAL_SNAKE_LENGTH: 3,
    INITIAL_SPEED: 150, // milliseconds
    SPEED_INCREASE_PER_LEVEL: 10,
    MIN_SPEED: 80,
    
    // Scoring
    FOOD_SCORE: 10,
    LEVEL_BONUS_MULTIPLIER: 1.5,
    
    // Level progression
    FOOD_PER_LEVEL: 5,
    MAX_LEVEL: 10,
    
    // Colors
    COLORS: {
        SNAKE_HEAD: '#00ff00',
        SNAKE_BODY: '#00cc00',
        FOOD: '#ff4444',
        BACKGROUND: '#1a1a1a',
        GRID: '#2a2a2a'
    },
    
    // Mobile colors (GameBoy style) - Modern Cool Theme
    MOBILE_COLORS: {
        SNAKE_HEAD: '#3498db',
        SNAKE_BODY: '#2980b9',
        FOOD: '#e74c3c',
        BACKGROUND: '#1a252f',
        GRID: '#34495e'
    }
};

// Utility functions
const Utils = {
    // Generate random position within grid
    randomPosition: (gridSize, canvasSize) => {
        const max = Math.floor(canvasSize / gridSize);
        return {
            x: Math.floor(Math.random() * max),
            y: Math.floor(Math.random() * max)
        };
    },
    
    // Check if two positions are equal
    positionsEqual: (pos1, pos2) => {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    },
    
    // Check if position is within bounds
    isInBounds: (position, gridSize, canvasSize) => {
        const max = Math.floor(canvasSize / gridSize);
        return position.x >= 0 && position.x < max && 
               position.y >= 0 && position.y < max;
    },
    
    // Calculate game speed based on level
    calculateSpeed: (level) => {
        const speed = GameConfig.INITIAL_SPEED - (level - 1) * GameConfig.SPEED_INCREASE_PER_LEVEL;
        return Math.max(speed, GameConfig.MIN_SPEED);
    },
    
    // Calculate score with level bonus
    calculateScore: (baseScore, level) => {
        return Math.floor(baseScore * Math.pow(GameConfig.LEVEL_BONUS_MULTIPLIER, level - 1));
    },
    
    // Format number with leading zeros
    formatScore: (score, digits = 6) => {
        return score.toString().padStart(digits, '0');
    },
    
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for input handling
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Get opposite direction
    getOppositeDirection: (direction) => {
        const opposites = {
            [Direction.UP.key]: Direction.DOWN,
            [Direction.DOWN.key]: Direction.UP,
            [Direction.LEFT.key]: Direction.RIGHT,
            [Direction.RIGHT.key]: Direction.LEFT
        };
        return opposites[direction.key] || direction;
    },
    
    // Check if direction change is valid (not opposite)
    isValidDirectionChange: (currentDirection, newDirection) => {
        const opposite = Utils.getOppositeDirection(currentDirection);
        return newDirection.key !== opposite.key;
    },
    
    // Generate food position that doesn't collide with snake
    generateFoodPosition: (snake, gridSize, canvasSize) => {
        let position;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            position = Utils.randomPosition(gridSize, canvasSize);
            attempts++;
        } while (
            attempts < maxAttempts && 
            snake.some(segment => Utils.positionsEqual(segment, position))
        );
        
        return position;
    },
    
    // Update copyright year automatically
    updateCopyrightYear: () => {
        const currentYear = new Date().getFullYear();
        const yearElements = document.querySelectorAll('#currentYear, #currentYearMobile');
        yearElements.forEach(element => {
            if (element) {
                element.textContent = currentYear;
            }
        });
    },
    
    // Animate element
    animateElement: (element, animation, duration = 300) => {
        element.style.animation = `${animation} ${duration}ms ease`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    },
    
    // Show/hide element with animation
    toggleElement: (element, show, animationClass = 'fade') => {
        if (show) {
            element.classList.remove('hidden');
            element.classList.add(animationClass);
        } else {
            element.classList.add('hidden');
            element.classList.remove(animationClass);
        }
    },
    
    // Vibrate device (mobile)
    vibrate: (pattern = [100]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },
    
    // Request fullscreen (mobile)
    requestFullscreen: (element = document.documentElement) => {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    },
    
    // Exit fullscreen
    exitFullscreen: () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// Event emitter for game events
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Performance monitor
const PerformanceMonitor = {
    frameCount: 0,
    lastTime: 0,
    fps: 0,
    
    update: (currentTime) => {
        PerformanceMonitor.frameCount++;
        
        if (currentTime - PerformanceMonitor.lastTime >= 1000) {
            PerformanceMonitor.fps = PerformanceMonitor.frameCount;
            PerformanceMonitor.frameCount = 0;
            PerformanceMonitor.lastTime = currentTime;
        }
    },
    
    getFPS: () => PerformanceMonitor.fps
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DeviceUtils,
        StorageUtils,
        GameState,
        Direction,
        GameConfig,
        Utils,
        EventEmitter,
        PerformanceMonitor
    };
}
