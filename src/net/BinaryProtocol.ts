export const enum PacketType {
  MOVE_13_BYTE = 0x01,
  STATE_FULL_17_BYTE = 0x02,
  BLOCK_CHANGE_5_BYTE = 0x03
}

export interface PlayerTransform {
  x: number;
  z: number;
  yaw: number;
}

export interface FullPlayerState {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export interface BlockChange {
  x: number;
  y: number;
  z: number;
  blockType: number;
}

export class BinaryProtocol {
  // Buffers pre-asignados reutilizables (Cero Garbage Collection)
  private static moveBuffer = new ArrayBuffer(13);
  private static moveView = new DataView(BinaryProtocol.moveBuffer);

  private static fullStateBuffer = new ArrayBuffer(17);
  private static fullStateView = new DataView(BinaryProtocol.fullStateBuffer);

  private static blockBuffer = new ArrayBuffer(5);
  private static blockView = new DataView(BinaryProtocol.blockBuffer);

  // 1. Paquete de movimiento de 13 bytes exactos (especificación de rendimiento)
  // [1B ID (0x01)] [4B Float32 X] [4B Float32 Z] [4B Float32 Yaw]
  public static packMove13(x: number, z: number, yaw: number): ArrayBuffer {
    this.moveView.setUint8(0, PacketType.MOVE_13_BYTE);
    this.moveView.setFloat32(1, x, true); // Little endian
    this.moveView.setFloat32(5, z, true);
    this.moveView.setFloat32(9, yaw, true);
    return this.moveBuffer;
  }

  public static unpackMove13(view: DataView, out: PlayerTransform): void {
    out.x = view.getFloat32(1, true);
    out.z = view.getFloat32(5, true);
    out.yaw = view.getFloat32(9, true);
  }

  // 2. Paquete de estado completo 3D (17 bytes: ID + X + Y + Z + Yaw)
  public static packFullState17(x: number, y: number, z: number, yaw: number): ArrayBuffer {
    this.fullStateView.setUint8(0, PacketType.STATE_FULL_17_BYTE);
    this.fullStateView.setFloat32(1, x, true);
    this.fullStateView.setFloat32(5, y, true);
    this.fullStateView.setFloat32(9, z, true);
    this.fullStateView.setFloat32(13, yaw, true);
    return this.fullStateBuffer;
  }

  public static unpackFullState17(view: DataView, out: FullPlayerState): void {
    out.x = view.getFloat32(1, true);
    out.y = view.getFloat32(5, true);
    out.z = view.getFloat32(9, true);
    out.yaw = view.getFloat32(13, true);
  }

  // 3. Paquete de modificación de bloque (5 bytes: ID + X + Y + Z + Tipo)
  public static packBlockChange5(x: number, y: number, z: number, blockType: number): ArrayBuffer {
    this.blockView.setUint8(0, PacketType.BLOCK_CHANGE_5_BYTE);
    this.blockView.setUint8(1, x & 0xff);
    this.blockView.setUint8(2, y & 0xff);
    this.blockView.setUint8(3, z & 0xff);
    this.blockView.setUint8(4, blockType & 0xff);
    return this.blockBuffer;
  }

  public static unpackBlockChange5(view: DataView, out: BlockChange): void {
    out.x = view.getUint8(1);
    out.y = view.getUint8(2);
    out.z = view.getUint8(3);
    out.blockType = view.getUint8(4);
  }
}
