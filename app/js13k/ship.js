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
		this._bounds = options.bounds || {left: 0, right: 0};
		
		this._rotation = 0;
		this._acceleration = 0.2;
		this._maxSpeed = 5;
		this._motion = 0;
		this._drag = 0.01;
		this._lastFired = 0;
		
		// Update the position of the ship based on frameTime
		this.update = function(frameTime){
			var delta = (1/17)*frameTime;
			this.updateRotor(delta);
			this.updateMovement(delta);
			
			// Should we fire?
			var lastFired = this._lastFired;
			lastFired += frameTime;
			// console.log(lastFired);
			if(Input.fire()){
				if(lastFired > 90){
					this.fire();
					lastFired = 0;
				}
				this._lastFired = lastFired;
			}
		}
		
		this.updateRotor = function(delta){
			var rotation = this._rotation;
			rotation -= (FULL_CIRCLE/30) * delta;
			if(rotation < -FULL_CIRCLE){
				rotation += FULL_CIRCLE;
			}
			this._rotation = rotation;
		}
		
		this.updateMovement = function(delta){
			var acceleration = this._acceleration * delta;
			var drag = this._drag * delta;
			var maxSpeed = this._maxSpeed * delta;
			
			var motion = this._motion * delta;
			var bounds = this._bounds;
			
			// Capture movement inputs
			var userInput = false;
			if(Input.right()){
				motion += acceleration;
				userInput = true;
			}
			if(Input.left()){
				motion -= acceleration;
				userInput = true;
			}
			
			// Limmit the max speed
			motion = Math.max(-maxSpeed, Math.min(maxSpeed, motion));
			
			// Apply drag if we're not actively moving
			var stoppedByDrag = false;
			if(!userInput){
				if(motion > drag){
					motion -= drag;
				}else if(motion < -drag){
					motion += drag;
				}else{
					stoppedByDrag = true;
				}
			}
			
			// Calculate the new x position while respecting bounds
			var newX = this.x + (motion * delta);
			if(newX > bounds.right){
				motion = 0;
				newX = bounds.right;
			}else if(newX < bounds.left){
				motion = 0;
				newX = bounds.left;
			}
			
			// Update the x position
			this.x = newX;
			
			// If we've been stopped by drag taking us to zero
			// then set motion to zero after x has been updated.
			if(stoppedByDrag) motion = 0;
			
			// Store the current motion for next time
			this._motion = motion;
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
			}, true);
			
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