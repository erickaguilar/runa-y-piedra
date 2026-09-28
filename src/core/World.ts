export class World {
  public static readonly SIZE = 24; // 24x24 bloques
  public static readonly HEIGHT = 16;
  public static readonly TOTAL_BLOCKS = 24 * 24 * 16;

  public voxels: Uint8Array;

  constructor() {
    this.voxels = new Uint8Array(World.TOTAL_BLOCKS);
    this.initArena();
  }

  public getIndex(x: number, y: number, z: number): number {
    return (x & 31) + ((z & 31) * World.SIZE) + (y * (World.SIZE * World.SIZE));
  }

  public isSolid(x: number, y: number, z: number): boolean {
    if (x < 0 || x >= World.SIZE || z < 0 || z >= World.SIZE || y < 0 || y >= World.HEIGHT) {
      return false;
    }
    return this.voxels[this.getIndex(x, y, z)] > 0;
  }

  public setBlock(x: number, y: number, z: number, type: number): boolean {
    if (x < 0 || x >= World.SIZE || z < 0 || z >= World.SIZE || y < 0 || y >= World.HEIGHT) {
      return false;
    }
    this.voxels[this.getIndex(x, y, z)] = type & 0xff;
    return true;
  }

  public getBlock(x: number, y: number, z: number): number {
    if (x < 0 || x >= World.SIZE || z < 0 || z >= World.SIZE || y < 0 || y >= World.HEIGHT) {
      return 0;
    }
    return this.voxels[this.getIndex(x, y, z)];
  }

  private initArena(): void {
    // Generar suelo base (24x24 cubos en y = 0)
    for (let x = 0; x < World.SIZE; x++) {
      for (let z = 0; z < World.SIZE; z++) {
        const isBorder = (x === 0 || x === World.SIZE - 1 || z === 0 || z === World.SIZE - 1);
        if (isBorder) {
          this.setBlock(x, 0, z, 2); // Borde indestructible
          this.setBlock(x, 1, z, 2); // Muro de contención de 1 bloque de altura
        } else {
          this.setBlock(x, 0, z, 1); // Bloque de suelo estándar
        }
      }
    }
  }
}
