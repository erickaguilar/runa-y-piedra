import { WorldRenderer } from '../graphics/WorldRenderer';

export interface PlayerPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  onGround: boolean;
}

export class PhysicsWorld {
  public static readonly FIXED_TIMESTEP = 1 / 30; // 30 Hz
  public static readonly GRAVITY = -20; // m/s^2
  public static readonly PLAYER_HALF_WIDTH = 0.3;
  public static readonly PLAYER_HEIGHT = 1.8;

  private accumulator = 0;
  private worldRenderer: WorldRenderer;

  constructor(worldRenderer: WorldRenderer) {
    this.worldRenderer = worldRenderer;
  }

  public update(deltaTime: number, playerState: PlayerPhysicsState, inputX: number, inputZ: number, jump: boolean): void {
    // Acumulador de tiempo fijo desacoplado de los 60 FPS de pantalla
    this.accumulator += deltaTime;
    if (this.accumulator > 0.2) this.accumulator = 0.2; // Evitar espiral de la muerte

    while (this.accumulator >= PhysicsWorld.FIXED_TIMESTEP) {
      this.step(playerState, inputX, inputZ, jump);
      this.accumulator -= PhysicsWorld.FIXED_TIMESTEP;
    }
  }

  private step(p: PlayerPhysicsState, inputX: number, inputZ: number, jump: boolean): void {
    const dt = PhysicsWorld.FIXED_TIMESTEP;
    const moveSpeed = 6.0; // m/s

    // 1. Calcular aceleración y movimiento basado en input y yaw
    const sinYaw = Math.sin(p.yaw);
    const cosYaw = Math.cos(p.yaw);

    // Dirección frontal y lateral
    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    const targetVx = (rightX * inputX + forwardX * inputZ) * moveSpeed;
    const targetVz = (rightZ * inputX + forwardZ * inputZ) * moveSpeed;

    // Fricción/aceleración horizontal
    p.vx = targetVx;
    p.vz = targetVz;

    // Salto y Gravedad
    if (jump && p.onGround) {
      p.vy = 8.0;
      p.onGround = false;
    } else {
      p.vy += PhysicsWorld.GRAVITY * dt;
    }

    // 2. Integración y resolución de colisiones eje por eje (Sin asignación de memoria)
    // Eje Y (Vertical)
    const newY = p.y + p.vy * dt;
    if (this.checkCollision(p.x, newY, p.z)) {
      if (p.vy < 0) {
        p.onGround = true;
        p.y = Math.floor(newY) + 1.0; // Apoyado sobre el bloque
      }
      p.vy = 0;
    } else {
      p.y = newY;
      p.onGround = false;
    }

    // Eje X (Horizontal)
    const newX = p.x + p.vx * dt;
    if (!this.checkCollision(newX, p.y, p.z)) {
      p.x = newX;
    } else {
      p.vx = 0;
    }

    // Eje Z (Horizontal)
    const newZ = p.z + p.vz * dt;
    if (!this.checkCollision(p.x, p.y, newZ)) {
      p.z = newZ;
    } else {
      p.vz = 0;
    }

    // Límite de caída al vacío
    if (p.y < -10) {
      p.x = 16;
      p.y = 5;
      p.z = 16;
      p.vy = 0;
    }
  }

  // Comprueba la caja envolvente (AABB) del jugador contra los vóxeles adyacentes
  private checkCollision(px: number, py: number, pz: number): boolean {
    const hw = PhysicsWorld.PLAYER_HALF_WIDTH;
    const h = PhysicsWorld.PLAYER_HEIGHT;

    const minX = Math.floor(px - hw);
    const maxX = Math.floor(px + hw);
    const minY = Math.floor(py);
    const maxY = Math.floor(py + h);
    const minZ = Math.floor(pz - hw);
    const maxZ = Math.floor(pz + hw);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (this.worldRenderer.isBlockSolid(x, y, z)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
