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
	
	// An array of enemy type variations that can be selected from
	// when spawning a new one
	var _enemyTypes;
	
	// All the possible enemy types in order of difficulty
	var _allEnemyTypes = [
		{
			health: 1
		},
		{
			health: 2
		},
		{
			health: 3
		},
		{
			health: 4
		},
		{
			health: 5
		}
	];
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		
		// Set the initial possible enemy type including the
		// first enemy only
		_enemyTypes = [_allEnemyTypes[0]];
		
		scoreModel = new ScoreModel({
			// When increaseDifficulty is called add the next difficulty enemy
			// to the enemy types pool. This runs through each enemy index as
			// difficultyLevel increments one each callback. If we run out of
			// enemies to add then the last (most difficult) enemy will be
			// added again to increase the likelyhood of it being selected.
			increaseDifficulty: function(difficultyLevel){
				_enemyTypes.push(_allEnemyTypes[Math.min(_allEnemyTypes.length-1, difficultyLevel)]);
			}
		});
		
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
			
			// Pick a random enemy from the pool, this pool gets more difficult
			// enemies added over time as more enemies are killed.
			var options = extend({
				x: (Math.random() * (game.width-40)) + 20,
				y: -20,
				bounds: {
					top: -20,
					right: game.width,
					bottom: game.height+20,
					left: 0
				},
				escaped: scoreModel.resetMultiplier
			}, _enemyTypes[Math.floor(Math.random() * (_enemyTypes.length))]);
			
			game.assets.add(new Enemy(options));
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
					if(enemy.damage({
						damage: 1,
						angle: bullet.angle,
						speed: bullet.speed * 0.8,
						x: bullet.x,
						y: bullet.y
					})){
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
				
				// Kill all the enemies
				killAllEnemies();
				
				// Apply the damage to the ship, if it's run out of health as a result then it's game over!
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