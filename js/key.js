var Key = function(position, color, gameScope) {
	Entity.call(this, position, gameScope);
	this.keyColor = color;
}

Key.prototype = Object.create(Entity.prototype);
Key.prototype.isOpen = false;
Key.prototype.open = function() {
	this.isOpen = true;
}
Key.prototype.collect = function() {
	this.game.scene.remove(this.getMesh());
	this.alive = false;
}
Key.prototype.createMesh = function() {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(20,50,4),
		new THREE.MeshLambertMaterial({color: this.keyColor})
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

Key.prototype.update = function() {
	this.mesh.rotateY(0.03);

	return true;
}
