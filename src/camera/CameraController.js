import * as THREE from 'three';

const THIRD_DISTANCE = 3.4;
const THIRD_LIFT = 0.45;

export class CameraController {
  constructor(camera, eyeHeight = 1.6) {
    this.camera = camera;
    this.eyeHeight = eyeHeight;
    this.lookTarget = new THREE.Vector3();
    this.world = null; // se inyecta para la colisión del brazo en 3ª persona
    this._boomDir = new THREE.Vector3();
    this._desired = new THREE.Vector3();
  }

  setWorld(world) {
    this.world = world;
  }

  update(player, yaw, pitch, mode = 'first') {
    const cam = this.camera;
    const renderPos = player.visualPos || player.pos;
    if (mode !== 'third') {
      cam.position.set(renderPos.x, renderPos.y + this.eyeHeight, renderPos.z);

      const cosPitch = Math.cos(pitch);
      this.lookTarget.set(
        cam.position.x - Math.sin(yaw) * cosPitch,
        cam.position.y + Math.sin(pitch),
        cam.position.z - Math.cos(yaw) * cosPitch
      );

      cam.lookAt(this.lookTarget);
      return;
    }

    // Tercera persona: brazo detrás de la cabeza con colisión contra el mundo
    const hx = renderPos.x;
    const hy = renderPos.y + 1.55;
    const hz = renderPos.z;
    const cosPitch = Math.cos(pitch);
    const fx = -Math.sin(yaw) * cosPitch;
    const fy = Math.sin(pitch);
    const fz = -Math.cos(yaw) * cosPitch;

    this._desired.set(hx - fx * THIRD_DISTANCE, hy - fy * THIRD_DISTANCE + THIRD_LIFT, hz - fz * THIRD_DISTANCE);

    let s = 1;
    if (this.world) {
      // Marchar desde la cabeza hacia la posición deseada; frenar antes del bloque
      for (let t = 0.25; t <= 1.0001; t += 0.15) {
        const px = hx + (this._desired.x - hx) * t;
        const py = hy + (this._desired.y - hy) * t;
        const pz = hz + (this._desired.z - hz) * t;
        if (this.world.get(Math.floor(px), Math.floor(py), Math.floor(pz)) !== 0) {
          s = Math.max(0.18, t - 0.15);
          break;
        }
      }
    }

    cam.position.set(
      hx + (this._desired.x - hx) * s,
      hy + (this._desired.y - hy) * s,
      hz + (this._desired.z - hz) * s
    );
    this.lookTarget.set(hx + fx * 2.5, hy + fy * 2.5, hz + fz * 2.5);
    cam.lookAt(this.lookTarget);
  }
}
