(function(){
	window.Ship = function(options){
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.width = options.width || 100;
		this.height = options.height || 20;
		this.speed = options.speed || 1;
		
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
	}
})();