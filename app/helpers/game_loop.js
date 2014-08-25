(function(){
	
	// A collection for managing assets in the game loop.
	var AssetList = function(){
		var self = this;
		
		self._assets = [];
		
		// Add an asset
		self.add = function(asset){
			asset.assetList = self;
			self._assets.push(asset);
		}
		
		// Remove an asset
		self.remove = function(asset){
			var i = self._assets.indexOf(asset);
			if(i > -1){
				asset.destroy();
				self._assets.splice(i, 1);
			}
		}
		
		// Update all assets
		self.update = function(frameTime, delta){
			self._assets.forEach(function(asset){
				if(asset.update)
					asset.update(frameTime, delta);
			});
		}
		
		// Draw all assets
		self.draw = function(ctx){
			self._assets.forEach(function(asset){
				if(asset.draw)
					asset.draw(ctx);
			});
		}
	};
	
	// A simple game loop
	//
	// {
	// 		canvas: Canvas
	// 		initialize: function(assets){}
	// 		update: function(frameTime){}
	// 		draw: function(ctx){}
	//		fps: int
	// }
	window.GameLoop = function(options){
		var self = this;
		
		// Pick what we want from options passed in
		self.initialize = options.initialize || function(){}
		self.update = options.update || function(){};
		self.draw = options.draw || function(){};
		self.canvas = options.canvas;
		self.fps = options.fps;
		self.ctx = self.canvas.getContext('2d');
		self.width = self.canvas.width;
		self.height = self.canvas.height;
		// self.assets = [];
		self.assets = new AssetList();
		
		// Start the game loop
		// Initialize the game and draw the initial frame.
		self.start = function(){
			self.initialize(self.assets);
			self.then = performance.now();
			requestAnimationFrame(self._drawFrame);
		}
		
		self.then = 0;
		if(self.fps)
			self._interval = 1000 / self.fps;
		
		// Draw a frame of the game. Update all assets then draw them.
		self._drawFrame = function(now){
			
			// Request the next frame draw
			requestAnimationFrame(self._drawFrame);
			
			var frameTime = now - self.then;
			// This is a frame rate limiter for testing. If there is a target fps
			// then we make sure that we don't update and draw assets more often than
			// the target fps. Crude but ok for testing. It can't be used to lock to 30FPS
			// for example, you MIGHT get 30FPS, but more likely it will be less.
			if(!self.fps || frameTime > self._interval){
				
				if(self.fps){
					self.then = now - (frameTime % self._interval);
				}else{
					self.then = now;
				}
				
				// Work out the delta based on a 60FPS Target.
				// Code it written to run at 60FPS so elements need to change their behaviour
				// and speed based on the actual running frame rate. Delta is a multiplier
				// that allows them to do that.
				var delta = (60/1000) * frameTime;
				
				// Update each of the assets then call the update callback.
				// frameTime is passed into the update call so assets know how long
				// since the last frame was updated and don't have to manage it themselves.
				// self.assets.forEach(function(asset){
				// 	if(asset.update)
				// 		asset.update(frameTime, delta);
				// });
				self.assets.update(frameTime, delta);
				self.update(frameTime, delta);
				
				// Clear the canvas before calling draw() on each asset
				self.ctx.clearRect(0, 0, 400, 400);
				self.assets.draw(self.ctx);
				self.draw(self.ctx);
			}
		}
	}
})();