import * as THREE from 'three';

export class WorldRenderer {
  public static readonly ARENA_SIZE = 32;
  public static readonly MAX_BLOCKS = 32 * 32 + 256; // 1024 suelo + hasta 256 obstáculos

  public instancedMesh: THREE.InstancedMesh;
  public voxelGrid: Uint8Array; // 0 = vacío, 1 = suelo, 2 = muro/obstáculo

  private dummy = new THREE.Object3D();
  private blockCount = 0;

  constructor(scene: THREE.Scene) {
    this.voxelGrid = new Uint8Array(WorldRenderer.ARENA_SIZE * WorldRenderer.ARENA_SIZE * 16);

    // 1. Geometría compartida para todos los cubos
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // 2. Material optimizado Lambert (bajo consumo de fragment shaders)
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true
    });

    // 3. InstancedMesh único: Dibuja todos los bloques en 1 solo Draw Call
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, WorldRenderer.MAX_BLOCKS);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.instancedMesh);

    this.generateArena();
  }

  private getGridIndex(x: number, y: number, z: number): number {
    return (x & 31) + ((z & 31) * WorldRenderer.ARENA_SIZE) + (y * 1024);
  }

  public isBlockSolid(x: number, y: number, z: number): boolean {
    if (x < 0 || x >= WorldRenderer.ARENA_SIZE || z < 0 || z >= WorldRenderer.ARENA_SIZE || y < 0 || y >= 16) {
      return false;
    }
    return this.voxelGrid[this.getGridIndex(x, y, z)] > 0;
  }

  private generateArena(): void {
    const floorColor = new THREE.Color(0x334155);
    const wallColor = new THREE.Color(0x475569);
    const accentColor = new THREE.Color(0x0284c7);

    this.blockCount = 0;

    // Suelo de la arena (32x32 bloques en y = 0)
    for (let x = 0; x < WorldRenderer.ARENA_SIZE; x++) {
      for (let z = 0; z < WorldRenderer.ARENA_SIZE; z++) {
        const isBorder = (x === 0 || x === WorldRenderer.ARENA_SIZE - 1 || z === 0 || z === WorldRenderer.ARENA_SIZE - 1);
        
        this.dummy.position.set(x + 0.5, 0.5, z + 0.5);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();

        this.instancedMesh.setMatrixAt(this.blockCount, this.dummy.matrix);
        
        if (isBorder) {
          this.instancedMesh.setColorAt(this.blockCount, wallColor);
          this.voxelGrid[this.getGridIndex(x, 0, z)] = 2;
        } else if ((x + z) % 8 === 0) {
          this.instancedMesh.setColorAt(this.blockCount, accentColor);
          this.voxelGrid[this.getGridIndex(x, 0, z)] = 1;
        } else {
          this.instancedMesh.setColorAt(this.blockCount, floorColor);
          this.voxelGrid[this.getGridIndex(x, 0, z)] = 1;
        }

        this.blockCount++;
      }
    }

    // Bordes perimetrales de altura 1 para delimitar la arena
    for (let x = 0; x < WorldRenderer.ARENA_SIZE; x++) {
      for (let z = 0; z < WorldRenderer.ARENA_SIZE; z++) {
        const isBorder = (x === 0 || x === WorldRenderer.ARENA_SIZE - 1 || z === 0 || z === WorldRenderer.ARENA_SIZE - 1);
        if (isBorder) {
          this.dummy.position.set(x + 0.5, 1.5, z + 0.5);
          this.dummy.scale.set(1, 1, 1);
          this.dummy.updateMatrix();

          this.instancedMesh.setMatrixAt(this.blockCount, this.dummy.matrix);
          this.instancedMesh.setColorAt(this.blockCount, wallColor);
          this.voxelGrid[this.getGridIndex(x, 1, z)] = 2;
          this.blockCount++;
        }
      }
    }

    // Actualizar matrices y colores en GPU
    this.instancedMesh.count = this.blockCount;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  public placeBlock(x: number, y: number, z: number, colorHex: number = 0x38bdf8): boolean {
    if (this.blockCount >= WorldRenderer.MAX_BLOCKS) return false;
    if (this.isBlockSolid(x, y, z)) return false;

    this.dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.dummy.scale.set(1, 1, 1);
    this.dummy.updateMatrix();

    this.instancedMesh.setMatrixAt(this.blockCount, this.dummy.matrix);
    this.instancedMesh.setColorAt(this.blockCount, new THREE.Color(colorHex));
    
    this.voxelGrid[this.getGridIndex(x, y, z)] = 1;
    this.blockCount++;

    this.instancedMesh.count = this.blockCount;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
    return true;
  }
}
