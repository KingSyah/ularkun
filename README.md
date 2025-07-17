# Snake Classic - Modern Retro Game

🐍 A modern, responsive Snake game with dual-mode layout (PC & Mobile) built with vanilla HTML, CSS, and JavaScript.

## Features

### 🎮 Dual Mode Gaming
- **PC Mode**: Keyboard controls with responsive desktop layout
- **Mobile Mode**: GameBoy-style interface with touch controls

### 📱 Responsive Design
- Automatically detects device type
- Optimized layouts for different screen sizes
- Touch-friendly controls for mobile devices

### 🎯 Progressive Level System
- 10 levels with increasing difficulty
- Speed increases with each level
- Score multiplier based on level
- 5 food items per level to advance

### 🎵 Sound System
- Web Audio API-based sound effects
- Retro-style beeps and tones
- Mute/unmute functionality
- Persistent sound preferences

### 🏆 Game Features
- High score tracking (localStorage)
- Pause/resume functionality
- Game over detection
- Collision detection
- Smooth animations

## Controls

### PC Mode
- **Arrow Keys** (↑↓←→): Move snake
- **Space**: Pause/Resume or Start game
- **R**: Restart game
- **M**: Toggle sound

### Mobile Mode
- **D-Pad**: Move snake (↑↓←→)
- **START**: Pause/Resume or Start game
- **SELECT**: Restart game
- **Sound Button**: Toggle sound
- **⛶ Button**: Toggle fullscreen mode
- **F** or **F11**: Keyboard shortcut for fullscreen

## Technical Details

### Architecture
```
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # Modern responsive styles
├── js/
│   ├── utils.js        # Utility functions and constants
│   ├── sound.js        # Sound management system
│   ├── game.js         # Core game logic
│   └── main.js         # Application initialization
└── README.md           # Documentation
```

### Technologies Used
- **HTML5 Canvas**: Game rendering
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: Game logic and interactions
- **Web Audio API**: Sound effects
- **LocalStorage**: High score persistence

### Additional Features
- **PWA Support**: Installable as mobile app
- **Offline Support**: Service worker for offline gameplay
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Optimized rendering with requestAnimationFrame
- **Visual Effects**: Score popup, level up animations, ripple effects
- **Compact UI**: Streamlined score display for better UX
- **Modern GameBoy Theme**: Cool blue-gray design with blue accents and red buttons
- **Fullscreen Mode**: Immersive fullscreen gaming experience for mobile devices

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers with touch support

## Game Mechanics

### Scoring System
- **Base Score**: 10 points per food
- **Level Multiplier**: Score increases with level (1.5x multiplier)
- **High Score**: Automatically saved and persisted

### Level Progression

#### Desktop Mode
- **Level 1**: Speed 150ms, standard pace
- **Level 2-10**: Speed decreases by 10ms per level
- **Minimum Speed**: 80ms (maximum difficulty)
- **Advancement**: Eat 5 food items to reach next level

#### Mobile Mode (Beginner-Friendly)
- **Level 1**: Speed 250ms, much slower for learning
- **Level 2-10**: Speed decreases by 15ms per level (gradual)
- **Minimum Speed**: 120ms (comfortable maximum)
- **Advancement**: Eat 7 food items to reach next level (more practice)
- **Progress Indicator**: Shows food eaten progress (e.g., "Level 1 (3/7)")
- **Tutorial Hints**: Helpful tips for first-time mobile players

### Collision Detection
- **Wall Collision**: Game ends when snake hits boundaries
- **Self Collision**: Game ends when snake hits itself
- **Food Collision**: Snake grows and score increases

## Installation & Setup

### Local Development
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### Web Server (Optional)
For best performance, serve files through a web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

## Device Detection

The game automatically detects device type and adjusts:

### Mobile Detection
- User agent string analysis
- Screen width detection (≤768px)
- Touch capability detection

### Layout Switching
- **Desktop**: Full-size canvas with keyboard instructions
- **Mobile**: GameBoy-style layout with touch controls
- **Responsive**: Adapts to orientation changes

## Fullscreen Mode (Mobile)

Enhanced mobile gaming experience with immersive fullscreen mode:

### Features
- **True Fullscreen**: Uses Fullscreen API for immersive experience
- **Optimized Layout**: GameBoy container fills entire screen
- **Responsive Canvas**: Auto-adjusts canvas size for optimal viewing
- **Landscape Support**: Special layout for landscape orientation
- **Easy Toggle**: Dedicated button and keyboard shortcuts

### How to Use
1. **Button**: Tap the ⛶ button in the GameBoy screen controls
2. **Keyboard**: Press **F** or **F11** key
3. **Exit**: Tap ⛶ again, press **Escape**, or use device back gesture

### Compatibility
- Requires modern mobile browser with Fullscreen API support
- Automatically hidden if fullscreen is not supported
- Works in both portrait and landscape orientations

## Performance Optimizations

### Rendering
- Canvas-based rendering for smooth graphics
- RequestAnimationFrame for optimal frame rates
- Pixel-perfect rendering with disabled smoothing

### Input Handling
- Debounced resize events
- Throttled input processing
- Touch event optimization for mobile

### Memory Management
- Efficient game loop management
- Proper event listener cleanup
- LocalStorage error handling

## Accessibility Features

### Keyboard Navigation
- Tab navigation support
- ARIA labels and descriptions
- Screen reader compatibility

### Visual Design
- High contrast colors
- Clear visual hierarchy
- Responsive typography

### Mobile Accessibility
- Large touch targets (44px minimum)
- Vibration feedback
- Gesture prevention (zoom, pull-to-refresh)

## Customization

### Game Configuration
Edit `js/utils.js` to modify game settings:

```javascript
const GameConfig = {
    INITIAL_SPEED: 150,        // Starting speed (ms)
    SPEED_INCREASE_PER_LEVEL: 10, // Speed increase per level
    FOOD_PER_LEVEL: 5,         // Food needed to level up
    FOOD_SCORE: 10,            // Base score per food
    // ... more settings
};
```

### Visual Themes
Modify CSS custom properties in `css/style.css`:

```css
:root {
    --primary-bg: #0a0a0a;     /* Background color */
    --accent-text: #00ff00;    /* Snake color */
    --gameboy-bg: #9bbc0f;     /* Mobile theme */
    /* ... more variables */
}
```

## Browser Support

### Required Features
- HTML5 Canvas
- CSS Custom Properties
- ES6 Classes
- Web Audio API (optional)
- LocalStorage (optional)

### Fallbacks
- Graceful degradation for older browsers
- Sound system fails silently if unsupported
- LocalStorage falls back to session storage

## Contributing

### Development Guidelines
1. Follow existing code style and structure
2. Test on both desktop and mobile devices
3. Ensure accessibility compliance
4. Document any new features

### File Structure
- Keep HTML semantic and accessible
- Use CSS custom properties for theming
- Maintain modular JavaScript architecture
- Comment complex game logic

## License

© 2025 KingSyah. All rights reserved.

This project is created for educational and entertainment purposes.

## Credits

- **Design Inspiration**: Classic GameBoy and retro gaming
- **Sound Effects**: Web Audio API synthesized tones
- **Typography**: Courier New (monospace) for retro feel
- **Color Scheme**: Modern dark theme with green accents for desktop, cool blue-gray GameBoy theme for mobile

---

**Enjoy playing Snake Classic!** 🐍🎮

For issues or suggestions, please check the code comments or modify the game configuration to suit your needs.
