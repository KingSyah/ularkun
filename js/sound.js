/**
 * Snake Classic - Sound Manager
 * © 2025 KingSyah
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = StorageUtils.getItem('soundMuted', false);
        this.volume = StorageUtils.getItem('soundVolume', 0.5);
        this.isInitialized = false;
        
        // Initialize audio context on first user interaction
        this.initPromise = null;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound effects using Web Audio API
            this.createSounds();
            
            this.isInitialized = true;
            console.log('Sound system initialized');
        } catch (error) {
            console.warn('Failed to initialize audio:', error);
            this.isInitialized = false;
        }
    }
    
    createSounds() {
        // Create different sound effects
        this.sounds = {
            eat: this.createTone(800, 0.1, 'square'),
            move: this.createTone(200, 0.05, 'sine'),
            gameOver: this.createGameOverSound(),
            levelUp: this.createLevelUpSound(),
            pause: this.createTone(400, 0.2, 'triangle'),
            click: this.createTone(600, 0.05, 'square')
        };
    }
    
    createTone(frequency, duration, waveType = 'sine') {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = waveType;
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Failed to play tone:', error);
            }
        };
    }
    
    createGameOverSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            try {
                // Descending tone sequence for game over
                const frequencies = [400, 350, 300, 250, 200];
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(this.audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        oscillator.type = 'sawtooth';
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                        
                        oscillator.start(this.audioContext.currentTime);
                        oscillator.stop(this.audioContext.currentTime + 0.3);
                    }, index * 100);
                });
            } catch (error) {
                console.warn('Failed to play game over sound:', error);
            }
        };
    }
    
    createLevelUpSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            try {
                // Ascending tone sequence for level up
                const frequencies = [400, 500, 600, 800];
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(this.audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                        oscillator.type = 'triangle';
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                        
                        oscillator.start(this.audioContext.currentTime);
                        oscillator.stop(this.audioContext.currentTime + 0.2);
                    }, index * 80);
                });
            } catch (error) {
                console.warn('Failed to play level up sound:', error);
            }
        };
    }
    
    async play(soundName) {
        // Initialize audio context on first play (user interaction required)
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (this.sounds[soundName] && !this.isMuted) {
            try {
                // Resume audio context if suspended
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                
                this.sounds[soundName]();
            } catch (error) {
                console.warn(`Failed to play sound ${soundName}:`, error);
            }
        }
    }
    
    setMuted(muted) {
        this.isMuted = muted;
        StorageUtils.setItem('soundMuted', muted);
        
        // Update UI
        this.updateSoundButtons();
    }
    
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        StorageUtils.setItem('soundVolume', this.volume);
    }
    
    getVolume() {
        return this.volume;
    }
    
    isSoundMuted() {
        return this.isMuted;
    }
    
    updateSoundButtons() {
        const soundButtons = document.querySelectorAll('#soundToggle, #soundToggleMobile');
        const icon = this.isMuted ? '🔇' : '🔊';
        
        soundButtons.forEach(button => {
            if (button) {
                const iconElement = button.querySelector('.sound-icon') || button;
                iconElement.textContent = icon;
                button.setAttribute('aria-label', this.isMuted ? 'Unmute Sound' : 'Mute Sound');
            }
        });
    }
    
    // Preload sounds for better performance
    preloadSounds() {
        if (!this.isInitialized) return;
        
        // Create silent sounds to preload
        Object.keys(this.sounds).forEach(soundName => {
            try {
                // Create but don't play
                if (this.audioContext) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.001);
                }
            } catch (error) {
                // Ignore preload errors
            }
        });
    }
    
    // Clean up audio context
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.sounds = {};
        this.isInitialized = false;
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// Initialize sound system on first user interaction
document.addEventListener('click', async () => {
    if (!soundManager.isInitialized) {
        await soundManager.init();
        soundManager.updateSoundButtons();
    }
}, { once: true });

document.addEventListener('touchstart', async () => {
    if (!soundManager.isInitialized) {
        await soundManager.init();
        soundManager.updateSoundButtons();
    }
}, { once: true });

document.addEventListener('keydown', async () => {
    if (!soundManager.isInitialized) {
        await soundManager.init();
        soundManager.updateSoundButtons();
    }
}, { once: true });

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager, soundManager };
}
