// A simple global input manager class to manage game controls.
// Keeps a map of all keys that are currently pressed so it
// can be queried to check a game control without individual
// assets having to listen to DOM events.
// 
// Example:
// 
// 	if(Input.up()){
//		// move somewhere...
// 	}
(function(){
	
	// Listen to keydown and keyup events to keep a map of all
	// currently pressed keys
	_keys = {}
	document.addEventListener('keydown', function(e){
		_keys[e.keyCode] = true;
	});
	document.addEventListener('keyup', function(e){
		delete _keys[e.keyCode];
	});
	
	// Check if a control is currently down or not
	_isDown = function(keys){
		for(var i=0; i<keys.length; ++i){
			if(_keys[keys[i]] == true){
				return true;
			}
		}
		return false;
	}
	
	window.Input = {
		
		// w, up arrow
		up: function(){
			return _isDown([38, 87]);
		},
		
		// d, right arrow
		right: function(){
			return _isDown([39, 68]);
		},
		
		// s, down arrow
		down: function(){
			return _isDown([40, 83]);
		},
		
		// a, left arrow
		left: function(){
			return _isDown([37, 65]);
		}
	};
})();