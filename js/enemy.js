var Enemy = function(position, size, gameScope) {
	
	this.mesh = new THREE.Mesh(
		new THREE.SphereGeometry(size, 8, 8),
		new THREE.MeshLambertMaterial({color: 0xffff00})
	);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.position.x = position.x;
	this.mesh.position.z = position.z;
	this.mesh.position.y = position.y;
	this.game = gameScope;
	this.healthPoints = size;
	return this;
}

Enemy.prototype.getMesh = function() {
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

Enemy.prototype.collidesWithMap = function() {
/*
	mapx = (this.mesh.position.x + 375)/50;
	mapy = (this.mesh.position.z + 375)/50;
	if (mapx <1 || mapx > 16 || mapy < 1 || mapy > 16) {
		return true;
	}
	fmapx = Math.floor(mapx);
	cmapx = Math.ceil(mapx);
	fmapy = Math.floor(mapy);
	cmapy = Math.ceil(mapy);


	var preCollisionList = [
		this.game.collidableMeshes[fmapy][fmapx],
		this.game.collidableMeshes[cmapy][fmapx],
		this.game.collidableMeshes[fmapy][cmapx],
		this.game.collidableMeshes[cmapy][cmapx],
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
	for (i=0;i<this.game.testRays.length;i++) {
		this.game.caster.set(this.mesh.position, this.game.testRays[i]);
		collisions = this.game.caster.intersectObjects(collisionList);
		if (collisions.length > 0 && collisions[0].distance <= 30) {
			return true;
		}

	}

	return false;
	*/
}