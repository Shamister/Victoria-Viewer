var App = function(width, height, svg, system){
	
	// ====================================== APP ====================================
	var APP_STATES = {"MENU":0, "LOADING":1, "PLAYING":2, "GAMEOVER":3};
	var currentAppState = APP_STATES.LOADING;
	var appScreen = screen;
	var appObjects = [];
	
	var centerX = width/2;
	var centerY = height/2;
	// ================================= MENU SCREEN =================================
	
	// menu
	var menuY = 350;
	var spacing = 35;
	var menu = ["New game", "Exit"];
	
	// title
	var titleY = 200;

	// select bar
	var selectBarWidth = 200;
	var selectBarHeight = 35;
	
	var selectBarY = 325;
	
	var selectBar;
	var selected = 0;
	
	/**
	* A public function that starts the app.
	* Before running the app, this function should be executed first.
	*/
	this.start = function(){
		// load style
		var css = d3.select("head")
			.append("link")
			.attr("type", "text/css")
			.attr("href", "apps/space shooter/style.css")
			.attr("rel", "stylesheet");
		
		loadMenu();
	}
	
	/**
	* Load the menu screen of the game
	*/
	function loadMenu(){
		// remove all objects
		removeAppComponents();
		
		// set state into 'loading'
		currentAppState = APP_STATES.LOADING;
		
		// load background image
		appObjects[appObjects.length] = svg.append("rect")
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", width)
										.attr("height", height)
										.attr("id", "background");
	
		// load title
		appObjects[appObjects.length] = svg.append("text")
									.text("Space Shooter")
									.attr("x", centerX)
									.attr("y", titleY)
									.attr("text-anchor", "middle")
									.attr("class", "titleText");
		
		// set default selected menu
		selected = 0;
			
		selectBar = svg.append("rect")
					.attr("x", width/2 - selectBarWidth/2)
					.attr("y", selectBarY)
					.attr("width", selectBarWidth)
					.attr("height", selectBarHeight)
					.attr("fill", "#333333");
					
		appObjects[appObjects.length] = selectBar;
		
		appObjects[appObjects.length] = svg.selectAll("text")
									.data(menu, function(d){return d;})
									.enter()
									.append("text")
									.text(function(d){return d;})
									.attr("x", width/2)
									.attr("y", function(v, i){return menuY + i*spacing;})
									.attr("text-anchor", "middle")
									.attr("class", "menuText");
		
		// set state into 'menu'
		currentAppState = APP_STATES.MENU;
	}

	// ================================= GAME SCREEN =================================

	// Game Variables
	var CRAFT_WIDTH = 50;
	var CRAFT_HEIGHT = 50;
	var CRAFT_SPEED = 10;
	
	var ALIEN_WIDTH = 50;
	var ALIEN_HEIGHT = 50;
	var ALIEN_MAX_SPEED = 3;
	var ALIEN_SPAWN_MIN_X = ALIEN_WIDTH;
	var ALIEN_SPAWN_MAX_X = 800 - 2*ALIEN_WIDTH;
	var ALIEN_SPAWN_MIN_Y = -ALIEN_HEIGHT;
	var ALIEN_SPAWN_MAX_Y = ALIEN_HEIGHT;
	
	var MISSILE_SPEED = -10;
	var MISSILE_WIDTH = 2;
	var MISSILE_HEIGHT = 6;
	
	var TOTAL_ALIENS = 10;
	
	var GAME_SPEED = 10;
	
	// Collider
	var Rect = function(x, y, width, height){
		this.x = x;
		this.y = y;
		
		this.width = width;
		this.height = height;
		
		this.intersects = function(rect){
						var x2 = x + width;
						var y2 = y + height;
						
						var rectX2 = rect.x + rect.width;
						var rectY2 = rect.y + rect.height;
						
						return ((rect.x >= x && rect.x < x2) || (x >= rect.x && x < rectX2)) &&
								((rect.y >= y && rect.y < y2) || (y >= rect.y && y < rectY2));
					}
	}

	// Craft Object
	var Craft = function(width, height, x, y, speed) {
		this.width = width;
		this.height = height;

		this.x = x;
		this.y = y;

		this.speed = speed;

		this.isMoving = false;
		this.isDead = false;
		this.missiles = [];
		
		this.collider = function(){
							return new Rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
						}
	}

	// Alien Object
	var Alien = function(width, height, x, y, speed) {
		this.width = width;
		this.height = height;

		this.x = x;
		this.y = y;

		this.speed = speed;

		this.isMoving = false;
		this.isDead = false;
		
		this.collider = function(){
							return new Rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
						}
	}
	
	// Missile Object
	var Missile = function(width, height, x, y, speed) {
		this.width = width;
		this.height = height;
		
		this.x = x;
		this.y = y;
		
		this.speed = speed;
		
		this.isMoving = false;
		
		this.collider = function(){
							return new Rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
						}
	}

	var craft;
	var aliens = [];
	var alienImages = [];
	var missileImages = [];
	var tick;
	
	function loadGame(){
		// set state into 'loading'
		currentAppState = APP_STATES.LOADING;
		
		// remove all objects
		removeAppComponents();
	
		// remove all pointers of previous game
		aliens = [];
		alienImages = [];
		missileImages = [];

		craft = new Craft(CRAFT_WIDTH, CRAFT_HEIGHT, centerX, height*0.75, CRAFT_SPEED);

		craftImage = svg.append("image")
					.attr("xlink:href", getDir()+"/apps/space shooter/aircraft.png")
					.attr("x", craft.x - craft.width/2)
					.attr("y", craft.y - craft.height/2)
					.attr("width", craft.width)
					.attr("height", craft.height);

		appObjects[appObjects.length] = craftImage;

		for (i = 0; i < TOTAL_ALIENS; i++){
			aliens[i] = new Alien(ALIEN_WIDTH, ALIEN_HEIGHT, 
						ALIEN_SPAWN_MIN_X + Math.random()*(ALIEN_SPAWN_MAX_X-ALIEN_SPAWN_MIN_X), 
						ALIEN_SPAWN_MIN_Y + Math.random()*(ALIEN_SPAWN_MAX_Y-ALIEN_SPAWN_MIN_Y), 
						1+Math.random()*(ALIEN_MAX_SPEED-1));

			alienImages[i] = svg.append("image")
								.attr("xlink:href", getDir()+"/apps/space shooter/alien.png")
								.attr("x", aliens[i].x - aliens[i].width/2)
								.attr("y", aliens[i].y - aliens[i].height/2)
								.attr("width", aliens[i].width)
								.attr("height", aliens[i].height)
								.attr("fill", "red");

			appObjects[appObjects.length] = alienImages[i];
		}

		tick = setInterval(function(){checkGame(); moveMissiles(); moveAliens();}, 1000/GAME_SPEED);
		
		// set state into 'playing'
		currentAppState = APP_STATES.PLAYING;
	}
	
	/** 
	* Move the selection bar to the direction specified.
	* The direction is shown as an integer, 1 for moving down
	* and -1 for moving up.
	*/
	function moveSelectBar(i){
		selected = Math.abs(selected + i)%menu.length;
		selectBar.transition()
				.duration(500)
				.attr("y", selectBarY + spacing * selected);
	}
	
	/** 
	* Move the craft to the direction specified.
	* The direction is shown as two integers, positive x moves craft 
	* to the right while the negative moving left. Positive y means 
	* moving up while its negative value moves the craft down.
	*/
	function moveCraft(x, y){
		if (!craft.isMoving && 
				craft.x + craft.width/2 <= width - x && 
				craft.x - craft.width/2 >= -x &&
				craft.y + craft.height/2 <= height - y &&
				craft.y - craft.height/2 >= -y){
			craft.isMoving = true;
			craft.x += x;
			craft.y += y;
			craftImage.transition()
				.duration(50)
				.attr("x", craft.x - craft.width/2)
				.attr("y", craft.y - craft.height/2)
				.each("end", function(){craft.isMoving = false;});
		}
	}

	/**
	* Aliens only have fixed movement, which is going downward with
	* the speed specified when they are created.
	*/
	function moveAliens(){
		for (i = 0; i < aliens.length; i++){
			var alien = aliens[i];
			if (!alien.isMoving & !alien.isDead){
			
				alien.isMoving = true;
				alien.y += alien.speed;
				
				// keep the alien inside the screen
				if (alien.y > height + alien.height){
					alien.y = -alien.height;
				}
				
				alienImages[i].transition()
								.duration(0)
								.attr("y", alien.y - alien.height/2)
								.each("end", function(){
									if (i >= aliens.length-1){
										for (j = 0; j < aliens.length; j++){
											aliens[j].isMoving = false;
										}
									}
									return;
								});
								
				// check collision with the craft
				if (craft.collider().intersects(alien.collider())){
					craft.isDead = true;
				}
			}
			else if (aliens[i].isDead){
				alienImages[i].remove();
				
				// remove alien and its image from the array
				alienImages.splice(i,1);
				aliens.splice(i,1);
			}
		}
	}
	
	/**
	* Create Missile in front of the craft.
	*/
	function createMissile(){
		var index = craft.missiles.length;
		
		craft.missiles[index] = new Missile (MISSILE_WIDTH, MISSILE_HEIGHT, craft.x, craft.y - craft.height/2, MISSILE_SPEED);
		
		var missile = craft.missiles[index]; 
		
		missileImages[index] = svg.append("rect")
								.attr("x", missile.x - missile.width/2)
								.attr("y", missile.y - missile.height/2)
								.attr("width", missile.width)
								.attr("height", missile.height)
								.attr("fill", "#ff8800");
								
		appObjects[appObjects.length] = missileImages[index];
	}
	
	/**
	* Move missiles upward to hit the aliens.
	*/
	function moveMissiles(){
		for (i = 0; i < craft.missiles.length; i++){
			var missile = craft.missiles[i];
			if (!missile.isMoving){
				missile.isMoving = true;
				
				missile.y += missile.speed;
				missileImages[i].attr("y", missile.y - missile.height/2);
				
				// if missile has been beyond the boundary
				// remove the missile
				if (missile.y < -missile.width){
					// remove the missile and its image
					removeMissile(i);
				}
				else {
				
					// check collision with the aliens
					for (j = 0; j < aliens.length; j++){
						if (!aliens[j].isDead && missile.collider().intersects(aliens[j].collider())){
							aliens[j].isDead = true;
							
							// remove the missile and its image
							removeMissile(i);
						}
					}
				}
				missile.isMoving = false;
			}
		}
	}
	
	/**
	* Remove missile from the data
	* This function is usually called when the missile
	* hit the aliens, or it goes beyond the screen boundary.
	*/
	function removeMissile(i){
		missileImages[i].remove();
		missileImages.splice(i, 1);
		
		craft.missiles.splice(i, 1);
	}
	
	/**
	* Check the game status and show it to the screen.
	*/
	function checkGame(){
		if (aliens.length == 0){
			loadGameOver("YOU WON!");
		}
		else if (craft.isDead){
			loadGameOver("YOU LOSE!");
		}
	}
	
	/**
	* Load the game over screen along with the messages specified.
	*/
	function loadGameOver(t){
		// set state into loading
		currentAppState = APP_STATES.LOADING;

		// remove all objects
		for (i = 0; i < appObjects.length; i++){
			appObjects[i].remove();
		}
		var text = svg.append("text")
					.text(t)
					.attr("text-anchor", "middle")
					.attr("x", centerX)
					.attr("y", centerY)
					.attr("class", "gameOverText");
					
		appObjects[appObjects.length] = text;
			
		// clear interval and set time out for game-over screen
		clearInterval(tick);
		
		// set game over screen timeout to 2 seconds
		tick = setTimeout(function(){loadMenu();}, 2000);
		
		// set state into game over
		currentAppState = APP_STATES.GAMEOVER;
	}
	
	/**
	* Remove all app components, 
	* such as text, image, and shape objects.
	*/
	function removeAppComponents(){
		for (i = 0; i < appObjects.length; i++){
			appObjects[i].remove();
		}
		appObjects = [];
	}
	
	/**
	* Response to the user's key inputs.
	* This will be called by the function in the main thread.
	*/
	this.response = function(keyCode){
		if (currentAppState == APP_STATES.MENU){
			if (selectBar != null){
				if (keyCode == "left"){
					moveSelectBar(-1);
				}
				else if (keyCode == "right"){
						moveSelectBar(1);
				}
				else if (keyCode == "up"){
					moveSelectBar(1);
				}
				else if (keyCode == "down"){
					moveSelectBar(-1);
				}
				else if (keyCode == "enter"){
					switch(selected){
						case 0:
							loadGame();
							break;
						case 1:
							this.isExiting = true;
							break;
					}
				}
				else if (keyCode == "escape"){
					this.isExiting = true;
				}
			}
		}
		else if (currentAppState == APP_STATES.PLAYING){
			if (craftImage != null){
				if (keyCode == "left"){
					moveCraft(-craft.speed, 0);
				}
				else if (keyCode == "right"){
					moveCraft(craft.speed, 0);
				}
				else if (keyCode == "up"){
					moveCraft(0, -craft.speed);
				}
				else if (keyCode == "down"){
					moveCraft(0, craft.speed);
				}
				else if (keyCode == "space"){
					createMissile();
				}
				else if (keyCode == "escape"){
					craft.isDead = true;
				}
			}
		}
	}
	
	this.isExiting = false;
	
	/**
	* Prepare to exit the game.
	*/
	this.exit = function(){
		// clean app before exiting
		removeAppComponents();
	}
}