(function(){
	window.FrameTimer = function(){
		var self = this;
		
		self._frames = [];
		self._graph = [];
		self._fps = 0;
		
		// Calculates FPS by sampling previous frames. Keep trask of the last 30
		// frameTime values, when we have 30 we take the average and use it to
		// calculate the frame rate.
		self.update = function(frameTime, delta){
			var frames = self._frames;
			var graph = self._graph;
			
			frames.push(frameTime);
			
			if(frames.length == 5){
				var total = 0;
				var numFrames = self._frames.length;
				for(var i=0; i<numFrames; ++i){
					total += frames[i];
				}
				self._fps = Math.round(1000/(total/numFrames));
				frames.length = 0;
				
				graph.push(self._fps);
				if(graph.length > 200) graph.shift();
			}
		}
		
		self.draw = function(ctx){
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			ctx.font = '12px Arial';
			ctx.textAlign = 'left';
			ctx.fillText(self._fps+' fps', 4, 27);
			
			var graph = self._graph;
			var points = [];
			for(var i=0; i<graph.length; ++i){
				points.push([i, 40-(graph[i]/2)]);
			}
			ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
			if(points.length){
				drawShape(ctx, points, {x: 50, y: 0}, false, true);
			}
		}
	}
})();