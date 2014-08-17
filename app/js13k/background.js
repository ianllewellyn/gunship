(function(){
	window.Background = function(options){
		options = options || {};
		this.width = options.width || 400;
		this.height = options.height || 400;
		
		// Draw the background rect
		this.draw = function(ctx){
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, this.width, this.height);
			
			//REMOVE: Draw the bounds lines
			ctx.beginPath();
			ctx.moveTo(20, 0);
			ctx.lineTo(20, this.height);
			ctx.moveTo(this.width-20, 0);
			ctx.lineTo(this.width-20, this.height);
			ctx.stroke();
		}
	}
})();