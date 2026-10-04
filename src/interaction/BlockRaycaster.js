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

  /**
   * Solo chequeos por proximidad (puertas, objetivos, losa, cofres), sin raycast.
   * Barato: apto para actualizar el botón contextual a ~8-10 Hz.
   * Retorna { type, ... } o null.
   */
  getProximityTarget(playerPos) {
    // 0. Losas de presión mecánicas (mientras sigan activables)
    if (Array.isArray(this.world.pressurePlates) && this.world.pressurePlates.length > 0) {
      for (const plate of this.world.pressurePlates) {
        if (!plate.isPressed) {
          const dist = Math.hypot(playerPos.x - plate.x, playerPos.z - plate.z);
          if (dist < (plate.triggerRadius || 2.4)) {
            return {
              type: 'pressure_plate',
              plateId: plate.id,
              name: plate.name || 'Losa de Presión',
              message: plate.name || 'Losa de Presión Mecánica',
            };
          }
        }
      }
    }

    // 1. Puertas definidas en el nivel
    if (Array.isArray(this.world.doors) && this.world.doors.length > 0) {
      for (const door of this.world.doors) {
        const isOpen = door.id === 1 ? this.world.isDoor1Open : this.world.isDoor2Open;
        if (!isOpen) {
          const doorZ = door.z ?? 11;
          const dist = Math.hypot(playerPos.x - 11.5, playerPos.z - doorZ);
          if (dist < 3.2) {
            return { type: 'door', doorId: door.id, message: door.name };
          }
        }
      }
    }

    // 2. Objetivos/pedestales del nivel
    if (Array.isArray(this.world.objectives) && this.world.objectives.length > 0) {
      for (let i = 0; i < this.world.objectives.length; i++) {
        const obj = this.world.objectives[i];
        const dist = Math.hypot(playerPos.x - obj.x, playerPos.z - obj.z);
        if (dist < (obj.triggerRadius || 3.2)) {
          return { type: obj.type || 'pedestal', objIndex: i, message: obj.completeMessage || obj.name };
        }
      }
    }

    // 2b. Monolitos interactivos (Cartografía / Selección de capítulo)
    if (Array.isArray(this.world.monoliths) && this.world.monoliths.length > 0) {
      for (let i = 0; i < this.world.monoliths.length; i++) {
        const m = this.world.monoliths[i];
        const dist = Math.hypot(playerPos.x - m.x, playerPos.z - m.z);
        if (dist < (m.triggerRadius || 2.8)) {
          return {
            type: m.type || 'cartography',
            monolithId: m.id || 'cartography',
            message: m.completeMessage || m.name || 'Monolito de Cartografía',
          };
        }
      }
    }

    // 2b. Losa sellada de la escalinata (mientras siga cerrada)
    if (Array.isArray(this.world.stairwells) && this.world.stairwells.length > 0) {
      for (const w of this.world.stairwells) {
        if (w.open) continue;
        const qx = Math.min(Math.max(playerPos.x, w.x1), w.x2 + 1);
        const qz = Math.min(Math.max(playerPos.z, w.z1), w.z2 + 1);
        if (Math.hypot(playerPos.x - qx, playerPos.z - qz) < 2.8) {
          return { type: 'stairs', message: 'Losa sellada de la escalinata' };
        }
      }
    }

    // 3. Cofres del tesoro
    if (Array.isArray(this.world.chests) && this.world.chests.length > 0) {
      for (const chest of this.world.chests) {
        if (!chest.isOpen) {
          const dist = Math.hypot(playerPos.x - chest.x, playerPos.z - chest.z);
          if (dist < 2.8) {
            return {
              type: 'chest',
              chestId: chest.id,
              name: chest.name || 'Cofre del Tesoro',
              reward: chest.reward,
              message: chest.message,
            };
          }
        }
      }
    }

    return null;
  }

  getTargetInteraction(playerPos, maxDistance = 5.0) {
    // 1-3. Proximidad (puertas con fallback legacy, objetivos, losa, cofres)
    const prox = this.getProximityTarget(playerPos);
    if (prox) return prox;

    // Fallback legacy solo para puertas si el nivel no define ninguna
    if (!Array.isArray(this.world.doors) || this.world.doors.length === 0) {
      const distToDoor1 = Math.hypot(playerPos.x - 11.5, playerPos.z - 11);
      if (distToDoor1 < 3.2 && !this.world.isDoor1Open) {
        return { type: 'door', doorId: 1, message: 'Puerta 1 (Vestíbulo)' };
      }
      const distToDoor2 = Math.hypot(playerPos.x - 11.5, playerPos.z - 24);
      if (distToDoor2 < 3.2 && !this.world.isDoor2Open) {
        return { type: 'door', doorId: 2, message: 'Puerta 2 (Santuario)' };
      }
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
