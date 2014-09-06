(function(){
	window.GameOver = function(options){
		var self = this;
		
		self.bounds = options.bounds;
		self.score = options.score || 0;
		self.x = self.bounds.right/2;
		self.y = self.bounds.bottom/2-30;
		
		self._framesPassed = 0;
		self.position = 0;
		
		self.update = function(frameTime, delta){
			if(self.position < 1){
				self._framesPassed += frameTime;
				self.position = Math.min(1, (1/500)*self._framesPassed);
				self.y = (self.bounds.bottom/2-30) - (50 - (self.position*50));
			}
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			var opacity = self.position;
			
			ctx.fillStyle = 'rgba(255, 255, 255, '+opacity+')';
			ctx.textAlign = 'center';
			ctx.font = '36px Arial';
			ctx.fillText('Game Over', x, y);
			
			ctx.font = '18px Arial';
			ctx.fillText('Score: '+self.score, x, y+30);
			
			ctx.font = '18px Arial';
			ctx.fillText("Press 'Enter' to try again", x, y+60);
		}
	};
})();