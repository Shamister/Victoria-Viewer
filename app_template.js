var App = function(width, height, svg, data){
	
	this.start = function(){
		
	}
	
	this.response = function(keyCode){
		if (keyCode == "enter"){
			this.isExiting = true;
		}
	}
	
	this.isExiting = false;
	
	this.exit = function(){
		// clean app before exiting
	}
}