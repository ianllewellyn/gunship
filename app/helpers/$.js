(function(){
	window.$ = function(selector)
	{
		if(selector.charAt(0) == '#')
		{
			return document.getElementById(selector.substr(1, selector.length));
		}
	}
})();