// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway.

(function(){
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		assets.push(new Background({
			width: gameLoop.width,
			height: gameLoop.height
		}));
		assets.push(new Ship({
			x: gameLoop.width/2,
			y: gameLoop.height/2
		}));
	}
	
	// Update anything in addition to registered assets
	var update = function(frameTime){}
	
	// Draw anything in addition to registered assets
	var draw = function(ctx){
		drawFrameTime(ctx);
	}
	
	// Draw the frame time counter
	var drawFrameTime = function(ctx){
		ctx.fillStyle = '#fff';
		ctx.font = '12px Arial';
		ctx.fillText(gameLoop.frameRate+' fps', 2, 12);
	}
	
	// Start the game loop
	var gameLoop = new GameLoop({
		canvas: $('#canvas'),
		initialize: initialize,
		update: update,
		draw: draw,
		fps: 30
	});
	gameLoop.start();
	
})();