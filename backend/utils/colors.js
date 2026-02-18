// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  
  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

// Helper function to apply colors with chaining support
function colorize(str, ...codes) {
  return codes.join('') + str + colors.reset;
}

// Add color methods to String prototype
Object.defineProperty(String.prototype, 'red', {
  get: function() {
    return colorize(this, colors.red);
  }
});

Object.defineProperty(String.prototype, 'green', {
  get: function() {
    return colorize(this, colors.green);
  }
});

Object.defineProperty(String.prototype, 'yellow', {
  get: function() {
    return colorize(this, colors.yellow);
  }
});

Object.defineProperty(String.prototype, 'cyan', {
  get: function() {
    return colorize(this, colors.cyan);
  }
});

Object.defineProperty(String.prototype, 'bold', {
  get: function() {
    // If already has color codes, insert bold before reset
    const str = this.toString();
    if (str.includes('\x1b[')) {
      return str.replace(colors.reset, colors.bright + colors.reset);
    }
    return colorize(this, colors.bright);
  }
});

module.exports = colors;
