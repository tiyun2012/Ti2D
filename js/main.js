'use strict'

// Panning state variables
var isPanning = false;     // Whether panning mode is active
var panAnchor = { x: 0, y: 0 };  // The anchor position where the spacebar was pressed
var scrollStart = { left: 0, top: 0 };  // The initial scroll position when panning begins

// Initialise application
Board.init('board');
Pen.init(Board.ctx);
FloatingButton.init();
FloatingButton.onClick = Board.clearMemory.bind(Board);
Pointer.onEmpty = _.debounce(Board.storeMemory.bind(Board), 1500);

// Attach event listener
var pointerDown = function pointerDown(e) {
  if (isPanning) {  // If panning, don't draw but handle panning
    panAnchor = { x: e.clientX, y: e.clientY };  // Anchor at the point where spacebar was pressed
    scrollStart = {
      left: document.getElementById('canvas-container').scrollLeft,
      top: document.getElementById('canvas-container').scrollTop
    };
    document.body.style.cursor = 'grabbing'; // Show panning cursor
    e.preventDefault();  // Prevent other events like text selection
  } else {
    var pointer = new Pointer(e.pointerId);
    pointer.set(Board.getPointerPos(e));
    Pen.setFuncType(e);
    if (Pen.funcType === Pen.funcTypes.menu) Board.clearMemory();
    else drawOnCanvas(e, pointer, Pen);
  }
};

var pointerMove = function pointerMove(e) {
  if (isPanning) {
    // Handle panning logic
    var dx = e.clientX - panAnchor.x;  // Calculate movement from the anchor point
    var dy = e.clientY - panAnchor.y;
    var container = document.getElementById('canvas-container');
    container.scrollLeft = scrollStart.left - dx;  // Scroll relative to the initial position
    container.scrollTop = scrollStart.top - dy;
  } else if (Pen.funcType && (Pen.funcType.indexOf(Pen.funcTypes.draw) !== -1)) {
    // Handle drawing logic with interpolation
    var pointer = Pointer.get(e.pointerId);
    if (pointer) {
      // Get the current pointer position
      var currentPos = Board.getPointerPos(e);

      // If there's a previous position, draw with interpolation
      if (pointer.pos0) {
        drawOnCanvas(e, pointer, Pen);  // Draw line between previous and current position
        interpolateAndDraw(pointer.pos0, currentPos, Board.ctx, Pen);  // Smooth between points
      }

      // Update the previous position to the current position
      pointer.pos0 = currentPos;
    }
  }
};

var pointerCancel = function pointerLeave(e) {
  Pointer.destruct(e.pointerId);
  if (isPanning) {
    document.body.style.cursor = 'default';  // Reset cursor after panning
  }
};

Board.dom.addEventListener('pointerdown', pointerDown);
Board.dom.addEventListener('pointermove', pointerMove);
Board.dom.addEventListener('pointerup', pointerCancel);
Board.dom.addEventListener('pointerleave', pointerCancel);

// Draw method
function drawOnCanvas(e, pointerObj, Pen) {
  if (pointerObj) {
    pointerObj.set(Board.getPointerPos(e));
    Pen.setPen(Board.ctx, e);

    if (pointerObj.pos0.x < 0) {
      pointerObj.pos0.x = pointerObj.pos1.x - 1;
      pointerObj.pos0.y = pointerObj.pos1.y - 1;
    }
    Board.ctx.beginPath();
    Board.ctx.moveTo(pointerObj.pos0.x, pointerObj.pos0.y);
    Board.ctx.lineTo(pointerObj.pos1.x, pointerObj.pos1.y);
    Board.ctx.closePath();
    Board.ctx.stroke();

    pointerObj.pos0.x = pointerObj.pos1.x;
    pointerObj.pos0.y = pointerObj.pos1.y;
  }
}

// Handle keydown and keyup events to toggle panning mode
window.addEventListener('keydown', function (e) {
  if (e.code === 'Space') {
    isPanning = true;
    document.body.style.cursor = 'grab'; // Show grab cursor to indicate panning
    e.preventDefault();  // Prevent default spacebar behavior (e.g., scrolling the page)
  }
});

window.addEventListener('keyup', function (e) {
  if (e.code === 'Space') {
    isPanning = false;
    document.body.style.cursor = 'default';  // Reset cursor to default when spacebar is released
  }
});
