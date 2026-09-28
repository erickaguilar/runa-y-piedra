import * as THREE from 'three';
import { VoxelMap } from '../render/VoxelMap.js';

export class BlockRaycaster {
  constructor(camera, voxelMap, world) {
    this.camera = camera;
    this.voxelMap = voxelMap;
    this.world = world;

    this.raycaster = new THREE.Raycaster();
    this.screenCenter = new THREE.Vector2(0, 0);
  }

  getTargetBlock(maxDistance = 7.0) {
    this.raycaster.setFromCamera(this.screenCenter, this.camera);
    const hits = this.raycaster.intersectObject(this.voxelMap.mesh, false);

    if (!hits.length) return null;
    const hit = hits[0];
    if (hit.distance > maxDistance) return null;

    const bIdx = this.voxelMap.instToBlock[hit.instanceId];
    if (bIdx === -1) return null;

    const { x, y, z } = VoxelMap.blockIndexToXYZ(bIdx);
    const normal = hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0);

    const placeCoord = {
      x: x + Math.round(normal.x),
      y: y + Math.round(normal.y),
      z: z + Math.round(normal.z),
    };

    return {
      x,
      y,
      z,
      normal,
      placeCoord,
      isPlaceValid: this.world.inBounds(placeCoord.x, placeCoord.y, placeCoord.z),
    };
  }
}
