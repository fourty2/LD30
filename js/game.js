
var ld30 = {};


ld30.init = function() {
	ld30.scene = new THREE.Scene();
	ld30.width = window.innerWidth;
	ld30.height = window.innerHeight;
	ld30.near = 0.1;
	ld30.far = 1000;

	ld30.renderer = new THREE.WebGLRenderer({antialias: true});
	ld30.renderer.setSize(ld30.width, ld30.height);
	ld30.renderer.shadowMapEnabled = true;
	ld30.renderer.shadowMapSoft = true;

	document.body.appendChild(ld30.renderer.domElement);

	// camera

	ld30.camera = new THREE.PerspectiveCamera(45, ld30.width / ld30.height, ld30.near, ld30.far);
	ld30.camera.position.z = 100;
	ld30.camera.position.y = -100;
	ld30.camera.rotation.x = 40 * (Math.PI/180);
//	ld30.camera.lookAt(0,0,0);

	ld30.scene.add(ld30.camera);


	// erstmal plane, später model

	var plane = new THREE.Mesh(
			new THREE.PlaneGeometry(150,150, 1, 1),
			new THREE.MeshLambertMaterial({color: 0xff8000})
		);
	plane.receiveShadow = true;
	ld30.scene.add(plane);


	var player = new THREE.Mesh(
			new THREE.SphereGeometry(10,16,16),
			new THREE.MeshLambertMaterial({color: 0x00ff00})
		);
	player.castShadow = true;
	player.position.z = 10;

	ld30.scene.add(player);


	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(300,0,300);
	light.castShadow = true;
	ld30.scene.add(light);


}

ld30.animate = function() {
	requestAnimationFrame(ld30.animate);

	ld30.renderer.render(ld30.scene, ld30.camera);
}


ld30.init();
ld30.animate();
