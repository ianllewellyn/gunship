// IDEAS:
// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway
// to give hte effect of motion, paralax etc.

(function(){
	
	var SPAWN_TIME = 2000;
	
	// The ship
	var ship;
	
	// The score model that we add points to when an enemy is killed
	var scoreModel;
	
	// The time that has passed since the last enemy was spawned
	var enemyTime = 0;
	
	// If we're in the game over state
	var _gameOver = false;
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		
		scoreModel = new ScoreModel();
		
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
		
		assets.add(new FrameTimer({
			bounds: bounds
		}));
		
		assets.add(new ScoreBoard({
			bounds: bounds,
			scoreModel: scoreModel
		}));
		
		ship = assets.add(new Ship({
			x: game.width/2,
			y: game.height-135,
			bounds: bounds
		}));
	}
	
	// Update anything in addition to registered assets
	var update = function(frameTime){
		
		if(_gameOver){
			if(Input.restart()){
				_gameOver = false;
				game.start();
			}
			return;
		}
		
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
				},
				escaped: scoreModel.resetMultiplier
			}));
		}
		
		var bullets = Bullet.instances;
		var enemies = Enemy.instances;
		
		// Run through each enemy to check for both bullet and ship collisions.
		// Doing this in the same loop saves on CPU time.
		for(var i=enemies.length-1; i>-1; --i){
			var enemy = enemies[i];
			var destroyed = false;
			
			// Check if any bullets hit them
			for(var r=bullets.length-1; r>-1; --r){
				var bullet = bullets[r];
				
				if(bullet.hits(enemy)){
					bullet.destroy();
					if(enemy.damage(30)){
						enemy.destroy({
							explode: true,
							angle: bullet.angle,
							speed: bullet.speed * 0.8,
							x: bullet.x,
							y: bullet.y
						});
						// If an enemy is destroyed then we don't need to check collisions
						// against the rest of the bullets.
						destroyed = true;
						scoreModel.add(10);
						break;
					}
				}
			}
			
			// This enemy has been killed then don't check it for ship collisions
			if(destroyed) continue;
			
			// Check if they hit the ship
			if(ship.hits(enemy)){
				enemy.destroy({
					explode: true,
					x: enemy.x,
					y: enemy.y,
					speed: 5,
					angle: 0,
					angleVariation: 6.28
				});
				scoreModel.add(10);
				
				// Kill all the enemies
				killAllEnemies();
				
				// Apply the damage to the ship and check if it
				// is dead.
				if(ship.damage(1)){
					gameOver();
					return;
				}
			}
		}
	};
	
	// Kill all enemies
	var killAllEnemies = function(){
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
			scoreModel.add(10);
		}
	}
	
	var gameOver = function(){
		_gameOver = true;
		
		//Kill all enemies
		killAllEnemies();
		
		// Destroy the ship
		ship.destroy();
		
		// Show Game Over
		game.assets.add(new GameOver({
			bounds: {
				top: 0,
				right: game.width,
				bottom: game.height,
				left: 0
			},
			scoreModel: scoreModel
		}));
	};
	
	// Draw anything in addition to registered assets
	var draw = function(ctx){};
	
	// Start the game loop
	var game = new GameLoop({
		canvas: $('#canvas'),
		initialize: initialize,
		update: update,
		draw: draw
	});
	game.start();
})();