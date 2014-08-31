(function(){
	window.Enemy = function(options){
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
				self.assetList.remove(self);
			}
		}
		
		self.draw = function(ctx){
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			drawCircle(ctx, self.x, self.y, 10);
		}
		
		self.destroy = function(){}
	}
})();