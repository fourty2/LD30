var WIDTH = 100;
var HEIGHT = 100;
var NEAR = 0.1;
var FAR = 200;
var FOV = 45;
minicanvas = document.getElementById('minikey');
var renderer = new THREE.WebGLRenderer({canvas: minicanvas, antialias: true, alpha: true});
renderer.setSize(WIDTH, HEIGHT);
/*renderer.setClearColor( 0xff8033, 1);*/
var camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 
			NEAR, FAR);

camera.position.set(30,0,30);
camera.lookAt(new THREE.Vector3(0,0,0));


var scene = new THREE.Scene();
scene.add(this.camera);

var light = new THREE.DirectionalLight(0xffA020);
      light.intensity = 1.0;
//      light.position.set(0.5, 0.2, -2);
	  light.position.set(400,120,400);
      light.target.position.set(0, 0, 0);
scene.add(light);
var key = null;
var loader = new THREE.JSONLoader();
loader.load('models/key.js', function(geometry, materials) {
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -0.15 ) );
	key = new THREE.Mesh(
		geometry,
		new THREE.MeshLambertMaterial({color:0xF000F0})
	);
	key.position.x = 0;
	key.position.y = -8;
	key.position.z = 0;
	key.scale.set(10,10,10);

	scene.add(key);

});


function animate() {
	requestAnimationFrame(animate);
	if (key) { key.rotateY(0.05); }
renderer.render(scene, camera);
}

animate();

