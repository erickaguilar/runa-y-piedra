export const enum MessageType {
  CLIENT_INPUT = 0x01,
  HOST_SNAPSHOT = 0x02,
  BLOCK_MOD = 0x03,
  INITIAL_SYNC = 0x04
}

export interface ClientInputData {
  deltaX: number;
  deltaZ: number;
  yaw: number;
}

export interface BlockModData {
  action: number; // 0 = Destruir, 1 = Colocar
  x: number;
  y: number;
  z: number;
}

export interface HostSnapshotData {
  hostX: number;
  hostY: number;
  hostZ: number;
  hostYaw: number;
  clientX: number;
  clientY: number;
  clientZ: number;
  clientYaw: number;
}

export class Protocol {
  // Buffers pre-asignados reutilizables (Cero Garbage Collection)
  private static inputBuffer = new ArrayBuffer(13);
  private static inputView = new DataView(Protocol.inputBuffer);

  private static blockBuffer = new ArrayBuffer(14);
  private static blockView = new DataView(Protocol.blockBuffer);

  private static snapshotBuffer = new ArrayBuffer(33); // 1B tipo + 8 floats (32B)
  private static snapshotView = new DataView(Protocol.snapshotBuffer);

  // 1. Paquete de movimiento de 13 bytes exactos
  // [0] Uint8 -> 0x01 | [1..4] Float32 dX | [5..8] Float32 dZ | [9..12] Float32 yaw
  public static packInput(deltaX: number, deltaZ: number, yaw: number): ArrayBuffer {
    this.inputView.setUint8(0, MessageType.CLIENT_INPUT);
    this.inputView.setFloat32(1, deltaX, true);
    this.inputView.setFloat32(5, deltaZ, true);
    this.inputView.setFloat32(9, yaw, true);
    return this.inputBuffer;
  }

  public static unpackInput(view: DataView, out: ClientInputData): void {
    out.deltaX = view.getFloat32(1, true);
    out.deltaZ = view.getFloat32(5, true);
    out.yaw = view.getFloat32(9, true);
  }

  // 2. Paquete de modificación de bloque de 14 bytes exactos
  // [0] Uint8 -> 0x03 | [1] Uint8 action | [2..5] Int32 X | [6..9] Int32 Y | [10..13] Int32 Z
  public static packBlockMod(action: number, x: number, y: number, z: number): ArrayBuffer {
    this.blockView.setUint8(0, MessageType.BLOCK_MOD);
    this.blockView.setUint8(1, action & 0xff);
    this.blockView.setInt32(2, x, true);
    this.blockView.setInt32(6, y, true);
    this.blockView.setInt32(10, z, true);
    return this.blockBuffer;
  }

  public static unpackBlockMod(view: DataView, out: BlockModData): void {
    out.action = view.getUint8(1);
    out.x = view.getInt32(2, true);
    out.y = view.getInt32(6, true);
    out.z = view.getInt32(10, true);
  }

  // 3. Paquete de snapshot autoritativo del Host (33 bytes)
  public static packSnapshot(
    hX: number, hY: number, hZ: number, hYaw: number,
    cX: number, cY: number, cZ: number, cYaw: number
  ): ArrayBuffer {
    this.snapshotView.setUint8(0, MessageType.HOST_SNAPSHOT);
    this.snapshotView.setFloat32(1, hX, true);
    this.snapshotView.setFloat32(5, hY, true);
    this.snapshotView.setFloat32(9, hZ, true);
    this.snapshotView.setFloat32(13, hYaw, true);
    this.snapshotView.setFloat32(17, cX, true);
    this.snapshotView.setFloat32(21, cY, true);
    this.snapshotView.setFloat32(25, cZ, true);
    this.snapshotView.setFloat32(29, cYaw, true);
    return this.snapshotBuffer;
  }

  public static unpackSnapshot(view: DataView, out: HostSnapshotData): void {
    out.hostX = view.getFloat32(1, true);
    out.hostY = view.getFloat32(5, true);
    out.hostZ = view.getFloat32(9, true);
    out.hostYaw = view.getFloat32(13, true);
    out.clientX = view.getFloat32(17, true);
    out.clientY = view.getFloat32(21, true);
    out.clientZ = view.getFloat32(25, true);
    out.clientYaw = view.getFloat32(29, true);
  }
}
