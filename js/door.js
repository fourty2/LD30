var Door = function(position, color, gameScope) {
	Entity.call(this, position, gameScope);
	this.doorColor = color;
}

Door.prototype = Object.create(Entity.prototype);
Door.prototype.isOpen = false;
Door.prototype.open = function() {
	this.isOpen = true;
}

Door.prototype.createMesh = function() {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(50,15,4),
		new THREE.MeshLambertMaterial({color: this.doorColor})
	);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.position.x = this.initPosition.x;
	this.mesh.position.z = this.initPosition.z;
	this.mesh.position.y = this.initPosition.y;
	//this.mesh.rotation.copy(this.initRotation);
		this.setAlive();
	return this.mesh;
}

Door.prototype.update = function() {
	if (this.isOpen && this.mesh.position.y > -10) {
		this.mesh.translateY(-1);
	}

	return true;
}
