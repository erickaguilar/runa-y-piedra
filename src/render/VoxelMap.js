import * as THREE from 'three';
import { WORLD_X, WORLD_Y, WORLD_Z, BLOCK_AIR } from '../core/World.js';
import { BLOCK_COLORS } from '../config/constants.js';
import { TextureGenerator } from './TextureGenerator.js';

const THREE_COLORS = {
  1: new THREE.Color(BLOCK_COLORS[1]),
  2: new THREE.Color(BLOCK_COLORS[2]),
  3: new THREE.Color(BLOCK_COLORS[3]),
  4: new THREE.Color(BLOCK_COLORS[4]),
};

export class VoxelMap {
  constructor(scene, world) {
    this.world = world;
    this.scene = scene;
    this.max = WORLD_X * WORLD_Y * WORLD_Z;

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const texture = TextureGenerator.createVoxelTexture(64);
    const mat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: texture,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, this.max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;

    this.dummy = new THREE.Object3D();

    // Mapeos biyectivos
    this.blockToInst = new Int32Array(this.max).fill(-1);
    this.instToBlock = new Int32Array(this.max).fill(-1);
    this.freeSlots = [];
    this.usedCount = 0;

    scene.add(this.mesh);

    this.rebuildFromWorld();
  }

  addBlock(x, y, z, type) {
    const bIdx = this.world.idx(x, y, z);
    if (this.blockToInst[bIdx] !== -1) return;

    let inst;
    if (this.freeSlots.length) inst = this.freeSlots.pop();
    else inst = this.usedCount++;

    if (inst >= this.max) {
      console.warn('InstancedMesh full');
      return;
    }

    this.blockToInst[bIdx] = inst;
    this.instToBlock[inst] = bIdx;

    this.dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(1, 1, 1);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(inst, this.dummy.matrix);

    this.mesh.setColorAt(inst, THREE_COLORS[type] || THREE_COLORS[1]);
    this.mesh.count = Math.max(this.mesh.count, inst + 1);
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  removeBlock(x, y, z) {
    const bIdx = this.world.idx(x, y, z);
    const inst = this.blockToInst[bIdx];
    if (inst === -1) return;

    // Fuera de pantalla + escala 0
    this.dummy.position.set(0, -9999, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(inst, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;

    this.blockToInst[bIdx] = -1;
    this.instToBlock[inst] = -1;
    this.freeSlots.push(inst);
  }

  rebuildFromWorld() {
    this.blockToInst.fill(-1);
    this.instToBlock.fill(-1);
    this.freeSlots.length = 0;
    this.usedCount = 0;
    this.mesh.count = 0;

    for (let x = 0; x < WORLD_X; x++) {
      for (let y = 0; y < WORLD_Y; y++) {
        for (let z = 0; z < WORLD_Z; z++) {
          const t = this.world.get(x, y, z);
          if (t !== BLOCK_AIR) this.addBlock(x, y, z, t);
        }
      }
    }
  }

  /** Convierte índice interno en coordenadas {x, y, z}. */
  static blockIndexToXYZ(bIdx) {
    const x = bIdx % WORLD_X;
    const y = Math.floor(bIdx / WORLD_X) % WORLD_Y;
    const z = Math.floor(bIdx / (WORLD_X * WORLD_Y));
    return { x, y, z };
  }
}
