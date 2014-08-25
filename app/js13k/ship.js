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
		var self = this;
		
		options = options || {};
		self.x = options.x || 0;
		self.y = options.y || 0;
		self._bounds = options.bounds || {left: 0, right: 0};
		
		self._rotation = 0;
		self._acceleration = 0.2;
		self._maxSpeed = 5;
		self._motion = 0;
		self._drag = 0.05;
		self._lastFired = 0;
		
		// Update the position of the ship based on frameTime
		self.update = function(frameTime, delta){
			
			self.updateRotor(delta);
			self.updateMovement(delta);
			self.updateGun(delta);
			
			// Should we fire?
			var lastFired = self._lastFired;
			lastFired += frameTime;
			if(Input.fire()){
				if(lastFired > 90){
					self.fire();
					lastFired = 0;
				}
				self._lastFired = lastFired;
			}
		}
		
		self.updateGun = function(delta){
			var mouse = Input.mouse()
			var diff = {
				x: mouse.x - self.x,
				y: mouse.y - self.y
			};
			
			var theta = Math.atan2(-diff.y, diff.x);
			
			if(theta < 0)
				theta += 2 * Math.PI;
			
			gunAngle = theta;
		}
		
		self.updateRotor = function(delta){
			var rotation = self._rotation;
			rotation -= (FULL_CIRCLE/30) * delta;
			if(rotation < -FULL_CIRCLE){
				rotation += FULL_CIRCLE;
			}
			self._rotation = rotation;
		}
		
		self.updateMovement = function(delta){
			var acceleration = self._acceleration * delta;
			var drag = self._drag * delta;
			var maxSpeed = self._maxSpeed;// * delta;
			
			var motion = self._motion;// * delta;
			var bounds = self._bounds;
			
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
					motion = 0;
				}
			}
			
			// Calculate the new x position while respecting bounds
			var newX = self.x + (motion * delta);
			// var newX = this.x + motion;
			if(newX > bounds.right){
				motion = 0;
				newX = bounds.right;
			}else if(newX < bounds.left){
				motion = 0;
				newX = bounds.left;
			}
			
			// Update the x position
			self.x = newX;
			
			// Store the current motion for next time
			self._motion = motion;
		}
		
		// Draw the helicopter
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			ctx.fillStyle = 'rgba(0, 0, 0, 1)';
			
			self.drawGun(ctx);
			
			// ctx.fillStyle = 'rgba(0, 0, 0, 1)'
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
			}, true, true, true);
			
			self.drawRoter(ctx);
		}
		
		self.drawGun = function(ctx){
			var x = self.x;
			var y = self.y + 10;
			var end = {
				x: (x + 20 * Math.cos(gunAngle)),
				y: (y + 20 * -Math.sin(gunAngle))
			};
			
			ctx.beginPath();
			ctx.moveTo(end.x, end.y);
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.drawRoter = function(ctx){
			var x = self.x;
			var y = self.y+40;
			var rotation = self._rotation;
			
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
		
		self.fire = function(){
			// effects.play('gun');
			
			self.assetList.add(new Bullet({
				x: self.x,
				y: self.y+10,
				angle: gunAngle
			}));
		}
	}
})();