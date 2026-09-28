import { World } from './World';

export interface EntityState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  onGround: boolean;
}

export class PhysicsAABB {
  public static readonly FIXED_TIMESTEP = 1 / 30; // 30 Hz
  public static readonly GRAVITY = -22.0; // m/s^2
  public static readonly HALF_WIDTH = 0.3;
  public static readonly HEIGHT = 1.8;

  private world: World;
  private accumulator = 0;

  constructor(world: World) {
    this.world = world;
  }

  public update(deltaTime: number, entity: EntityState, deltaX: number, deltaZ: number, jump: boolean): void {
    this.accumulator += deltaTime;
    if (this.accumulator > 0.2) this.accumulator = 0.2;

    while (this.accumulator >= PhysicsAABB.FIXED_TIMESTEP) {
      this.step(entity, deltaX, deltaZ, jump);
      this.accumulator -= PhysicsAABB.FIXED_TIMESTEP;
    }
  }

  public step(entity: EntityState, deltaX: number, deltaZ: number, jump: boolean): void {
    const dt = PhysicsAABB.FIXED_TIMESTEP;
    const speed = 6.0;

    // Calcular vector de dirección a partir del yaw
    const sinYaw = Math.sin(entity.yaw);
    const cosYaw = Math.cos(entity.yaw);

    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    entity.vx = (rightX * deltaX + forwardX * deltaZ) * speed;
    entity.vz = (rightZ * deltaX + forwardZ * deltaZ) * speed;

    // Gravedad y Salto
    if (jump && entity.onGround) {
      entity.vy = 8.5;
      entity.onGround = false;
    } else {
      entity.vy += PhysicsAABB.GRAVITY * dt;
    }

    // Resolución eje Y
    const newY = entity.y + entity.vy * dt;
    if (this.checkCollision(entity.x, newY, entity.z)) {
      if (entity.vy < 0) {
        entity.onGround = true;
        entity.y = Math.floor(newY) + 1.0;
      }
      entity.vy = 0;
    } else {
      entity.y = newY;
      entity.onGround = false;
    }

    // Resolución eje X
    const newX = entity.x + entity.vx * dt;
    if (!this.checkCollision(newX, entity.y, entity.z)) {
      entity.x = newX;
    } else {
      entity.vx = 0;
    }

    // Resolución eje Z
    const newZ = entity.z + entity.vz * dt;
    if (!this.checkCollision(entity.x, entity.y, newZ)) {
      entity.z = newZ;
    } else {
      entity.vz = 0;
    }

    // Respawneo al caer al vacío
    if (entity.y < -8) {
      entity.x = World.SIZE / 2;
      entity.y = 3;
      entity.z = World.SIZE / 2;
      entity.vy = 0;
    }
  }

  private checkCollision(px: number, py: number, pz: number): boolean {
    const hw = PhysicsAABB.HALF_WIDTH;
    const h = PhysicsAABB.HEIGHT;

    const minX = Math.floor(px - hw);
    const maxX = Math.floor(px + hw);
    const minY = Math.floor(py);
    const maxY = Math.floor(py + h);
    const minZ = Math.floor(pz - hw);
    const maxZ = Math.floor(pz + hw);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (this.world.isSolid(x, y, z)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
