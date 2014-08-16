(function(){
	window.FrameTimer = function(){
		this._frames = [];
		this._fps = 0;
		
		var self = this;
		
		// Calculates FPS by sampling previous frames. Keep trask of the last 30
		// frameTime values, when we have 30 we take the average and use it to
		// calculate the frame rate.
		this.update = function(frameTime){
			var frames = self._frames;
			frames.push(frameTime);
			if(frames.length > 30)
			{
				frames.shift();
			}
			
			if(frames.length == 30){
				var total = 0;
				var numFrames = self._frames.length;
				for(var i=0; i<numFrames; ++i){
					total += frames[i];
				}
				self._fps = Math.round(1000/(total/numFrames));
				frames.length = 0;
			}
		}
		
		this.draw = function(ctx){
			ctx.fillStyle = '#fff';
			ctx.font = '12px Arial';
			ctx.fillText(self._fps+' fps', 2, 12);
		}
	}
})();