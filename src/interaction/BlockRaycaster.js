import * as THREE from 'three';
import { VoxelMap } from '../render/VoxelMap.js';
import { BLOCK_TYPES } from '../config/constants.js';

export class BlockRaycaster {
  constructor(camera, voxelMap, world) {
    this.camera = camera;
    this.voxelMap = voxelMap;
    this.world = world;
    this.renderers = null;

    this.raycaster = new THREE.Raycaster();
    this.screenCenter = new THREE.Vector2(0, 0);
  }

  setRenderers(renderers = {}) {
    this.renderers = renderers;
  }

  isMechanismDoor(door) {
    if (!door) return false;
    if (door.mechanism || door.lockedByPlate || door.mechanismOnly) return true;
    return Array.isArray(this.world.pressurePlates) &&
      this.world.pressurePlates.some(p => p.targetDoorId === door.id);
  }

  /**
   * Solo chequeos por proximidad (puertas, objetivos, losa, cofres), sin raycast.
   * Barato: apto para actualizar el botón contextual a ~8-10 Hz.
   * Retorna { type, ... } o null.
   */
  getProximityTarget(playerPos) {
    // 1. Puertas definidas en el nivel
    if (Array.isArray(this.world.doors) && this.world.doors.length > 0) {
      for (const door of this.world.doors) {
        const isOpen = this.world.isDoorOpenId ? this.world.isDoorOpenId(door.id) : (door.id === 1 ? this.world.isDoor1Open : this.world.isDoor2Open);
        if (!isOpen) {
          // Las puertas de mecanismo (losas de presión) solo se activan mediante sus mecanismos
          if (this.isMechanismDoor(door)) continue;

          const doorZ = door.z ?? 11;
          const doorX = door.x1 !== undefined ? (door.x1 + (door.x2 ?? door.x1)) / 2 : 11.5;
          const dist = Math.hypot(playerPos.x - doorX, playerPos.z - doorZ);
          if (dist < 2.4) {
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

    // 2b. Monolitos interactivos (Cartografía / Selección de capítulo / Mercader)
    if (Array.isArray(this.world.monoliths) && this.world.monoliths.length > 0) {
      for (let i = 0; i < this.world.monoliths.length; i++) {
        const m = this.world.monoliths[i];
        const dist = Math.hypot(playerPos.x - m.x, playerPos.z - m.z);
        if (dist < (m.triggerRadius || 2.8)) {
          const type = m.type || 'cartography';
          return {
            type,
            monolithId: m.id || type,
            message: m.completeMessage || m.name || (type === 'merchant' ? 'Pedestal del Mercader (Bazar Rúnico)' : 'Monolito de Cartografía'),
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
            const door = this.world.doors?.find(d => d.coords?.some(c => c.x === x && c.y === y && c.z === z))
              || this.world.doors?.find(d => Math.abs((d.z ?? 11) - z) <= 1);
            const doorId = door?.id ?? (z <= 15 ? 1 : 2);
            const isOpen = this.world.isDoorOpenId ? this.world.isDoorOpenId(doorId) : (doorId === 1 ? this.world.isDoor1Open : this.world.isDoor2Open);
            if (!isOpen) {
              if (this.isMechanismDoor(door)) {
                return { type: 'door_mechanism', doorId, x, y, z, message: door?.name || `Puerta ${doorId}` };
              }
              return { type: 'door', doorId, x, y, z, message: door?.name || `Puerta ${doorId}` };
            }
          }
          if (blockType === BLOCK_TYPES.PEDESTAL) {
            return { type: 'pedestal', x, y, z, message: 'Pedestal Ancestral del Santuario' };
          }
        }
      }
    }

    // 5. Chequeo por Raycaster mirando a props 3D interactivos (Losa de Escalinata Sellada, etc.)
    if (this.renderers?.stairsRenderer?.group && Array.isArray(this.world.stairwells)) {
      const activeStair = this.world.stairwells.find(w => !w.open);
      if (activeStair) {
        const sHits = this.raycaster.intersectObjects(this.renderers.stairsRenderer.group.children, true);
        if (sHits.length > 0 && sHits[0].distance <= maxDistance) {
          return { type: 'stairs', message: 'Losa sellada de la escalinata' };
        }
      }
    }

    return null;
  }

  /**
   * Obtiene información detallada del bloque o prop 3D apuntado por la retícula para depuración.
   */
  getTargetBlockDebug(maxDistance = 50) {
    this.raycaster.setFromCamera(this.screenCenter, this.camera);

    const candidates = [];

    // 1. Intersección con el mapa vóxel
    if (this.voxelMap?.mesh) {
      const voxelHits = this.raycaster.intersectObject(this.voxelMap.mesh, false);
      if (voxelHits.length > 0 && voxelHits[0].distance <= maxDistance) {
        const hit = voxelHits[0];
        const bIdx = this.voxelMap.instToBlock?.[hit.instanceId];
        if (bIdx !== undefined && bIdx !== -1) {
          const coords = VoxelMap.blockIndexToXYZ(bIdx);
          const blockType = this.world.get(coords.x, coords.y, coords.z);
          candidates.push({
            type: 'voxel',
            distance: hit.distance,
            coords,
            blockType,
            point: {
              x: Number(hit.point.x.toFixed(2)),
              y: Number(hit.point.y.toFixed(2)),
              z: Number(hit.point.z.toFixed(2)),
            },
          });
        }
      }
    }

    // 2. Intersección con entidades 3D (Cofres, Puertas, Pedestales, Losas, Escalinatas)
    const checkPropGroup = (group, category, resolver) => {
      if (!group) return;
      const hits = this.raycaster.intersectObjects(group.children, true);
      if (hits.length > 0 && hits[0].distance <= maxDistance) {
        const hit = hits[0];
        const info = resolver(hit);
        if (info) {
          candidates.push({
            type: 'prop3d',
            category,
            distance: hit.distance,
            ...info,
            point: {
              x: Number(hit.point.x.toFixed(2)),
              y: Number(hit.point.y.toFixed(2)),
              z: Number(hit.point.z.toFixed(2)),
            },
          });
        }
      }
    };

    if (this.renderers) {
      // Cofres
      if (this.renderers.chestRenderer?.group) {
        checkPropGroup(this.renderers.chestRenderer.group, 'chest', (hit) => {
          let cur = hit.object;
          let matched = null;
          for (const [id, c] of this.renderers.chestRenderer.chests.entries()) {
            if (c.chestGroup && (c.chestGroup === cur || c.chestGroup.getObjectById(cur.id))) {
              matched = { id, chest: c };
              break;
            }
          }
          const cData = matched?.chest;
          return {
            name: cData?.name || `Cofre ${matched?.id || ''}`,
            entityId: matched?.id,
            state: cData?.isOpen ? 'Abierto' : 'Cerrado',
            coords: cData ? { x: cData.x, y: cData.y, z: cData.z } : { x: Math.round(hit.point.x), y: Math.round(hit.point.y), z: Math.round(hit.point.z) },
          };
        });
      }

      // Puertas
      if (this.renderers.doorRenderer?.group) {
        checkPropGroup(this.renderers.doorRenderer.group, 'door', (hit) => {
          let matched = null;
          for (const [id, d] of this.renderers.doorRenderer.doors.entries()) {
            if ((d.frame && (d.frame === hit.object || d.frame.getObjectById(hit.object.id))) ||
                (d.leftPivot && (d.leftPivot === hit.object || d.leftPivot.getObjectById(hit.object.id))) ||
                (d.rightPivot && (d.rightPivot === hit.object || d.rightPivot.getObjectById(hit.object.id)))) {
              matched = { id, door: d };
              break;
            }
          }
          const dData = matched?.door;
          return {
            name: dData?.name || `Puerta 3D #${matched?.id || ''}`,
            entityId: matched?.id,
            state: dData?.isOpen ? 'Abierta' : 'Cerrada',
            coords: { x: Math.round(hit.point.x), y: Math.round(hit.point.y), z: Math.round(hit.point.z) },
          };
        });
      }

      // Pedestales y Altares
      if (this.renderers.pedestalRenderer?.group) {
        checkPropGroup(this.renderers.pedestalRenderer.group, 'pedestal', (hit) => {
          let matched = null;
          for (const [id, p] of this.renderers.pedestalRenderer.pedestals.entries()) {
            if (p.root && (p.root === hit.object || p.root.getObjectById(hit.object.id))) {
              matched = { id, pedestal: p };
              break;
            }
          }
          const pData = matched?.pedestal;
          let pName = 'Pedestal de Altar Rúnico';
          if (pData?.type === 'merchant' || pData?.isMerchant || String(matched?.id || '').includes('merchant')) {
            pName = 'Pedestal del Mercader (Bazar Rúnico)';
          } else if (String(matched?.id || '').startsWith('monolith') || pData?.isCartography) {
            pName = 'Mesa de Cartografía (Monolito)';
          }
          return {
            name: pName,
            entityId: matched?.id,
            state: pData?.isActive ? 'Activo' : 'Inactivo',
            coords: pData ? { x: pData.x, y: pData.y, z: pData.z } : { x: Math.round(hit.point.x), y: Math.round(hit.point.y), z: Math.round(hit.point.z) },
          };
        });
      }

      // Losas de presión
      if (this.renderers.pressurePlateRenderer?.group) {
        checkPropGroup(this.renderers.pressurePlateRenderer.group, 'pressure_plate', (hit) => {
          let matched = null;
          for (const [id, pl] of this.renderers.pressurePlateRenderer.plates.entries()) {
            if (pl.root && (pl.root === hit.object || pl.root.getObjectById(hit.object.id))) {
              matched = { id, plate: pl };
              break;
            }
          }
          const plData = matched?.plate;
          return {
            name: `Losa de Presión (${plData?.action || 'mecanismo'})`,
            entityId: matched?.id,
            state: plData?.isPressed ? 'Presionada' : 'Libre',
            coords: plData ? { x: plData.x, y: plData.y, z: plData.z } : { x: Math.round(hit.point.x), y: Math.round(hit.point.y), z: Math.round(hit.point.z) },
          };
        });
      }

      // Escalinata
      if (this.renderers.stairsRenderer?.group) {
        checkPropGroup(this.renderers.stairsRenderer.group, 'stairs', (hit) => {
          const s = this.renderers.stairsRenderer.stairs;
          return {
            name: 'Escalinata Ancestral Sellada',
            entityId: 'stairs',
            state: s?.state || 'cerrada',
            coords: { x: Math.round(hit.point.x), y: Math.round(hit.point.y), z: Math.round(hit.point.z) },
          };
        });
      }
    }

    if (candidates.length === 0) return null;

    // Tomar el elemento más cercano a la cámara
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0];
  }
}

