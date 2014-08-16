(function(){
	
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
		
		// Start the game loop
		this.start = function(){
			this.startTime = new Date().getTime();
			this.lastFrame = this.startTime;
			self = this;
			self.initialize(this.assets);
			
			//TODO: Use requestAnimationFrame() here instead
			// https://github.com/ooflorent/js13k-boilerplate/blob/master/src/raf.js
			setInterval(function(){
				var now = new Date().getTime();
				self.frameTime = frameTime = now-self.lastFrame;
				self.frameRate = Math.floor(1000/self.frameTime);
				self.lastFrame = now;
				
				// Update each of the assets then call the update callback
				self.assets.forEach(function(asset){
					if(asset.update){
						asset.update(frameTime);
					}
				});
				self.update(frameTime);
				
				// Clear the canvas before calling draw() on each asset
				// followed by the draw callback
				self.ctx.clearRect(0, 0, 400, 400)
				self.assets.forEach(function(asset){
					if(asset.draw){
						asset.draw(self.ctx);
					}
				});
				self.draw(self.ctx);
			}, 1000/this.fps);
		}
	}
})();