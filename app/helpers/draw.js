(function(){
	// Helper method to draw a shape from an array of points
	window.drawShape = function(ctx, points, tx, mirror, stroke, fill){
		if(!tx){
			tx = {x: 0, y: 0};
		}
		if(mirror == undefined){
			mirror = false;
		}
		if(fill == undefined){
			fill = false;
		}
		if(stroke == undefined){
			stroke = false;
		}
		
		ctx.beginPath();
		ctx.moveTo(tx.x+points[0][0], tx.y+points[0][1]);
		
		// Each half, first the supplied path, then run through the points
		// again backwards and draw a mirror.
		for(var i=1; i<points.length; ++i){
			ctx.lineTo(tx.x+points[i][0], tx.y+points[i][1]);
		}
		if(mirror){
			for(var i=points.length-1; i>-1; --i){
				ctx.lineTo(tx.x+(-points[i][0]), tx.y+points[i][1]);
			}
		}
		
		// Apply line styles
		// ctx.closePath();
		if (fill)
			ctx.fill();
		if (stroke)
			ctx.stroke();
	}
	
	// Helper function for drawing circles
	window.drawCircle = function(ctx, x, y, r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.stroke();
	}
	
	// Helper function for drawing arcs
	window.drawArc = function(ctx, x, y, rotation, start, end){
		ctx.beginPath();
		ctx.arc(x, y, rotation, start, end);
		ctx.stroke();
	}
	
})();