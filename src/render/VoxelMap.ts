import * as THREE from 'three';
import { World } from '../core/World';

export class VoxelMap {
  public static readonly MAX_INSTANCES = 1024;
  public instancedMesh: THREE.InstancedMesh;

  private world: World;
  private dummy = new THREE.Object3D();
  private blockToInstance: Int32Array; // Mapeo de (x, y, z) a instanceId
  private instancePositions: Float32Array; // Posición de cada instancia (3 floats por instancia)
  private nextInstanceId = 0;

  constructor(scene: THREE.Scene, world: World) {
    this.world = world;
    this.blockToInstance = new Int32Array(World.TOTAL_BLOCKS).fill(-1);
    this.instancePositions = new Float32Array(VoxelMap.MAX_INSTANCES * 3);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, VoxelMap.MAX_INSTANCES);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.instancedMesh);

    this.buildFromWorld();
  }

  private buildFromWorld(): void {
    const floorColor = new THREE.Color(0x334155);
    const wallColor = new THREE.Color(0x475569);
    const accentColor = new THREE.Color(0x0284c7);

    for (let x = 0; x < World.SIZE; x++) {
      for (let z = 0; z < World.SIZE; z++) {
        for (let y = 0; y < World.HEIGHT; y++) {
          const type = this.world.getBlock(x, y, z);
          if (type > 0) {
            const id = this.nextInstanceId++;
            const idx = this.world.getIndex(x, y, z);
            this.blockToInstance[idx] = id;

            this.instancePositions[id * 3 + 0] = x;
            this.instancePositions[id * 3 + 1] = y;
            this.instancePositions[id * 3 + 2] = z;

            this.dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
            this.dummy.scale.set(1, 1, 1);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(id, this.dummy.matrix);

            if (type === 2) {
              this.instancedMesh.setColorAt(id, wallColor);
            } else if ((x + z) % 6 === 0) {
              this.instancedMesh.setColorAt(id, accentColor);
            } else {
              this.instancedMesh.setColorAt(id, floorColor);
            }
          }
        }
      }
    }

    this.instancedMesh.count = this.nextInstanceId;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  // Destrucción de bloques: Escalar a (0, 0, 0) y trasladar a (0, -9999, 0)
  public destroyBlock(x: number, y: number, z: number): boolean {
    const idx = this.world.getIndex(x, y, z);
    const instanceId = this.blockToInstance[idx];
    if (instanceId === -1) return false;

    // Actualizar estado en el mundo maestro
    this.world.setBlock(x, y, z, 0);
    this.blockToInstance[idx] = -1;

    // Técnica de destrucción estricta para InstancedMesh
    this.dummy.position.set(0, -9999, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();

    this.instancedMesh.setMatrixAt(instanceId, this.dummy.matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    return true;
  }

  // Colocación de bloques en coordenada de cuadrícula
  public placeBlock(x: number, y: number, z: number, colorHex: number = 0x38bdf8): boolean {
    if (this.world.isSolid(x, y, z)) return false;
    if (this.nextInstanceId >= VoxelMap.MAX_INSTANCES) return false;

    const id = this.nextInstanceId++;
    const idx = this.world.getIndex(x, y, z);
    this.world.setBlock(x, y, z, 1);
    this.blockToInstance[idx] = id;

    this.instancePositions[id * 3 + 0] = x;
    this.instancePositions[id * 3 + 1] = y;
    this.instancePositions[id * 3 + 2] = z;

    this.dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.dummy.scale.set(1, 1, 1);
    this.dummy.updateMatrix();

    this.instancedMesh.setMatrixAt(id, this.dummy.matrix);
    this.instancedMesh.setColorAt(id, new THREE.Color(colorHex));

    this.instancedMesh.count = this.nextInstanceId;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    return true;
  }

  // Obtener coordenada del bloque a partir del ID de instancia interceptado por Raycaster
  public getCoordinatesFromInstance(instanceId: number, out: { x: number; y: number; z: number }): boolean {
    if (instanceId < 0 || instanceId >= this.nextInstanceId) return false;
    out.x = Math.round(this.instancePositions[instanceId * 3 + 0]);
    out.y = Math.round(this.instancePositions[instanceId * 3 + 1]);
    out.z = Math.round(this.instancePositions[instanceId * 3 + 2]);
    return true;
  }
}
