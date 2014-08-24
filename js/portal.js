var Portal = function(position, toWorld, color, gameScope) {
	Entity.call(this, position, gameScope);
	this.doorColor = color;
	this.toWorld = toWorld
}

Portal.prototype = Object.create(Entity.prototype);

Portal.prototype.createMesh = function() {
	this.mesh = new THREE.Mesh(
		new THREE.TorusGeometry(22,8,32, 16),
		new THREE.MeshLambertMaterial({
			shading: THREE.FlatShading, color: this.doorColor, emissive: this.doorColor, ambient: this.doorColor, fog: false,
		side: THREE.DoubleSide})
	);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.position.x = this.initPosition.x;
	this.mesh.position.z = this.initPosition.z;
	this.mesh.position.y = this.initPosition.y;
	this.mesh.rotateY(Math.PI/2);
	//this.mesh.rotation.copy(this.initRotation);
	this.setAlive();
	return this.mesh;
}

Portal.prototype.update = function() {

	return true;
}
