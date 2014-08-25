var ld30 = {
	renderer: null,
	camera: null,
	controls: null,
	player: null,
	scene: null,
	mousePos: null,
    mouseOffset: null,
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
		var FAR = 1600;
		var FOV = 45;
		gamecanvas = document.getElementById('gamecanvas');
		menu.style.display = 'block';
		menu =  document.getElementById('menu');
		menu.style.display = 'none';
		hud =  document.getElementById('hud');
		hud.style.display = 'block';
		this.renderer = new THREE.WebGLRenderer({canvas: gamecanvas, antialias: true});
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor( 0x77aaff, 1);
		this.hud.keyInfo = document.getElementById('keyinfo');
		this.hud.timeInfo = document.getElementById('timeinfo');

		// clock
		this.clock  = new THREE.Clock();

		// scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.Fog( 0x77aaff, 1, 1800 );

		// camera

		this.loadLevel(TestLevel)

		// basic world .. 
		this.initWorld();




	
		//document.body.appendChild(this.renderer.domElement);

		this.animate();
	},
	loadLevel: function(level) {
		this.currentLevel = level;
		this.collidableMeshes = this.currentLevel.map;
		this.loadKeyMesh(function(geometry) {;
			// schlüssel anlegen
			ld30.keys[1] = new Key(new THREE.Vector3(0,0,0), 
						ld30.currentLevel.keyColors[1], ld30);
			ld30.keys[1].setGeometry(geometry);

			ld30.keys[2] = new Key(new THREE.Vector3(0,0,0), 
						ld30.currentLevel.keyColors[2], ld30);
			ld30.keys[2].setGeometry(geometry);

			ld30.keys[3] = new Key(new THREE.Vector3(0,0,0), 
						ld30.currentLevel.keyColors[3], ld30);
			ld30.keys[3].setGeometry(geometry);

			// türen anlegen

			ld30.loadWorld(1);

		});		
	},
	loadKeyMesh: function(callback) {
		this.loader.load('models/key.js', function(geometry, materials) {
			callback(geometry);
		});
	},
	loadWorld: function(world) {
		this.currentWorld = world;
		var worldInfo = this.currentLevel.worlds[world];
		this.renderer.setClearColor( worldInfo.skyColor, 1);
		this.scene.fog = new THREE.Fog( worldInfo.skyColor, 1, 1800 );
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
							key.initPosition = new THREE.Vector3(-375 + (x*50),5,-375 + (y*50));
							key.mapIndex = 3;
							this.entities.push(key);
							this.scene.add(key.createMesh());							
						}
					break;
					case 4:
						if (worldInfo.keyMapping[4]) {
							var key2 = this.keys[worldInfo.keyMapping[4]];
							key2.initPosition = new THREE.Vector3(-375 + (x*50),5,-375 + (y*50));
							key2.mapIndex = 4;
							this.entities.push(key2);
							this.scene.add(key2.createMesh());
						}
					break;
					case 5:
						if (worldInfo.keyMapping[5]) {
							var key3 = this.keys[worldInfo.keyMapping[5]];
							key3.initPosition = new THREE.Vector3(-375 + (x*50),5,-375 + (y*50));
							key3.mapIndex = 5;
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
						var portalColor = this.currentLevel.worlds[1].portalColor;
						portal = new Portal(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 1, portalColor, this);
						this.entities.push(portal);
						this.scene.add(portal.createMesh());
					break;
					case 10:
						var portalColor = this.currentLevel.worlds[2].portalColor;
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
		var numKeys = 0;
		if (this.playerHasKey(this.keys[1].keyColor)) {
			text = text + " S1 ";
			numKeys++;
		}
		if (this.playerHasKey(this.keys[2].keyColor)) {
			text = text + " S2 ";
			numKeys++;
		}
		if (this.playerHasKey(this.keys[3].keyColor)) {
			text = text + " S3 ";
			numKeys++;
		}

		if (numKeys == 3) {
			
			if (this.currentLevel.name == 'Warm up') {
				this.showLevelClearedMessage();
				this.loadLevel(Level1);
				this.initWorld();

			}
			else if (this.currentLevel.name == 'Wednesday') {
				this.showLevelClearedMessage();
				this.loadLevel(Level2);
				this.initWorld();
				this.hud.keyInfo.innerHTML = "";

			} else {
				this.showFinishedMessage();
			}
		}
		this.hud.keyInfo.innerHTML = text;

	},
	initWorld: function() {
		for (var x=this.scene.children.length-1; x>=0; x--) {
			this.scene.remove(this.scene.children[x]);
		}

		this.collectedKeys = [];
		this.actionLedger = {};

				var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 2000;
		var FOV = 45;
		// erstmal plane, später model
		this.camera = new THREE.TargetCamera(FOV, WIDTH / HEIGHT, 
			NEAR, FAR);
		this.mousePos = new THREE.Vector2();
        this.mouseOffset = new THREE.Vector2();

		this.scene.add(this.camera);

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

		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;

		loader.load('models/lowpoly.dae', function(collada) {
			dae = collada.scene;
			dae.position.set(-100,-160,-800);
			dae.scale.set(150,150,150);
			dae.rotateY( (Math.PI/2) * 3)

			ld30.scene.add(dae);


		});
	

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
		
		if (this.player) {
			this.scene.remove(this.player);
		}

		scope = this;
		//loader.options.convertUpAxis = true;
		this.loader.load('models/player3.js', function(geometry, materials) {
	

			
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
			quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -(Math.PI/8)  );
			ld30.camera.addTarget({
				name: 'player',
				targetObject: ld30.player,
				cameraPosition: new THREE.Vector3(0,20,200),
				cameraRotation: quaternion,
				fixed: false,
				stiffness: 0.1,
				matchRotation: false
			});

			ld30.camera.setTarget('player');

			ld30.controls = new ObjectControls({
				mousePos: ld30.mouseOffset,
				targetObject: ld30.player,
			/*	rotationDamping: 10000*/
			});

		
			for (var k in ld30.player.material.materials) {
				var mat = ld30.player.material.materials[k];
				mat.skinning = true;
			}

//			THREE.AnimationHandler.add(ld30.player.geometry.animations[0]);
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
							this.showNoKeyMessage();
							return true;
						}
					} else if (this.entities[entityIndex] instanceof Portal) {
						if (this.entities[entityIndex].toWorld == this.currentWorld) {
							this.showNoEntryMessage();
						} else {
							this.loadWorld(this.entities[entityIndex].toWorld);
							this.showNewWorldMessage();
						}
					
					} else if (this.entities[entityIndex] instanceof Key) {
						this.collectedKeys.push(this.entities[entityIndex]);
						this.entities[entityIndex].collect();
						var mapIndex = this.entities[entityIndex].mapIndex;
						this.addLedger(function() {
						
							for (var i=1; i<=3;i++) {
								if (ld30.keys[i].mapIndex == mapIndex) {
									ld30.keys[i].collect();
								}
							}

							//console.log("coollect!!!");
							//ld30.entities[entityIndex].collect();
						});

						this.updateKeyInfo();
					}
				}
			}		

			}
		}
		return false;
	},
	showNoEntryMessage: function() {
		var x = document.getElementById('noentry');
		x.style.display = "block";
		window.setTimeout(function() {
					var x = document.getElementById('noentry');
					x.style.display = "none";
		}, 1000)
	},
	showNoKeyMessage: function() {
		var x = document.getElementById('nokey');
		x.style.display = "block";
		window.setTimeout(function() {
					var x = document.getElementById('nokey');
					x.style.display = "none";
		}, 1000)
	},
	showFinishedMessage: function() {
		var x = document.getElementById('finished');
		x.style.display = "block";
	},
	showNewWorldMessage:function() {
		if (!this.seenWorldMessage) {
			this.seenWorldMessage = true;
			var x = document.getElementById('newworld');
			x.style.display = "block";
			window.setTimeout(function() {
						var x = document.getElementById('newworld');
						x.style.display = "none";
			}, 3000)			
		}
	},
	showLevelClearedMessage: function() {
			var x = document.getElementById('levelcleared');
			var y = document.getElementById('lvl');
			y.innerHTML = this.currentLevel.name;
			x.style.display = "block";
			window.setTimeout(function() {
						var x = document.getElementById('levelcleared');
						x.style.display = "none";
			}, 3000)			
		
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
		if (this.player) {
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

        ld30.mouseOffset.set( ld30.mousePos.x - x, 0);
	    ld30.mousePos.set( x , 0);
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
	    else if (key == 27) {

		menu =  document.getElementById('menu');
		menu.style.display = 'block';
		hud =  document.getElementById('hud');
		hud.style.display = 'none';

		gc =  document.getElementById('gamecanvas');
		gc.style.display = 'none';

	    }
	},

	onKeyUp: function( e ) {
	    var key = e.keyCode;

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
//ld30.init();
