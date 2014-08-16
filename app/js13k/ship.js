(function(){
	
	// http://github.grumdrig.com/jsfxr/
	
	var effects = window.Effects;
	effects.add('powerup', 10, [
		[0,,0.01,,0.4384,0.2,,0.12,0.28,1,0.65,,,0.0419,,,,,1,,,,,0.3]
	]);
	effects.add('laser', 5, [
		// [2,,0.2,,0.1753,0.64,,-0.5261,,,,,,0.5522,-0.564,,,,1,,,,,0.25],
		// [0,,0.16,0.18,0.18,0.47,0.0084,-0.26,,,,,,0.74,-1,,-0.76,,1,,,,,0.15]
		[1,,0.14,0.1931,0.3503,0.5086,0.2,-0.1874,,,,,,0.216,0.0216,,,,1,,,,,0.5]
	]);
	
	window.Ship = function(options){
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.width = options.width || 100;
		this.height = options.height || 20;
		this.speed = options.speed || 1;
		
		// Privates
		this._lastFired = 0;
		
		// Update the position of the ship based on frameTime
		this.update = function(frameTime){
			speed = this.speed;
			delta = speed*(frameTime/10);
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
				if(this._lastFired > 200){
					this.fire();
					this._lastFired = 0;
				}
			}
		}
		
		// Draw the ship on the context passed in
		this.draw = function(ctx){
			var x = this.x-(this.width/2)
			var y = this.y-(this.height/2)
			
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y+this.height);
			ctx.lineTo(x+this.width, y+this.height);
			ctx.lineTo(x+this.width, y);
			ctx.closePath();
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#fff';
			ctx.stroke();
		}
		
		this.fire = function(){
			effects.play('laser');
		}
	}
})();