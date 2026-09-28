import * as THREE from 'three';
import { VoxelMap } from '../render/VoxelMap.js';
import { BLOCK_TYPES } from '../config/constants.js';

export class BlockRaycaster {
  constructor(camera, voxelMap, world) {
    this.camera = camera;
    this.voxelMap = voxelMap;
    this.world = world;

    this.raycaster = new THREE.Raycaster();
    this.screenCenter = new THREE.Vector2(0, 0);
  }

  getTargetInteraction(playerPos, maxDistance = 5.0) {
    // 1. Chequeo por proximidad a la Gran Puerta (x ~ 11.5, z ~ 12)
    const distToDoor = Math.hypot(playerPos.x - 11.5, playerPos.z - 12);
    if (distToDoor < 3.2 && !this.world.isDoorOpen) {
      return { type: 'door', message: 'Gran Puerta de la Mazmorra' };
    }

    // 2. Chequeo por Raycaster mirando a bloques
    this.raycaster.setFromCamera(this.screenCenter, this.camera);
    const hits = this.raycaster.intersectObject(this.voxelMap.mesh, false);

    if (hits.length > 0) {
      const hit = hits[0];
      if (hit.distance <= maxDistance) {
        const bIdx = this.voxelMap.instToBlock[hit.instanceId];
        if (bIdx !== -1) {
          const { x, y, z } = VoxelMap.blockIndexToXYZ(bIdx);
          const blockType = this.world.get(x, y, z);

          if (blockType === BLOCK_TYPES.DOOR && !this.world.isDoorOpen) {
            return { type: 'door', x, y, z, message: 'Gran Puerta de la Mazmorra' };
          }
          if (blockType === BLOCK_TYPES.PEDESTAL) {
            return { type: 'pedestal', x, y, z, message: 'Pedestal Ancestral de la Cripta' };
          }
        }
      }
    }

    // 3. Chequeo por proximidad al pedestal ancestral
    const distToPedestal = Math.hypot(playerPos.x - 12.5, playerPos.z - 18.5);
    if (distToPedestal < 3.0) {
      return { type: 'pedestal', message: 'Pedestal Ancestral de la Cripta' };
    }

    return null;
  }
}
