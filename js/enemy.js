var Enemy = function(position, size, gameScope) {
	Entity.call(this, position, gameScope);
	this.initSize = size;
	this.healthPoints = size;
}

Enemy.prototype = Object.create(Entity.prototype);

Enemy.prototype.createMesh = function() {
	this.mesh = new THREE.Mesh(
		new THREE.SphereGeometry(this.initSize, 8, 8),
		new THREE.MeshLambertMaterial({color: 0xffff00})
	);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.position.x = this.initPosition.x;
	this.mesh.position.z = this.initPosition.z;
	this.mesh.position.y = this.initPosition.y;

	return this.mesh;
}

Enemy.prototype.damage = function(value)  {
	this.healthPoints -=value;
	return this.healthPoints > 0;
}

Enemy.prototype.update = function() {

	this.mesh.translateZ(-0.1);
	return true; 
/*	if (this.collidesWithMap()) {
		return false;
	}
	return true;*/
}
