(function(){
	window.Background = function(options){
		var self = this;
		
		options = options || {};
		self.width = options.width || 400;
		self.height = options.height || 400;
		
		// Draw the background rect
		self.draw = function(ctx){
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, self.width, self.height);
			
			//REMOVE: Draw the bounds lines
			ctx.beginPath();
			ctx.moveTo(20, 0);
			ctx.lineTo(20, self.height);
			ctx.moveTo(self.width-20, 0);
			ctx.lineTo(self.width-20, self.height);
			ctx.stroke();
		}
	}
})();