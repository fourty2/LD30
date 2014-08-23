var ld30 = {
	renderer: null,
	camera: null,
	controls: null,
	player: null,
	scene: null,
	mousePos: null,
	collidableMeshes: [],
	init:  function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 1000;
		var FOV = 45;

		this.renderer = new THREE.WebGLRenderer({antialias: true});
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


		document.body.appendChild(this.renderer.domElement);

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
			[1,4,4,4,1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
			[1,2,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
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
							new THREE.CubeGeometry(50,50,50),
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
					case 3:
						// schlüssel
						blockMesh = new THREE.Mesh(
							new THREE.CubeGeometry(20,50,4),
							new THREE.MeshLambertMaterial({color: 0x0000ff})
						);
						blockMesh.castShadow = true;
						blockMesh.receiveShadow = true;
						blockMesh.position.x = -375 + (x*50);
						blockMesh.position.z = -375 + (y*50);
						this.scene.add(blockMesh); 
					break;
					case 4:
						// mauer
						blockMesh = new THREE.Mesh(
							new THREE.CubeGeometry(50,15,4),
							new THREE.MeshLambertMaterial({color: 0xff0077})
						);
						blockMesh.castShadow = true;
						blockMesh.receiveShadow = true;
						blockMesh.position.x = -375 + (x*50);
						blockMesh.position.z = -375 + (y*50);
						this.scene.add(blockMesh); 
						blockMesh = new THREE.Mesh(
							new THREE.CubeGeometry(50,7,4),
							new THREE.MeshLambertMaterial({color: 0xff0077})
						);
						blockMesh.castShadow = true;
						blockMesh.receiveShadow = true;
						blockMesh.position.x = -375 + (x*50);
						blockMesh.position.z = -375 + (y*50);

						blockMesh.position.y = 20;
						this.scene.add(blockMesh); 
						
					break;

				}
			}
		}



		// lights
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(300,40,300);
		light.castShadow = true;
		this.scene.add(light);


	},
	initPlayer: function() {
		this.player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshLambertMaterial({color: 0x00ff00})
			);
		this.player.castShadow = true;
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

	},
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
	render: function() {
		var oldPosition = this.player.position.clone();
		this.controls.update(0.016); 
		if (this.checkCollision()) {
			this.player.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
		}
		oldPosition = null;

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

	  /*  if( (y > 0 && y < threshold) || (y < 0 && y > -threshold) ) {
	        y = 0;
	    }
	*/
	    ld30.mousePos.set( x, 0);
	},

	onKeyDown: function( e ) {
	    var key = e.keyCode;
	 
	    if( key === 87 ) {
	        ld30.controls.setForward( true );
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
	    else if( key === 65 ) {
	        ld30.controls.setLeft( false );
	    }
	    else if( key === 68 ) {
	        ld30.controls.setRight( false );
	    }
	}


};
ld30.init();
