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
    // 1. Chequeo por proximidad a la Puerta 1 (z ~ 11)
    const distToDoor1 = Math.hypot(playerPos.x - 11.5, playerPos.z - 11);
    if (distToDoor1 < 3.2 && !this.world.isDoor1Open) {
      return { type: 'door', doorId: 1, message: 'Puerta 1 (Vestíbulo)' };
    }

    // 2. Chequeo por proximidad a la Puerta 2 (z ~ 24)
    const distToDoor2 = Math.hypot(playerPos.x - 11.5, playerPos.z - 24);
    if (distToDoor2 < 3.2 && !this.world.isDoor2Open) {
      return { type: 'door', doorId: 2, message: 'Puerta 2 (Santuario)' };
    }

    // 3. Chequeo por proximidad al pedestal ancestral (z ~ 30)
    const distToPedestal = Math.hypot(playerPos.x - 12.0, playerPos.z - 30);
    if (distToPedestal < 3.2) {
      return { type: 'pedestal', message: 'Pedestal Ancestral del Santuario' };
    }

    // 4. Chequeo por Raycaster mirando a bloques en el punto de mira
    this.raycaster.setFromCamera(this.screenCenter, this.camera);
    const hits = this.raycaster.intersectObject(this.voxelMap.mesh, false);

    if (hits.length > 0) {
      const hit = hits[0];
      if (hit.distance <= maxDistance) {
        const bIdx = this.voxelMap.instToBlock[hit.instanceId];
        if (bIdx !== -1) {
          const { x, y, z } = VoxelMap.blockIndexToXYZ(bIdx);
          const blockType = this.world.get(x, y, z);

          if (blockType === BLOCK_TYPES.DOOR) {
            const doorId = z <= 15 ? 1 : 2;
            const isOpen = doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
            if (!isOpen) {
              return { type: 'door', doorId, x, y, z, message: `Puerta ${doorId}` };
            }
          }
          if (blockType === BLOCK_TYPES.PEDESTAL) {
            return { type: 'pedestal', x, y, z, message: 'Pedestal Ancestral del Santuario' };
          }
        }
      }
    }

    return null;
  }
}
