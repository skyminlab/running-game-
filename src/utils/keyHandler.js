// Anti-cheating keyboard handler
// Prevents key auto-repeat by requiring key release before next press

export class KeyHandler {
  constructor() {
    this.keyStates = new Map();
    this.listeners = new Map();
    this.minInterval = 100; // Minimum 100ms between presses
  }

  // Register a key handler
  onKey(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
      this.keyStates.set(key, { pressed: false, lastPress: 0 });
    }
    this.listeners.get(key).push(callback);
  }

  // Remove key handler
  offKey(key, callback) {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Handle keydown
  handleKeyDown(e) {
    const key = this.normalizeKey(e.key);
    if (!this.listeners.has(key)) return;

    const now = Date.now();
    const keyState = this.keyStates.get(key);

    // Prevent auto-repeat: must release key first
    if (keyState.pressed) {
      return; // Key is still pressed, ignore
    }

    // Check minimum interval
    if (now - keyState.lastPress < this.minInterval) {
      return;
    }

    // Mark as pressed
    keyState.pressed = true;
    keyState.lastPress = now;

    // Call all listeners
    this.listeners.get(key).forEach(callback => {
      callback(e);
    });
  }

  // Handle keyup
  handleKeyUp(e) {
    const key = this.normalizeKey(e.key);
    if (this.keyStates.has(key)) {
      this.keyStates.get(key).pressed = false;
    }
  }

  // Normalize key name
  normalizeKey(key) {
    if (key === ' ') return 'Space';
    // Convert to uppercase for letters
    if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
      return key.toUpperCase();
    }
    // Handle arrow keys
    if (key.startsWith('Arrow')) return key;
    // Handle other special keys
    if (key === 'Enter') return 'Enter';
    if (key === 'Shift') return 'Shift';
    return key;
  }

  // Start listening
  start() {
    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.keyUpHandler = (e) => this.handleKeyUp(e);
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  // Stop listening
  stop() {
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler);
    }
    this.keyStates.clear();
    this.listeners.clear();
  }

  // Reset all key states
  reset() {
    this.keyStates.forEach(state => {
      state.pressed = false;
      state.lastPress = 0;
    });
  }
}

