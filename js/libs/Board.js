'use strict'

var Board = (function() {
   var boardObject = {
     resolution: 2,
     dom: null,
     ctx: null,
     domMem: null,
     ctxMem: null,
     bgColor: '#ffffff',  // Original white background
     pos: {
       x: 0,
       y: 0
     },
     loadToMemory: function loadToMemory(event) {
       var imageObj = event.target;
       this.domMem.width = imageObj.width;
       this.domMem.height = imageObj.height;
       this.ctxMem.drawImage(imageObj, 0, 0);
       this.ctx.drawImage(imageObj, 0, 0);
     },
     init: function init(canvasId) {
       this.dom = document.getElementById(canvasId);
       this.ctx = this.dom.getContext('2d', {desynchronized: true});

       // Additional Configuration
       this.ctx.imageSmoothingEnabled = true;

       // Create buffer
       this.domMem = document.createElement('canvas');
       this.ctxMem = this.domMem.getContext('2d');
       this.ctxMem.fillStyle = this.bgColor;
       this.ctxMem.fillRect(0, 0, this.domMem.width, this.domMem.height);

       // Load canvas from local storage
       if (localStorage.dataURL) {
         var img = new window.Image();
         img.addEventListener('load', this.loadToMemory.bind(this));
         img.setAttribute('src', localStorage.dataURL);
       }
     },
     getPointerPos: function getPointerPos(event) {
      const rect = this.dom.getBoundingClientRect();  // Get the canvas's exact position relative to the viewport
      return {
        x: event.clientX - rect.left,  // Adjust the pen's position based on the bounding rectangle
        y: event.clientY - rect.top    // Align based on client coordinates relative to the canvas
      };
    },
    
     storeMemory: function storeMemory() {
       this.ctxMem.drawImage(this.dom, 0, 0);
       localStorage.setItem('dataURL', this.domMem.toDataURL());
     },
     clearMemory: function clearMemory() {
       localStorage.clear();
       this.ctx.fillStyle = this.bgColor;
       this.ctx.fillRect(0, 0, this.dom.width, this.dom.height);
       this.domMem.width = this.dom.width;
       this.domMem.height = this.dom.height;
       this.ctxMem.fillStyle = this.bgColor;
       this.ctxMem.fillRect(0, 0, this.dom.width, this.dom.height);
     }
   };

   return boardObject;
})();
