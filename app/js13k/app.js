// IDEAS:
// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway
// to give hte effect of motion, paralax etc.

(function(){
	
	var gunAngle = 0;
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		assets.add(new Background({
			width: game.width,
			height: game.height
		}));
		assets.add(new FrameTimer());
		assets.add(new Ship({
			x: game.width/2,
			y: game.height-135,
			bounds: {
				top: 0,
				right: game.width,
				bottom: game.height,
				left: 0
			}
		}));
	}
	
	// Update anything in addition to registered assets
	var update = function(frameTime){}
	
	// Draw anything in addition to registered assets
	var draw = function(ctx){}
	
	// Start the game loop
	var game = new GameLoop({
		canvas: $('#canvas'),
		initialize: initialize,
		update: update,
		draw: draw
		// ,fps: 30
	});
	game.start();
})();