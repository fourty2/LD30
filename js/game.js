var ld30 = {
	renderer: null,
	camera: null,
	controls: null,
	player: null,
	scene: null,
	mousePos: null,
	entities: [],
	collectedKeys: [],
	keys: {},
	collidableMeshes: [],
	currentLevel: null,
	currentWorld: 1,
	hud: {},
	actionLedger: {},
	startTime: 0,
	lastCheck: 0,
	playerAnimation: null,
	currentSequence: 'standing',
	clock: null,
	loader: new THREE.JSONLoader(),
	init:  function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 1000;
		var FOV = 45;
		gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: gamecanvas, antialias: true});
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;

		this.hud.keyInfo = document.getElementById('keyinfo');
		this.hud.timeInfo = document.getElementById('timeinfo');

		// clock
		this.clock  = new THREE.Clock();

		// scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog( 0x001020, 1, 900 );

		// camera
		this.camera = new THREE.TargetCamera(FOV, WIDTH / HEIGHT, 
			NEAR, FAR);
		this.mousePos = new THREE.Vector2();

		this.scene.add(this.camera);
		this.loadLevel(TestLevel)

		// basic world .. 
		this.initWorld();




	
		//document.body.appendChild(this.renderer.domElement);

		this.animate();
	},
	loadLevel: function(level) {
		this.currentLevel = level;
		this.collidableMeshes = this.currentLevel.map;

		// schlüssel anlegen
		this.keys[1] = new Key(new THREE.Vector3(0,0,0), 
					this.currentLevel.keyColors[1], this);
		this.keys[2] = new Key(new THREE.Vector3(0,0,0), 
					this.currentLevel.keyColors[2], this);
		this.keys[3] = new Key(new THREE.Vector3(0,0,0), 
					this.currentLevel.keyColors[3], this);

		// türen anlegen

		this.loadWorld(1);



		

	},
	loadWorld: function(world) {
		this.currentWorld = world;
		var worldInfo = this.currentLevel.worlds[world];
		// remove all entities
		for (var x = this.entities.length-1; x>=0; x--) {
			this.entities[x].killSoft();
		}

		for (var y=0;y<=15;y++) {
			for (var x=0;x<=15;x++) {
				switch (this.currentLevel.map[y][x]) {
					case 2:
						this.playerStartPos = {x: -375 + (x*50), z:-375 + (y*50)};
					break;
					// 3-5 = keys
					case 3:
						if (worldInfo.keyMapping[3]) {
							var key = this.keys[worldInfo.keyMapping[3]];
							key.initPosition = new THREE.Vector3(-375 + (x*50),10,-375 + (y*50));
							this.entities.push(key);
							this.scene.add(key.createMesh());							
						}
					break;
					case 4:
						if (worldInfo.keyMapping[4]) {
							var key2 = this.keys[worldInfo.keyMapping[4]];
							key2.initPosition = new THREE.Vector3(-375 + (x*50),10,-375 + (y*50));
							this.entities.push(key2);
							this.scene.add(key2.createMesh());
						}
					break;
					case 5:
						if (worldInfo.keyMapping[5]) {
							var key3 = this.keys[worldInfo.keyMapping[5]];
							key3.initPosition = new THREE.Vector3(-375 + (x*50),10,-375 + (y*50));
							this.entities.push(key3);
							this.scene.add(key3.createMesh());
						}
					break;
					// 6-8 = doors
					case 6:
						var doorColor = this.currentLevel.keyColors[worldInfo.doorMapping[6]];
						door = new Door(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), doorColor, this);
						this.entities.push(door);
						this.scene.add(door.createMesh());
					break;
					case 7:
						var doorColor = this.currentLevel.keyColors[worldInfo.doorMapping[7]];
						door = new Door(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), doorColor, this);
						this.entities.push(door);
						this.scene.add(door.createMesh());
					break;
					case 8:
						var doorColor = this.currentLevel.keyColors[worldInfo.doorMapping[8]];
						door = new Door(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), doorColor, this);
						this.entities.push(door);
						this.scene.add(door.createMesh());
					break;
					// 9-11 = portals
					case 9:
						var portalColor = 0x000000;
						portal = new Portal(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 1, portalColor, this);
						this.entities.push(portal);
						this.scene.add(portal.createMesh());
					break;
					case 10:
						var portalColor = 0xffffff;
						portal = new Portal(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 2, portalColor, this);
						this.entities.push(portal);
						this.scene.add(portal.createMesh());
						break;


				}
			}
		}
		// player
		this.initPlayer();
		// enemies
		this.initEnemies();

		// build world
		if (this.ambientLight instanceof THREE.AmbientLight) {
			this.scene.remove(this.ambientLight);
		}
		this.ambientLight = new THREE.AmbientLight(worldInfo.ambientColor);
        this.scene.add(this.ambientLight);

        var d = new Date();
	    this.startTime = d.getTime();
	    this.lastCheck = 0;

	},
	updateKeyInfo: function() {
		var text = "";
		if (this.playerHasKey(this.keys[1].keyColor)) {
			text = text + " S1 ";
		}
		if (this.playerHasKey(this.keys[2].keyColor)) {
			text = text + " S2 ";
		}
		if (this.playerHasKey(this.keys[3].keyColor)) {
			text = text + " S3 ";
		}
		console.log(text);
		this.hud.keyInfo.innerHTML = text;

	},
	initWorld: function() {
		// erstmal plane, später model

		var planeGeometry = new THREE.PlaneGeometry(800,800, 1, 1);
		planeGeometry.applyMatrix( 
			 new THREE.Matrix4().makeRotationX(-Math.PI/2)
			);

		var plane = new THREE.Mesh(
				planeGeometry,
				new THREE.MeshBasicMaterial({color: 0xff8000})
			);
		plane.receiveShadow = true;
		this.scene.add(plane);


	

		this.testRays = [
		  new THREE.Vector3(0, 0, 1),
		  new THREE.Vector3(1, 0, 1),
		  new THREE.Vector3(1, 0, 0),
		  new THREE.Vector3(1, 0, -1),
		  new THREE.Vector3(0, 0, -1),
		  new THREE.Vector3(-1, 0, -1),
		  new THREE.Vector3(-1, 0, 0),
		  new THREE.Vector3(-1, 0, 1)
		];
		this.caster = new THREE.Raycaster();	
		this.loader.load('models/block.js', function(geometry, materials) {

			for (var y=0;y<=15;y++) {
				for (var x=0;x<=15;x++) {
					switch (ld30.currentLevel.map[y][x]) {
						case 1:
							blockMesh = new THREE.SkinnedMesh(
								geometry,
								new THREE.MeshLambertMaterial({shading: THREE.FlatShading, color: 0xff0000})
							);
							blockMesh.castShadow = true;
							blockMesh.receiveShadow = true;
							blockMesh.position.x = -375 + (x*50);
							blockMesh.position.z = -375 + (y*50);
							blockMesh.position.y = 20;

							blockMesh.scale.set(27,20,27);
							ld30.collidableMeshes[y][x] = blockMesh;
							ld30.scene.add(blockMesh); 
						break;
					}
				}
			}
		});



		// lights
	/*	var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(300,40,300);
		light.castShadow = true;
		this.scene.add(light);
*/
	 var light = new THREE.DirectionalLight(0xffA020);
      light.intensity = 1.0;
//      light.position.set(0.5, 0.2, -2);
	  light.position.set(400,120,400);
      light.target.position.set(0, 0, 0);
      light.castShadow = true;
      light.shadowDarkness = 0.8;
      light.shadowMapWidth = 2048;
      light.shadowMapHeight = 2048;
     // light.shadowCameraVisible = true; // only for debugging
      // these six values define the boundaries of the yellow box seen above
   /*   light.shadowCameraNear = -10;
      light.shadowCameraFar = 15;
      light.shadowCameraLeft = -10;
      light.shadowCameraRight = 10;
      light.shadowCameraTop = 10;
      light.shadowCameraBottom = -10;*/
      this.scene.add(light);


	},
	initEnemies: function() {
		for (i=0;i<5; i++) {
			pos = new THREE.Vector3(
				-375 + (Math.floor((Math.random() * 15) + 1) * 50),
				10,
				-375 + (Math.floor((Math.random() * 15) + 1) * 50)
				);

			enemy = new Enemy(pos, Math.floor((Math.random() * 15) + 6), this);
			mesh = enemy.createMesh();
			this.entities.push(enemy);
			this.scene.add(mesh);
		}		
	},
	playerHasKey: function(color) {
		for (var i = 0; i<this.collectedKeys.length; i++) {
			if (this.collectedKeys[i].keyColor == color) {
				return true;
			}
		}
		return false;
	},
	initPlayer: function() {
		

		scope = this;
		//loader.options.convertUpAxis = true;
		this.loader.load('models/player3.js', function(geometry, materials) {
	
			console.log("loaded");
	
			
			ld30.player = new THREE.SkinnedMesh(
				geometry, 
				new THREE.MeshFaceMaterial(materials)
//				new THREE.MeshLambertMaterial({shading: THREE.FlatShading, color: 0x00ff00})
				);
			ld30.player.castShadow = true;
			ld30.player.receiveShadow = true;
			ld30.player.scale.set(5,5,5);
			ld30.player.position.y = 5;
			ld30.player.position.x = ld30.playerStartPos.x;
			ld30.player.position.z = ld30.playerStartPos.z;
			

			ld30.scene.add(ld30.player);
			var quaternion = new THREE.Quaternion();
			quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -(Math.PI/10)  );
			ld30.camera.addTarget({
				name: 'player',
				targetObject: ld30.player,
				cameraPosition: new THREE.Vector3(0,10,200),
				cameraRotation: quaternion,
				fixed: false,
				stiffness: 0.05,
				matchRotation: true
			});

			ld30.camera.setTarget('player');

			ld30.controls = new ObjectControls({
				mousePos: ld30.mousePos,
				targetObject: ld30.player,
			/*	rotationDamping: 10000*/
			});

		
			for (var k in ld30.player.material.materials) {
				var mat = ld30.player.material.materials[k];
				mat.skinning = true;
			}

//			THREE.AnimationHandler.add(ld30.player.geometry.animations[0]);
			console.log (ld30.player.geometry);
//			ld30.playerAnimation = new THREE.Animation(ld30.player, "walk", THREE.AnimationHandler.CATMULLROM);
			ld30.playerAnimation = new THREE.Animation(ld30.player, ld30.player.geometry.animations[0]);
		
			ld30.playerAnimation.play();
			

		});


/*		this.player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshLambertMaterial({color: 0x00ff00})
			);
*/	

		

		document.addEventListener( 'mousemove', this.onMouseMove, false );
		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );
		document.addEventListener( 'click', this.onClick, false);
		document.addEventListener( 'mouseout', this.onMouseOut, false);
	},
	// player verhalten - auslagern
	checkCollision: function() {
		mapx = (this.player.position.x + 375)/50;
		mapy = (this.player.position.z + 375)/50;
		fmapx = Math.floor(mapx);
		cmapx = Math.ceil(mapx);
		fmapy = Math.floor(mapy);
		cmapy = Math.ceil(mapy);
	

		var preCollisionList = [
			this.collidableMeshes[fmapy][fmapx],
			this.collidableMeshes[cmapy][fmapx],
			this.collidableMeshes[fmapy][cmapx],
			this.collidableMeshes[cmapy][cmapx],
		];
		var collisionList = [];
		preCollisionList.forEach(function(elem) {
			if (!Number.isInteger(elem)) {
				collisionList.push(elem);
			}
		});
		if (collisionList.length == 0) {
			return false;
		}
	
		// raycaster starten
		for (i=0;i<this.testRays.length;i++) {
			this.caster.set(this.player.position, this.testRays[i]);
			collisions = this.caster.intersectObjects(collisionList);
			if (collisions.length > 0 && collisions[0].distance <= 5) {
				return true;
			}

		}

		return false;
	},
	// player verhalten -- auslagern
	collidesWithEntity: function() {
		var collisionList = [];
		for (var entityIndex = 0; entityIndex < this.entities.length; entityIndex++) {
			if (this.entities[entityIndex].alive) {
			collisionList = [this.entities[entityIndex].getMesh()];
			for (i = 0; i < this.testRays.length; i++) {
				this.caster.set(this.player.position, this.testRays[i]);
				collisions = this.caster.intersectObjects(collisionList);
				if (collisions.length > 0 && collisions[0].distance <= 30) {
					if (this.entities[entityIndex] instanceof Door) {
						if (this.playerHasKey(this.entities[entityIndex].doorColor)) {
							this.entities[entityIndex].open();
						} else {
							return true;
						}
					} else if (this.entities[entityIndex] instanceof Portal) {
						if (this.entities[entityIndex].toWorld == this.currentWorld) {
							console.log("no entry");
						} else {
							this.loadWorld(this.entities[entityIndex].toWorld);
						}
					
					} else if (this.entities[entityIndex] instanceof Key) {
						this.collectedKeys.push(this.entities[entityIndex]);
						this.entities[entityIndex].collect();
						this.addLedger(function() {
							console.log("coollect!!!");
							ld30.entities[entityIndex].collect();
						});

						this.updateKeyInfo();
					}
				}
			}		

			}
		}
		return false;
	},
	addLedger: function(callback) {
		var n = new Date();
		diff = n.getTime() - this.startTime;
		this.actionLedger[Math.floor(diff/100) - 1] = callback;
	},
	checkLedger: function(msec) {
		if (this.actionLedger[msec]) {
			var scope = this;
			this.actionLedger[msec]();
		}
	},
	fireBullet: function() {
		var bullet = new Bullet(this.player.position, this.player.rotation, this);
		mesh = bullet.createMesh();
		this.entities.push(bullet);

		this.scene.add(mesh);
	},
	render: function() {
		var oldPosition = this.player.position.clone();
		this.controls.update(0.016); 
		if (this.checkCollision() || this.collidesWithEntity()) {
			this.player.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
		}
		
		oldPosition = null;

		// bewege alle entities
		/*this.entities.forEach(function(entity)) {
			entity.update();
		}*/
		for (var i = this.entities.length-1; i>=0; i--) {
			if (this.entities[i] instanceof Entity) {
				this.entities[i].update();
			}
		}



		this.camera.update();
		// timestamp update
		var n = new Date();
		diff = n.getTime() - this.startTime;
		this.hud.timeInfo.innerHTML = " " + Math.floor((diff/1000)) + " seconds";
		var msec = Math.floor(diff/100);
		if (this.lastCheck < msec) {

			this.checkLedger(msec);
			this.lastCheck = msec;
		}

		var delta = 4* this.clock.getDelta();

		if (this.playerAnimation && this.currentSequence == 'walking') {
			this.playerAnimation.update(delta);
		}

		this.renderer.render(this.scene, this.camera);

	},
	animate: function() {
		requestAnimationFrame(ld30.animate);
		ld30.render();
	},

	onMouseMove: function( e ) {
	    var x = e.pageX - (window.innerWidth/2),
	        y = e.pageY - (window.innerHeight/2),
	        threshold = 50;

	    if( (x > 0 && x < threshold) || (x < 0 && x > -threshold) ) {
	        x = 0;
	    }
	    ld30.mousePos.set( x, 0);
	},
	onMouseOut: function (e) {
		ld30.mousePos.set(0,0);
	},
	onKeyDown: function( e ) {
	    var key = e.keyCode;
	 
	    if( key === 87 ) {
	        ld30.controls.setForward( true );
	        ld30.currentSequence = 'walking';
	    }
	    else if( key === 83 ) {
	        ld30.controls.setBackward( true );
	        ld30.currentSequence = 'walking';
	    }
	    else if( key === 65 ) {
	        ld30.controls.setLeft( true );
	         ld30.currentSequence = 'walking';
	    }
	    else if( key === 68 ) {
	        ld30.controls.setRight( true );
	         ld30.currentSequence = 'walking';
	    }
	},

	onKeyUp: function( e ) {
	    var key = e.keyCode;
        ld30.currentSequence = 'standing';

	    if( key === 87 ) {
	        ld30.controls.setForward( false );
	    }
	    else if( key === 83 ) {
	        ld30.controls.setBackward( false );
	    }
	    else if( key === 65 ) {
	        ld30.controls.setLeft( false );
	    }
	    else if( key === 68 ) {
	        ld30.controls.setRight( false );
	    }
	},
	onClick: function (e) {
		ld30.fireBullet();
	}


};
ld30.init();
