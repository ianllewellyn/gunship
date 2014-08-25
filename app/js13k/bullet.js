(function(){
	window.Bullet = function(options){
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.speed = options.speed || 20;
		self.variation = options.variation || 0;
		
		// Add a random variance to the angle of the bullet so they
		// don't follow each other exactly.
		var angleAdjust = (Math.random() * self.variation) - (self.variation / 2);
		var angle = self.angle = options.angle + angleAdjust;
		
		// Calculate the cos and sin values once up front based on the
		// initial angle. The angle wont change here once created so no
		// need to re-calculate each update.
		self._cos = Math.cos(angle);
		self._sin = -Math.sin(angle);
		
		self.update = function(frameTime, delta){
			
			// Update origin based on the angle
			var x = self.x += 10 * self._cos;
			var y = self.y += 10 * self._sin;
			
			// Remove from the assetList if we're off screen
			if(x < 0 || x > 500 || y < 0 || y > 550){
				self.assetList.remove(self);
			}
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.moveTo((x + 20 * self._cos), (y + 20 * self._sin));
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.destroy = function(){}
	}
})();