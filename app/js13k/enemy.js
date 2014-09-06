(function(){
	window.Enemy = function(options){
		window.Enemy.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.bounds = options.bounds;
		self.speed = options.speed || 2;
		
		// Health is set to 30 to start for a simple enemy
		self.health = 30;
		
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
			if(!options) options = {};
			if(options.angleVariation === undefined)
				options.angleVariation = 2;
			
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
						angleVariation: options.angleVariation,
						bounds: self.bounds
					}));
				}
			}
		}
		
		// Get the rect of the enemy for collision detection
		self.getRect = function(){
			return {
				top: self.y-10,
				right: self.x+10,
				bottom: self.y+10,
				left: self.x-10 
			}
		}
		
		// Apply damage to the enemy. Returns true if the enemy
		// was killed in the process, false if not.
		self.damage = function(damage){
			return (self.health -= damage) <= 0 ? true : false;
		}
	}
	window.Enemy.instances = [];
})();