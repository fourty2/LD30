// base entity class

var Entity = function(position, gameScope) {
	this.game = gameScope;
	this.initPosition = position;
//	return this;
}

Entity.prototype = {
	mesh: null,
	boundingBox: 50,
	alive: false,
	getMesh: function() {
		return this.mesh;
	},
	update: function() {
		return true;
	},
	createMesh: function() {
		// dummy mesh
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry(10,10,10),
			new THREE.MeshLambertMaterial({color: 0xffffff})
		);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.mesh.position.x = this.initPosition.x;
		this.mesh.position.z = this.initPosition.z;
		this.mesh.position.y = this.initPosition.y;
		this.setAlive();
		return this.mesh;
	},
	setAlive: function() {
		this.alive = true;
	},
	collidesWithMap: function() {
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
			if (collisions.length > 0 && collisions[0].distance <= (this.boundingBox / 2)) {
				return true;
			}

		}

		return false;

	},
	afterEntityCollide: function(entityIndex) {
		// maybe damage to enemies?
		return true;
	},
	collidesWithEntity: function() {
		var collisionList = [];
		for (entityIndex = 0; entityIndex < this.game.entities.length; entityIndex++) {
			collisionList = [this.game.entities[entityIndex].getMesh()];
			for (i = 0; i < this.game.testRays.length; i++) {
				this.game.caster.set(this.mesh.position, this.game.testRays[i]);
				collisions = this.game.caster.intersectObjects(collisionList);
				if (collisions.length > 0 && collisions[0].distance <= (this.boundingBox / 2)) {
					return this.afterEntityCollide(entityIndex);
				}
			}		
		}
		return false;
	},
	preKill: function() {
		// some explosions?
	},
	kill: function() {
		this.preKill();
		index = this.game.entities.indexOf(this);
		if (index != -1) {
			this.game.scene.remove(this.getMesh());
			this.game.entities.splice(index, 1);
			this.alive = false;
		}
	} 
}