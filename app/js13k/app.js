// IDEAS:
// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway
// to give hte effect of motion, paralax etc.

(function(){
	
	var SPAWN_TIME = 2000;
	
	var scoreBoard;
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		var bounds = {
			top: 0,
			right: game.width,
			bottom: game.height,
			left: 0
		};
		
		assets.add(new Background({
			width: game.width,
			height: game.height
		}));
		assets.add(new FrameTimer());
		
		scoreBoard = new ScoreBoard({
			bounds: bounds
		});
		assets.add(scoreBoard);
		assets.add(new Ship({
			x: game.width/2,
			y: game.height-135,
			bounds: bounds
		}));
	}
	
	// The time that has passed since the last enemy was spawned
	var enemyTime = 0;
	
	// Update anything in addition to registered assets
	var update = function(frameTime){
		
		// Spawn enemies as time passes
		enemyTime += frameTime;
		if(enemyTime > SPAWN_TIME){
			enemyTime -= SPAWN_TIME;
			game.assets.add(new Enemy({
				x: (Math.random() * (game.width-40)) + 20,
				y: -20,
				bounds: {
					top: -20,
					right: game.width,
					bottom: game.height+20,
					left: 0
				}
			}));
		}
		
		// Run through each bullet and check for collisions with
		// each enemy
		var bullets = window.Bullet.instances;
		var enemies = window.Enemy.instances;
		for(var i=0; i<bullets.length; ++i){
			var bullet = bullets[i];
			for(var r=0; r<enemies.length; ++r){
				var enemy = enemies[r];
				if(bullet.hits(enemy)){
					enemy.destroy();
					bullet.destroy();
					scoreBoard.score += 10;
				}
			}
		}
	}
	
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