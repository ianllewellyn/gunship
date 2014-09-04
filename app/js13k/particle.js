(function(){
	window.Particle = function(options){
		window.Particle.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.speedVariation = options.speedVariation || 0;
		self.angleVariation = options.angleVariation || 0;
		self.lifeVariation = options.lifeVariation || 200;
		self.bounds = options.bounds;
		
		// Add the angle variation
		var angleAdjust = (Math.random() * self.angleVariation) - (self.angleVariation / 2);
		var angle = self.angle = options.angle + angleAdjust;
		
		// Apply the speed variation
		var speedAdjust = (Math.random() * self.speedVariation) - (self.speedVariation / 2);
		self.speed = (options.speed || 10) + speedAdjust;
		
		// Apply life variatino
		var lifeAdjust = (Math.random() * self.lifeVariation) - (self.lifeVariation / 2);
		self.life = (options.life || 300) + lifeAdjust;
		
		// Calculate the cos and sin values once up front based on the
		// initial angle. The angle wont change here once created so no
		// need to re-calculate each update.
		self._cos = Math.cos(angle);
		self._sin = -Math.sin(angle);
		
		self._age = 0;
		
		self.update = function(frameTime, delta){
			self.speed -= (0.05 * delta);
			var speed = self.speed * delta;
			var bounds = self.bounds;
			
			// Update origin based on the angle
			var x = self.x += speed * self._cos;
			var y = self.y += speed * self._sin;
			
			// Remove if we have traveled out of bounds
			if(x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom){
				self.destroy();
			}
			
			// Remove if we've been alive too long
			self._age += frameTime;
			if(self._age > self.life)
				self.destroy();
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			var opacity = 1-((1/self.life) * self._age);
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, '+opacity+')';
			ctx.beginPath();
			ctx.moveTo((x + 10 * self._cos), (y + 10 * self._sin));
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.destroy = function(){
			window.Particle.instances.splice(window.Bullet.instances.indexOf(self), 1);
			self.assetList.remove(self);
		}
	}
	
	window.Particle.instances = [];
})();