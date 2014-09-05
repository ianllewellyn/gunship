(function(){
	window.Enemy = function(options){
		window.Enemy.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.bounds = options.bounds;
		self.speed = options.speed || 2;
		
		self.update = function(frameTime, delta){
			var bounds = self.bounds;
			var y = self.y += (self.speed * delta);
			
			// Remove if we have traveled out of bounds
			if(y < bounds.top || y > bounds.bottom){
				self.destroy()
			}
		}
		
		self.draw = function(ctx){
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			drawCircle(ctx, self.x, self.y, 10);
		}
		
		self.destroy = function(options){
			if(!options) options = {}
			window.Enemy.instances.splice(window.Enemy.instances.indexOf(self), 1);
			self.assetList.remove(self);
			
			// Draw some particles from origin if the explode option
			// is true
			if(options.explode){
				for(var i=0; i<10; ++i){
					self.assetList.add(new Particle({
						x: options.x,
						y: options.y,
						speed: options.speed,
						speedVariation: 2.5,
						angle: options.angle,
						
						angleVariation: 2,
						bounds: self.bounds
					}));
				}
			}
		}
		
		self.getRect = function(){
			return {
				top: self.y-10,
				right: self.x+10,
				bottom: self.y+10,
				left: self.x-10 
			}
		}
	}
	window.Enemy.instances = [];
})();