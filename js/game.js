var ld30 = {
	renderer: null,
	camera: null,
	controls: null,
	player: null,
	scene: null,
	mousePos: null,
	entities: [],
	collectedKeys: [],
	collidableMeshes: [],
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


		// scene
		this.scene = new THREE.Scene();

		// camera
		this.camera = new THREE.TargetCamera(FOV, WIDTH / HEIGHT, 
			NEAR, FAR);
		this.mousePos = new THREE.Vector2();

		this.scene.add(this.camera);

		// world
		this.initWorld();

		// player
		this.initPlayer();

		// enemies
		this.initEnemies();

		//document.body.appendChild(this.renderer.domElement);

		this.animate();
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


		// level
		// 16 * 16
		this.testLevel = [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
			[1,0,3,0,1,0,0,0,0,0,0,0,1,0,0,1],
			[1,7,7,7,1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
			[1,0,0,0,0,4,0,0,1,1,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,2,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,1,0,1,0,0,0,0,0,1,1,0,0,1],
			[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

		];

		this.collidableMeshes = this.testLevel;

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

		for (var y=0;y<=15;y++) {
			for (var x=0;x<=15;x++) {
				switch (this.testLevel[y][x]) {
					case 1:
						blockMesh = new THREE.Mesh(
							new THREE.BoxGeometry(50,50,50),
							new THREE.MeshLambertMaterial({color: 0xff0000})
						);
						blockMesh.castShadow = true;
						blockMesh.receiveShadow = true;
						blockMesh.position.x = -375 + (x*50);
						blockMesh.position.z = -375 + (y*50);

						this.collidableMeshes[y][x] = blockMesh;
						this.scene.add(blockMesh); 
					break;
					case 2:
						this.playerStartPos = {x: -375 + (x*50), z:-375 + (y*50)};
					break;
					// 3-5 = keys
					case 3:
						key = new Key(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 0xff0000, this);
						this.entities.push(key);
						this.scene.add(key.createMesh());
					
					break;
					case 4:
						key = new Key(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 0x00ff88, this);
						this.entities.push(key);
						this.scene.add(key.createMesh());
					
					break;
	
					// 6-8 = doors
					case 7:
						door = new Door(new THREE.Vector3(-375 + (x*50),10,-375 + (y*50)), 0x00ff88, this);
						this.entities.push(door);
						this.scene.add(door.createMesh());
					break;

				}
			}
		}



		// lights
	/*	var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(300,40,300);
		light.castShadow = true;
		this.scene.add(light);
*/
 var light = new THREE.DirectionalLight(0xffA020);
      light.intensity = 2.0;
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

		var ambientLight = new THREE.AmbientLight(0x001122);
        this.scene.add(ambientLight);



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
		this.player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshLambertMaterial({color: 0x00ff00})
			);
		this.player.castShadow = true;
		this.player.receiveShadow = true;
		this.player.position.y = 5;
		this.player.position.x = this.playerStartPos.x;
		this.player.position.z = this.playerStartPos.z;

		this.scene.add(this.player);

		this.camera.addTarget({
			name: 'player',
			targetObject: this.player,
			cameraPosition: new THREE.Vector3(0,50,200),
			fixed: false,
			stiffness: 0.1,
			matchRotation: true
		});

		this.camera.setTarget('player');


		this.controls = new ObjectControls({
			mousePos: this.mousePos,
			targetObject: this.player,
		/*	rotationDamping: 10000*/
		});

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
					} else if (this.entities[entityIndex] instanceof Key) {
						this.collectedKeys.push(this.entities[entityIndex]);
						this.entities[entityIndex].collect();
					}
				}
			}		

			}
		}
		return false;
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
	    }
	    else if( key === 83 ) {
	        ld30.controls.setBackward( true );
	    }
	    else if( key === 65 ) {
	        ld30.controls.setLeft( true );
	    }
	    else if( key === 68 ) {
	        ld30.controls.setRight( true );
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
ld30.init();
