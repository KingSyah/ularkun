# 🐍 Snake Classic - Modern Retro Game

A modern, responsive implementation of the classic Snake game with dual-mode design: sleek modern interface for PC and nostalgic Game Boy style for mobile devices.

## ✨ Features

### 🎮 Dual Mode Design
- **PC Mode**: Modern dark theme with glowing effects and smooth animations
- **Mobile Mode**: Authentic Game Boy-inspired design with proper screen and controls layout
- **Responsive**: Automatically detects device and switches between layouts seamlessly

### 🎵 Audio System
- Lightweight sound effects using Web Audio API
- Dramatic audio feedback for game events
- Mute/unmute functionality with persistent settings
- Fallback to HTML5 Audio for older browsers

### 🎯 Game Features
- Classic Snake gameplay mechanics
- Progressive difficulty with level system
- High score persistence using localStorage
- Pause/resume functionality
- Smooth animations and transitions
- Collision detection and game physics

### 📱 Controls
#### PC Controls
- **Arrow Keys**: Move snake (↑↓←→)
- **Spacebar**: Pause/Resume game
- **R Key**: Restart game
- **M Key**: Toggle sound

#### Mobile Controls (Game Boy Style)
- **D-Pad**: Circular touch controls for snake movement
- **START Button**: Pause/Resume game
- **SELECT Button**: Restart game
- **Screen Controls**: Sound toggle and pause buttons in screen area

### 🔧 Technical Features
- **Modern JavaScript**: ES6+ features with proper error handling
- **Web Audio API**: High-quality sound generation
- **Canvas Rendering**: Smooth 60fps gameplay
- **Device Detection**: Automatic mobile/desktop detection
- **Performance Optimized**: Efficient game loop and rendering
- **Accessibility**: Keyboard navigation and ARIA labels
- **PWA Ready**: Service worker support (optional)

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (for development)

### Installation
1. Clone or download the project files
2. Start a local web server in the project directory:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### File Structure
```
snake-classic/
├── index.html          # Main HTML file
├── css/
│   └── main.css        # Responsive styles
├── js/
│   ├── utils.js        # Utility functions
│   ├── sound.js        # Audio system
│   ├── game.js         # Game logic
│   └── main.js         # App initialization
└── README.md           # Documentation
```

## 🎨 Design Philosophy

### Mobile-First Approach
The game uses a mobile-first responsive design strategy, ensuring optimal experience across all devices.

### Game Boy Aesthetic
Mobile devices display the game with an authentic Game Boy color palette:
- **Background**: `#9bbc0f` (Game Boy green)
- **Dark Elements**: `#0f380f` (Dark green)
- **Medium Elements**: `#306230` (Medium green)
- **Screen**: Classic LCD green appearance

### Modern PC Design
Desktop displays feature a contemporary dark theme:
- **Background**: Dark gradients with subtle lighting
- **Snake**: Bright green with glow effects
- **UI**: Modern typography with smooth transitions

## 🔊 Audio System

### Sound Effects
- **Eat**: Pitched beep when consuming food
- **Move**: Subtle movement feedback (optional)
- **Game Over**: Dramatic descending tone sequence
- **Level Up**: Ascending fanfare
- **Pause/Resume**: UI feedback tones
- **Button Click**: Touch feedback for mobile

### Technical Implementation
- Primary: Web Audio API with oscillator-generated tones
- Fallback: HTML5 Audio with programmatically generated sounds
- Volume control and mute functionality
- Persistent audio preferences

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Game Boy theme activated */
  /* Touch controls visible */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Hybrid interface */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Modern theme with hover effects */
  /* Keyboard controls only */
}
```

## 🎯 Game Mechanics

### Scoring System
- **Food**: 10 points per item
- **Level Bonus**: 100 points per level
- **Level Up**: Every 5 food items consumed

### Difficulty Progression
- **Speed**: Increases by 10ms reduction per level
- **Minimum Speed**: 50ms (maximum difficulty)
- **Visual Feedback**: Level indicator and speed changes

### Collision Detection
- **Wall Collision**: Game ends when snake hits boundaries
- **Self Collision**: Game ends when snake hits itself
- **Food Collision**: Snake grows and score increases

## 🛠️ Development

### Code Structure
The application follows a modular architecture:

- **`utils.js`**: Device detection, DOM utilities, math helpers
- **`sound.js`**: Audio management and sound generation
- **`game.js`**: Core game logic and rendering
- **`main.js`**: Application initialization and control handling

### Performance Optimizations
- **RequestAnimationFrame**: Smooth 60fps game loop
- **Canvas Optimization**: Efficient rendering techniques
- **Event Delegation**: Optimized event handling
- **Debounced Resize**: Performance-friendly responsive updates

### Browser Compatibility
- **Modern Browsers**: Full feature support
- **Legacy Support**: Graceful degradation for older browsers
- **Mobile Browsers**: Touch-optimized interface
- **Accessibility**: Screen reader and keyboard navigation support

## 🎮 Gameplay Tips

1. **Start Slow**: Begin with careful movements to build length
2. **Plan Ahead**: Think several moves in advance
3. **Use Walls**: Navigate close to walls for better control
4. **Corner Strategy**: Use corners to change direction safely
5. **Pause Feature**: Use pause to plan difficult maneuvers

## 🔧 Customization

### Modifying Game Settings
Edit `GAME_CONFIG` in `js/game.js`:
```javascript
const GAME_CONFIG = {
  GRID_SIZE: 20,           // Size of each grid cell
  INITIAL_SPEED: 150,      // Starting speed (ms)
  SPEED_INCREMENT: 10,     // Speed increase per level
  POINTS_PER_FOOD: 10,     // Points per food item
  POINTS_PER_LEVEL: 100,   // Bonus points per level
  LEVEL_UP_THRESHOLD: 5    // Food items needed to level up
};
```

### Styling Customization
Modify CSS custom properties in `css/main.css`:
```css
:root {
  --primary-bg: #0a0a0a;     /* Background color */
  --accent-text: #00ff00;    /* Snake and UI accent */
  --canvas-size: 400px;      /* Game canvas size */
  /* ... more variables */
}
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 👑 Copyright

© 2025 KingSyah. All rights reserved.

---

**Enjoy playing Snake Classic!** 🐍🎮
