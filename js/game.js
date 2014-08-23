var ld30 = {
	renderer: null,
	camera: null,
	controls: null,
	player: null,
	scene: null,
	mousePos: null,
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

		var planeGeometry = new THREE.PlaneGeometry(1000,1000, 1, 1);
		planeGeometry.applyMatrix( 
			 new THREE.Matrix4().makeRotationX(-Math.PI/2)
			);

		var plane = new THREE.Mesh(
				planeGeometry,
				new THREE.MeshBasicMaterial({color: 0xff8000})
			);
		plane.receiveShadow = true;
		this.scene.add(plane);

		// lights
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(300,40,300);
		light.castShadow = true;
		this.scene.add(light);


	},
	initPlayer: function() {
		var player = new THREE.Mesh(
				new THREE.SphereGeometry(5,8,8),
				new THREE.MeshLambertMaterial({color: 0x00ff00})
			);
		player.castShadow = true;
		player.position.y = 5;

		this.scene.add(player);

		this.camera.addTarget({
			name: 'player',
			targetObject: player,
			cameraPosition: new THREE.Vector3(20,20,200),
			fixed: false,
			stiffness: 0.1,
			matchRotation: true
		});

		this.camera.setTarget('player');


		this.controls = new ObjectControls({
			mousePos: this.mousePos,
			targetObject: player,
		/*	rotationDamping: 10000*/
		});

		document.addEventListener( 'mousemove', this.onMouseMove, false );
		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );

	},
	render: function() {
		this.controls.update(0.016); // ??
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

	    if( (y > 0 && y < threshold) || (y < 0 && y > -threshold) ) {
	        y = 0;
	    }
	
	    ld30.mousePos.set( x, 0 * y );
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
