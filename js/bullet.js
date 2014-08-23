


var Bullet = function(position, rotation, gameScope) {
	Entity.call(this, position, gameScope);
	this.initRotation = rotation;
}

Bullet.prototype = Object.create(Entity.prototype);

Bullet.prototype.createMesh = function() {
	this.mesh = new THREE.Mesh(
		new THREE.BoxGeometry(5,5,5),
		new THREE.MeshLambertMaterial({color: 0xffff00})
	);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.position.x = this.initPosition.x;
	this.mesh.position.z = this.initPosition.z;
	this.mesh.position.y = this.initPosition.y;
	this.mesh.rotation.copy(this.initRotation);
	return this.mesh;
}

Bullet.prototype.update = function() {

	this.mesh.translateZ(-20);
	if (this.collidesWithMap() || this.collidesWithEntity()) {
		this.kill();
		return false;
	}
	return true;
}

Bullet.prototype.preKill = function() {

}

Bullet.prototype.afterEntityCollide = function(index) {
	if (this.game.entities[index] instanceof Enemy) {
		if (!this.game.entities[index].damage(5)) {
			this.game.entities[index].kill();
		}
	} 
}