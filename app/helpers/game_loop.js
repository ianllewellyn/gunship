(function(){
	
	// Get the current time in ms
	var time = function(){
		return new Date().getTime();
	}
	
	// A simple game loop
	//
	// {
	// 		update: function(frameTime){}
	// 		draw: function(frameTime){}
	// 		fps: 30
	// 		canvas: Canvas
	// }
	window.GameLoop = function(options){
		
		// Store options we want
		this.initialize = options.initialize || function(){}
		this.update = options.update || function(){};
		this.draw = options.draw || function(){};
		this.fps = options.fps || 30;
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.assets = [];
		
		self = this;
		
		// Start the game loop
		// Initialize the game and draw the initial frame.
		this.start = function(){
			self.lastFrame = time();
			self.initialize(self.assets);
			self._drawFrame();
		}
		
		// Draw a frame of the game. Update all assets then draw them.
		this._drawFrame = function(){
			var now = time();
			self.frameTime = frameTime = now-self.lastFrame;
			self.frameRate = Math.floor(1000/self.frameTime);
			self.lastFrame = now;
			
			// Update each of the assets then call the update callback.
			// frameTime is passed into the update call so assets know how long
			// since the last frame was updated and don't have to manage it themselves.
			self.assets.forEach(function(asset){
				if(asset.update){
					asset.update(frameTime);
				}
			});
			// Also call the update callback for non-asset
			self.update(frameTime);
			
			// Clear the canvas before calling draw() on each asset
			// followed by the draw callback
			self.ctx.clearRect(0, 0, 400, 400);
			self.assets.forEach(function(asset){
				if(asset.draw){
					asset.draw(self.ctx);
				}
			});
			// Also call the draw callback for non-asset
			self.draw(self.ctx);
			
			// Request the next frame draw
			requestAnimationFrame(self._drawFrame);
		}
	}
})();