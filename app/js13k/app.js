// IDEAS:
// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway
// to give hte effect of motion, paralax etc.

(function(){
	
	var SPAWN_TIME = 2000;
	
	var scoreBoard, ship;
	
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
		ship = new Ship({
			x: game.width/2,
			y: game.height-135,
			bounds: bounds
		});
		assets.add(ship);
	}
	
	// The time that has passed since the last enemy was spawned
	var enemyTime = 0;
	var _gameOver = false;
	
	// Update anything in addition to registered assets
	var update = function(frameTime){
		
		if(_gameOver)
			return
		
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
		var bullets = Bullet.instances;
		var enemies = Enemy.instances;
		for(var i=bullets.length-1; i>-1; --i){
			var bullet = bullets[i];
			for(var r=enemies.length-1; r>-1; --r){
				var enemy = enemies[r];
				if(bullet.hits(enemy)){
					if(enemy.damage(30)){
						enemy.destroy({
							explode: true,
							angle: bullet.angle,
							speed: bullet.speed * 0.8,
							x: bullet.x,
							y: bullet.y
						});
					}
					bullet.destroy();
					scoreBoard.score += 10;
				}
			}
		}
		
		// Check if the enemy bounds hits the ship
		for(var i=enemies.length-1; i>-1; --i){
			var enemy = enemies[i];
			if(ship.hits(enemy)){
				enemy.destroy({
					explode: true,
					x: enemy.x,
					y: enemy.y,
					speed: 5,
					angle: 0,
					angleVariation: 6.28
				});
				scoreBoard.score += 10;
				
				// Apply the damage to the ship and check if it
				// is dead.
				if(ship.damage(30)){
					gameOver();
					return;
				}
			}
		}
	}
	
	var gameOver = function(){
		_gameOver = true;
		
		// Kill all enemies
		var enemies = Enemy.instances;
		for(var i=enemies.length-1; i>-1; --i){
			var enemy = enemies[i];
			enemy.destroy({
				explode: true,
				x: enemy.x,
				y: enemy.y,
				speed: 5,
				angle: 0,
				angleVariation: 6.28
			});
		}
		
		//TODO: Destroy the ship
		
		//TODO: Show Game Over
		game.assets.add(new GameOver({
			bounds: {
				top: 0,
				right: game.width,
				bottom: game.height,
				left: 0
			},
			score: scoreBoard.score
		}));
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