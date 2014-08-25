(function(){
	window.FrameTimer = function(){
		this._frames = [];
		this._graph = [];
		this._fps = 0;
		
		// Calculates FPS by sampling previous frames. Keep trask of the last 30
		// frameTime values, when we have 30 we take the average and use it to
		// calculate the frame rate.
		this.update = function(frameTime, delta){
			var frames = this._frames;
			var graph = this._graph;
			
			frames.push(frameTime);
			
			if(frames.length == 5){
				var total = 0;
				var numFrames = this._frames.length;
				for(var i=0; i<numFrames; ++i){
					total += frames[i];
				}
				this._fps = Math.round(1000/(total/numFrames));
				frames.length = 0;
				
				graph.push(this._fps);
				if(graph.length > 200) graph.shift();
			}
		}
		
		this.draw = function(ctx){
			ctx.fillStyle = '#fff';
			ctx.font = '12px Arial';
			ctx.fillText(this._fps+' fps', 4, 27);
			
			var tx = {x: 50, y: 0};
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			drawShape(ctx, [
				[0, 0],
				[0, 40],
				[200, 40],
				[200, 0],
				[0, 0]
			], tx);
			
			var graph = this._graph;
			var points = [];//[[0, 40]];
			for(var i=0; i<graph.length; ++i){
				points.push([i, 40-(graph[i]/2)]);
			}
			ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
			if(points.length) drawShape(ctx, points, tx);

		}
	}
})();