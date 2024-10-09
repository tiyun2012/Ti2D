'use strict'

var Pen = (function() {
  var pen = {
    colors: {
      fg: '#64005c',  // Default drawing color
      bg: '#FFF'      // Eraser color (background color)
    },
    lineWidth: 4,  // Default brush size (for both drawing and erasing)
    type: 'mouse',
    lineJoin: 'round',
    funcType: null,
    funcTypes: {
      draw: 'draw',
      erase: 'draw erase',
      // Removed 'menu' since we are disabling Ctrl + clear functionality
      // menu: 'menu'
    },
    init: function init(context) {
      context.lineJoin = this.lineJoin;
      context.lineWidth = this.lineWidth;
      context.strokeStyle = this.colors.fg;  // Set the brush color initially

      // Add event listener to the slider for dynamic brush size (used for both drawing and erasing)
      var slider = document.getElementById('brush-size-slider');
      slider.addEventListener('input', function() {
        pen.lineWidth = slider.value;  // Update brush size based on slider value
      });

      // Add event listener to the color picker for dynamic brush color
      var colorPicker = document.getElementById('color-picker');
      colorPicker.addEventListener('input', function() {
        pen.colors.fg = colorPicker.value;  // Update brush color based on the picker value
      });
    },
    set: function set(context, config) {
      context.lineWidth = config.lineWidth;
      context.strokeStyle = config.color;
      context.lineJoin = this.lineJoin;
    },
    setFuncType: function setFuncType(pointerEvent) {
      // Removed checkMenuKey, so Ctrl + click doesn't trigger the menu/clear
      // Check for erase or draw functionality only
      if (checkEraseKeys(pointerEvent)) {
        this.funcType = this.funcTypes.erase;
      } else {
        this.funcType = this.funcTypes.draw;
      }
      return this.funcType;
    },
    setPen: function setPen(context, pointerEvent) {
      switch(this.funcType) {
        case this.funcTypes.erase: {
          // Dynamic eraser size based on the same brush size slider
          this.set(context, {
            color: this.colors.bg,  // Set to background color (eraser)
            lineWidth: this.lineWidth  // Dynamic eraser size
          });
          break;
        }
        case this.funcTypes.draw: {
          this.set(context, {
            color: this.colors.fg,  // Use the selected drawing color
            lineWidth: this.lineWidth  // Dynamic brush size for drawing
          });
          break;
        }
      }
    },
    release: function release() {
      this.funcType = null;
    }
  }

  // Removed checkMenuKey since we no longer need it for Ctrl + clear functionality

  var checkEraseKeys = function checkEraseKeys(e) {
    if (e.buttons === 32) return true;
    else if (e.buttons === 1 && e.shiftKey) return true;
    return false;
  }

  return pen;
})();
