(function(){
	
	var FULL_CIRCLE = 2*Math.PI;
	var HALF_CIRCLE = FULL_CIRCLE/2;
	var QUARTER_CIRCLE = FULL_CIRCLE/4;
	var FIFTH_CIRCLE = FULL_CIRCLE/5;
	
	// Drawing positions don't change so calculate them once up front
	var INNER_ROTOR_1_POS = (QUARTER_CIRCLE * 3);
	var INNER_ROTOR_2_POS = QUARTER_CIRCLE;
	var OUTER_ROTOR_1_POS = 0;
	var OUTER_ROTOR_2_POS = HALF_CIRCLE;
	
	// Helper function for drawing circles
	var drawCircle = function(ctx, x, y, r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.stroke();
	}
	
	// Helper function for drawing arcs
	var drawArc = function(ctx, x, y, rotation, start, end){
		ctx.beginPath();
		ctx.arc(x, y, rotation, start, end);
		ctx.stroke();
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
		if(options.bounds){
			bounds = {
				left: options.bounds.left+8,
				right: options.bounds.right-8
			}
		}else{
			bounds = {
				left: 0,
				right: 0
			}
		}
		this._bounds = bounds;
		
		this._rotation = 0;
		this._acceleration = 0.3;
		this._maxSpeed = 5;
		this._motion = 0;
		this._drag = 0.1;
		
		// Privates
		this._lastFired = 0;
		
		// Update the position of the ship based on frameTime
		this.update = function(frameTime){
			var delta = frameTime/10;
			var acceleration = this._acceleration*delta;
			var drag = this._drag*delta;
			var maxSpeed = this._maxSpeed;
			var motion = this._motion;
			var rotation = this._rotation;
			var lastFired = this._lastFired;
			var bounds = this._bounds;
			
			// Update the roter rotation value by multiplying the delta
			rotation -= (FULL_CIRCLE/50)*delta;
			if(rotation < -FULL_CIRCLE){
				rotation += FULL_CIRCLE;
			}
			this._rotation = rotation;
			
			// Capture movement inputs
			var moving = false;
			if(Input.right()){
				motion += acceleration;
				moving = true;
			}
			if(Input.left()){
				motion -= acceleration;
				moving = true;
			}
			
			// Apply drag
			if(moving){
				motion = Math.max(-maxSpeed, Math.min(maxSpeed, motion));
			}else{
				
				//TODO: If the helicopter is moved to the edge of it's bounds then push it away
				// if we're not actively moving into it.
				
				
				if(motion > drag){
					motion -= drag;
				}else if(motion < -drag){
					motion += drag;
				}else{
					motion = 0;
				}
			}
			
			this.x = Math.max(bounds.left, Math.min(bounds.right, this.x + motion));
			this._motion = motion;
			
			// Should we trigger a fire?
			lastFired += frameTime;
			if(Input.fire()){
				if(lastFired > 90){
					this.fire();
					lastFired = 0;
				}
				this._lastFired = lastFired;
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
			var y = this.y+40;
			var rotation = this._rotation;
			
			// Apply the rotation value to the rotor line positions
			var innerRotor1Pos = INNER_ROTOR_1_POS + rotation;
			var innerRotor2Pos = INNER_ROTOR_2_POS + rotation;
			var outerRotor1Pos = OUTER_ROTOR_1_POS + rotation;
			var outerRotor2Pos = OUTER_ROTOR_2_POS + rotation;
			
			// Central hub
			drawCircle(ctx, x, y, 2);
			
			// Inner blade trail
			drawArc(ctx, x, y, 11, innerRotor1Pos, innerRotor1Pos + FIFTH_CIRCLE);
			drawArc(ctx, x, y, 13, innerRotor2Pos, innerRotor2Pos + FIFTH_CIRCLE);
			
			// Outer blade trail
			drawArc(ctx, x, y, 55, outerRotor1Pos, outerRotor1Pos + FIFTH_CIRCLE);
			drawArc(ctx, x, y, 60, outerRotor2Pos, outerRotor2Pos + FIFTH_CIRCLE);
		}
		
		this.fire = function(){
			effects.play('gun');
		}
	}
})()