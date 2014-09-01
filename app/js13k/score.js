(function(){
	window.ScoreBoard = function(options){
		var self = this;
		
		self.bounds = options.bounds;
		self.score = 0;
		
		self.update = function(frameTime, delta){}
		
		self.draw = function(ctx){
			ctx.fillStyle = '#fff';
			ctx.font = '12px Arial';
			ctx.fillText(self.score, self.bounds.right-30, 30);
		}
	}
})();