(function(){
	window.ScoreModel = function(){
		var self = this;
		
		self._points = 0;
		self._multiplier = 1;
		self._maxMultiplier = 10;
		self._threshold = 10;
		self._enemyChain = self._threshold;
		
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
		}
		
		// Add points to the model
		// Increase the multiplier when 100 points have been added
		self.add = function(points){
			
			self._points += (points * self._multiplier);
			
			if(self._multiplier < self._maxMultiplier && --self._enemyChain == 0){
				++self._multiplier;
				self._enemyChain = self._threshold;
			}
		}
	}
})();