/**
 * Snake Classic - Utility Functions
 * Helper functions and utilities for the game
 */

/* ==========================================================================
   Game Constants
   ========================================================================== */
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
   Device Detection Utilities
   ========================================================================== */
const DeviceDetector = {
  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 767;
  },

  /**
   * Check if device is tablet
   * @returns {boolean}
   */
  isTablet() {
    return /iPad|Android/i.test(navigator.userAgent) && 
           window.innerWidth >= 768 && window.innerWidth <= 1023;
  },

  /**
   * Check if device supports touch
   * @returns {boolean}
   */
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get device type
   * @returns {string} 'mobile', 'tablet', or 'desktop'
   */
  getDeviceType() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }
};

/* ==========================================================================
   Local Storage Utilities
   ========================================================================== */
const StorageManager = {
  /**
   * Save data to localStorage
   * @param {string} key 
   * @param {any} data 
   */
  save(key, data) {
    try {
      localStorage.setItem(`snake_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`snake_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   * @param {string} key 
   */
  remove(key) {
    try {
      localStorage.removeItem(`snake_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  /**
   * Clear all game data from localStorage
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('snake_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

/* ==========================================================================
   DOM Utilities
   ========================================================================== */
const DOMUtils = {
  /**
   * Get element by ID
   * @param {string} id 
   * @returns {HTMLElement|null}
   */
  $(id) {
    return document.getElementById(id);
  },

  /**
   * Query selector
   * @param {string} selector 
   * @returns {HTMLElement|null}
   */
  select(selector) {
    return document.querySelector(selector);
  },

  /**
   * Query selector all
   * @param {string} selector 
   * @returns {NodeList}
   */
  selectAll(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * Create element with optional className
   * @param {string} tag 
   * @param {string} className 
   * @returns {HTMLElement}
   */
  create(tag, className = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  },

  /**
   * Add event listener with optional options
   * @param {HTMLElement} element 
   * @param {string} event 
   * @param {Function} handler 
   * @param {object} options 
   */
  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
  },

  /**
   * Remove event listener
   * @param {HTMLElement} element 
   * @param {string} event 
   * @param {Function} handler 
   */
  off(element, event, handler) {
    element.removeEventListener(event, handler);
  },

  /**
   * Toggle class on element
   * @param {HTMLElement} element 
   * @param {string} className 
   * @param {boolean} force 
   */
  toggleClass(element, className, force) {
    element.classList.toggle(className, force);
  },

  /**
   * Add class to element
   * @param {HTMLElement} element 
   * @param {string} className 
   */
  addClass(element, className) {
    element.classList.add(className);
  },

  /**
   * Remove class from element
   * @param {HTMLElement} element 
   * @param {string} className 
   */
  removeClass(element, className) {
    element.classList.remove(className);
  },

  /**
   * Check if element has class
   * @param {HTMLElement} element 
   * @param {string} className 
   * @returns {boolean}
   */
  hasClass(element, className) {
    return element.classList.contains(className);
  }
};

/* ==========================================================================
   Math Utilities
   ========================================================================== */
const MathUtils = {
  /**
   * Generate random integer between min and max (inclusive)
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Clamp value between min and max
   * @param {number} value 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Linear interpolation
   * @param {number} start 
   * @param {number} end 
   * @param {number} t 
   * @returns {number}
   */
  lerp(start, end, t) {
    return start + (end - start) * t;
  },

  /**
   * Check if two rectangles collide
   * @param {object} rect1 
   * @param {object} rect2 
   * @returns {boolean}
   */
  rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  },

  /**
   * Calculate distance between two points
   * @param {number} x1 
   * @param {number} y1 
   * @param {number} x2 
   * @param {number} y2 
   * @returns {number}
   */
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
};

/* ==========================================================================
   Performance Utilities
   ========================================================================== */
const PerformanceUtils = {
  /**
   * Debounce function
   * @param {Function} func 
   * @param {number} wait 
   * @returns {Function}
   */
  debounce(func, wait) {
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

  /**
   * Throttle function
   * @param {Function} func 
   * @param {number} limit 
   * @returns {Function}
   */
  throttle(func, limit) {
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

  /**
   * Request animation frame with fallback
   * @param {Function} callback 
   * @returns {number}
   */
  requestAnimFrame(callback) {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
             window.setTimeout(callback, 1000 / 60);
           };
  }
};

/* ==========================================================================
   Validation Utilities
   ========================================================================== */
const ValidationUtils = {
  /**
   * Check if value is a number
   * @param {any} value 
   * @returns {boolean}
   */
  isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Check if value is a string
   * @param {any} value 
   * @returns {boolean}
   */
  isString(value) {
    return typeof value === 'string';
  },

  /**
   * Check if value is an object
   * @param {any} value 
   * @returns {boolean}
   */
  isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  /**
   * Check if value is an array
   * @param {any} value 
   * @returns {boolean}
   */
  isArray(value) {
    return Array.isArray(value);
  },

  /**
   * Check if value is a function
   * @param {any} value 
   * @returns {boolean}
   */
  isFunction(value) {
    return typeof value === 'function';
  }
};
