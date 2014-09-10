(function(){
	window.ScoreModel = function(options){
		var self = this;
		
		self._points = 0;
		self._multiplier = 1;
		self._maxMultiplier = 20;
		self._enemyChain = self._threshold = 10;
		self._totalEnemies = 0;
		
		self._difficultyLevel = 0;
		self._difficultyChain = 0;
		self.increaseDifficulty = options.increaseDifficulty;
		
		self._powerupLevel = 0;
		self._powerupChain = 0;
		self.increasePowerup = options.increasePowerup;
		
		// Get the multiplier
		self.multiplier = function(){
			return self._multiplier;
		}
		
		// Get the score
		self.score = function(){
			return self._points;
		}
		
		// Reset the miltiplier
		self.resetMultiplier = function(){
			self._multiplier = 1;
			self._enemyChain = self._threshold;
			self._powerupChain = 0;
		}
		
		// Add points to the model
		// Increase the multiplier when 100 points have been added
		self.add = function(points){
			
			self._points += (points * self._multiplier);
			
			if(self._multiplier < self._maxMultiplier && --self._enemyChain == 0){
				++self._multiplier;
				self._enemyChain = self._threshold;
			}
			
			// Increment the total enemies
			++self._totalEnemies;
			
			// When the total enemies killed gets past a
			// threshold then callback to make enemies more
			// difficult
			if(++self._difficultyChain == 10){
				self._difficultyChain = 0;
				++self._difficultyLevel;
				if(self.increaseDifficulty)
					self.increaseDifficulty(self._difficultyLevel);
			}
			
			// If the user gets a kill streak of 20 then
			// callback to award an upgrade. Powerup chain is
			// reset each time an enemy escapes but already awarded
			// powerups stay.
			if(++self._powerupChain == 20){
				self._powerupChain = 0;
				++self._powerupLevel;
				if(self.increasePowerup)
					self.increasePowerup(self._powerupLevel);
			}
		}
	}
})();