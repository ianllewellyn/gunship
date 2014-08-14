exports.config =
	
	files:
		javascripts:
			joinTo:
				'js13k.js': /^(app|bower_components)/
		
		stylesheets:
			joinTo:
				'js13k.css': /^(app|bower_components)/
	
	server:
		port: 3000
	
	sourceMaps: no
	
	plugins:
		stylus:
			defines:
				# Enable stylus url() inlining
				url: require('./node_modules/stylus-brunch/node_modules/stylus').url()
	
	modules:
		wrapper: no
		definition: no