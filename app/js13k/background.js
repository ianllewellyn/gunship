(function(){
	
	var drawLine = function(ctx, startX, startY, endX, endY){
	}
	
	var drawGrid = function(ctx, options){
		var bounds = options.bounds;
		var step = options.step;
		var offset = options.offset;
		
		var verticalSteps = Math.floor(bounds.bottom / step);
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(80, 80, 80, 1)';
		ctx.beginPath();
		
		var verticalSteps = Math.floor(bounds.bottom / step);
		for(var i=0; i<verticalSteps; ++i){
			var y = i*step + offset;
			ctx.moveTo(bounds.left, y);
			ctx.lineTo(bounds.right, y);
		}
		ctx.stroke();
	}
	
	window.Background = function(options){
		var self = this;
		
		options = options || {};
		self.width = options.width || 400;
		self.height = options.height || 400;
		
		self.offset = 0;
		
		self.update = function(frameTime, delta){
			self.offset += delta;
			if(self.offset > 50)
				self.offset -= 50;
		}
		
		// Draw the background rect
		self.draw = function(ctx){
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, self.width, self.height);
			
			// Draw a grid on the bg
			drawGrid(ctx, {
				bounds: {
					top: 0,
					right: self.width,
					bottom: self.height,
					left: 0
				},
				step: 50,
				offset: self.offset
			});
		}
	}
})();