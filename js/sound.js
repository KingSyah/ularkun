/**
 * Snake Classic - Sound System
 * Lightweight sound effects using Web Audio API and HTML5 Audio
 */

/* ==========================================================================
   Sound Manager Class
   ========================================================================== */
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.isMuted = StorageManager.load('soundMuted', false);
    this.volume = StorageManager.load('soundVolume', 0.7);
    this.isInitialized = false;
    
    this.initializeAudioContext();
    this.createSounds();
  }

  /**
   * Initialize Web Audio Context
   */
  initializeAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
      this.isInitialized = false;
    }
  }

  /**
   * Create sound effects using oscillators
   */
  createSounds() {
    // Sound definitions with frequency and duration
    const soundDefinitions = {
      eat: {
        frequency: 800,
        duration: 0.1,
        type: 'square',
        volume: 0.3
      },
      move: {
        frequency: 200,
        duration: 0.05,
        type: 'square',
        volume: 0.1
      },
      gameOver: {
        frequencies: [400, 300, 200, 100],
        duration: 0.5,
        type: 'sawtooth',
        volume: 0.5
      },
      levelUp: {
        frequencies: [523, 659, 784, 1047],
        duration: 0.2,
        type: 'sine',
        volume: 0.4
      },
      pause: {
        frequency: 440,
        duration: 0.15,
        type: 'triangle',
        volume: 0.3
      },
      resume: {
        frequency: 660,
        duration: 0.15,
        type: 'triangle',
        volume: 0.3
      },
      buttonClick: {
        frequency: 1000,
        duration: 0.05,
        type: 'square',
        volume: 0.2
      }
    };

    // Create sounds based on definitions
    Object.entries(soundDefinitions).forEach(([name, config]) => {
      this.sounds.set(name, config);
    });
  }

  /**
   * Play a sound effect
   * @param {string} soundName 
   */
  play(soundName) {
    if (this.isMuted || !this.sounds.has(soundName)) {
      return;
    }

    const soundConfig = this.sounds.get(soundName);

    if (this.isInitialized && this.audioContext) {
      this.playWithWebAudio(soundConfig);
    } else {
      this.playWithHTMLAudio(soundName, soundConfig);
    }
  }

  /**
   * Play sound using Web Audio API
   * @param {object} config 
   */
  playWithWebAudio(config) {
    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const { frequency, frequencies, duration, type, volume } = config;
      const now = this.audioContext.currentTime;

      if (frequencies) {
        // Play sequence of frequencies (for complex sounds)
        frequencies.forEach((freq, index) => {
          const startTime = now + (index * duration / frequencies.length);
          this.createOscillator(freq, duration / frequencies.length, type, volume * this.volume, startTime);
        });
      } else {
        // Play single frequency
        this.createOscillator(frequency, duration, type, volume * this.volume, now);
      }
    } catch (error) {
      console.warn('Web Audio playback failed:', error);
    }
  }

  /**
   * Create and play oscillator
   * @param {number} frequency 
   * @param {number} duration 
   * @param {string} type 
   * @param {number} volume 
   * @param {number} startTime 
   */
  createOscillator(frequency, duration, type, volume, startTime) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = type;

    // Create envelope for smoother sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Fallback to HTML5 Audio (generates tones programmatically)
   * @param {string} soundName 
   * @param {object} config 
   */
  playWithHTMLAudio(soundName, config) {
    // Create a simple beep sound using data URI
    const { frequency, duration } = config;
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(samples * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 * this.volume;
      const intSample = Math.floor(sample * 32767);
      view.setInt16(i * 2, intSample, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.volume = this.volume;
    audio.play().catch(error => {
      console.warn('HTML5 Audio playback failed:', error);
    });

    // Clean up
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    StorageManager.save('soundMuted', this.isMuted);
    return this.isMuted;
  }

  /**
   * Set volume level
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = MathUtils.clamp(volume, 0, 1);
    StorageManager.save('soundVolume', this.volume);
  }

  /**
   * Get current mute state
   * @returns {boolean}
   */
  getMuted() {
    return this.isMuted;
  }

  /**
   * Get current volume
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Play eating sound with pitch variation
   */
  playEat() {
    if (this.isMuted) return;
    
    const baseConfig = this.sounds.get('eat');
    const pitchVariation = MathUtils.randomInt(-100, 100);
    const modifiedConfig = {
      ...baseConfig,
      frequency: baseConfig.frequency + pitchVariation
    };
    
    if (this.isInitialized && this.audioContext) {
      this.playWithWebAudio(modifiedConfig);
    } else {
      this.playWithHTMLAudio('eat', modifiedConfig);
    }
  }

  /**
   * Play game over sound sequence
   */
  playGameOver() {
    if (this.isMuted) return;
    
    const config = this.sounds.get('gameOver');
    this.play('gameOver');
    
    // Add dramatic pause effect
    setTimeout(() => {
      if (!this.isMuted) {
        this.play('gameOver');
      }
    }, 600);
  }

  /**
   * Play level up fanfare
   */
  playLevelUp() {
    if (this.isMuted) return;
    
    this.play('levelUp');
    
    // Add echo effect
    setTimeout(() => {
      if (!this.isMuted) {
        this.play('levelUp');
      }
    }, 300);
  }

  /**
   * Initialize sound system (call after user interaction)
   */
  initialize() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.sounds.clear();
  }
}

/* ==========================================================================
   Global Sound Manager Instance
   ========================================================================== */
let soundManager = null;

/**
 * Get or create sound manager instance
 * @returns {SoundManager}
 */
function getSoundManager() {
  if (!soundManager) {
    soundManager = new SoundManager();
  }
  return soundManager;
}

/**
 * Initialize sound system
 */
function initializeSound() {
  const manager = getSoundManager();
  manager.initialize();
  return manager;
}
