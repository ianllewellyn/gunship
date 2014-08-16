(function(){
	
	// Helper function for drawing circles
	var drawCircle = function(ctx, x, y, r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.closePath();
	}
	
	// Helper method to draw a shape from an array of points
	var drawShape = function(ctx, points, tx){
		ctx.beginPath();
		ctx.moveTo(tx.x+points[0][0], tx.y+points[0][1]);
		
		// Each half, first the supplied path, then run through the points
		// again backwards and draw a mirror.
		for(var i=1; i<points.length; ++i){
			ctx.lineTo(tx.x+points[i][0], tx.y+points[i][1]);
		}
		for(var i=points.length-1; i>-1; --i){
			ctx.lineTo(tx.x+(-points[i][0]), tx.y+points[i][1]);
		}
		
		// Apply line styles
		ctx.closePath();
	}
	
	// http://github.grumdrig.com/jsfxr/
	// http://www.superflashbros.net/as3sfxr/
	
	var effects = window.Effects;
	effects.add('gun', 5, [
		[0,,0.22,1,0.08,0.31,0.11,-0.4399,-0.76,,,-0.7,0.27,0.74,-0.3199,,,-0.0444,1,,,,,0.5],
		[0,,0.26,1,0.08,0.29,0.12,-0.4399,-0.76,,,-0.7,0.27,0.74,-0.3199,,,-0.0444,1,,,,,0.5]
	]);
	
	window.Ship = function(options){
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.speed = options.speed || 1;
		
		// Privates
		this._lastFired = 0;
		
		// Update the position of the ship based on frameTime
		this.update = function(frameTime){
			var speed = this.speed;
			var delta = speed*(frameTime/10);
			if(Input.up()){
				this.y -= delta;
			}
			if(Input.right()){
				this.x += delta;
			}
			if(Input.down()){
				this.y += delta;
			}
			if(Input.left()){
				this.x -= delta;
			}
			
			this._lastFired += frameTime;
			if(Input.fire()){
				if(this._lastFired > 100){
					this.fire();
					this._lastFired = 0;
				}
			}
		}
		
		// Draw the ship
		this.draw = function(ctx){
			var x = this.x;
			var y = this.y;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			
			drawShape(ctx, [
				// Cabin
				[0, 0],
				[4, 0],
				[4, 5],
				[6, 9],
				[7, 14],
				[7, 38],
				
				// Hardpoints
				[10, 38],
				[10, 30],
				[14, 30],
				[14, 38],
				[17, 38],
				[17, 30],
				[20, 30],
				
				[20, 47],
				[12, 47],
				[12, 60],
				[6, 64],
				[6, 58],
				[3, 58],
				
				[3, 64],
				[3, 98],
				[2, 100],
				[2, 110],
				
				// Tail
				[15, 110],
				[15, 116],
				[1, 116],
				[1, 125],
				[0, 125]
			], {
				x: x,
				y: y
			});
			ctx.stroke();
			
			this.drawRoter(ctx);
		}
		
		this.drawRoter = function(ctx){
			var x = this.x;
			var y = this.y+38;
			
			drawCircle(ctx, x, y, 60);
			ctx.stroke();
			
			drawCircle(ctx, x, y, 2);
			ctx.stroke();
			
			drawCircle(ctx, x, y, 12);
			ctx.stroke();
		}
		
		this.fire = function(){
			effects.play('gun');
		}
	}
})();