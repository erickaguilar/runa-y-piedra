import * as THREE from 'three';
import { PLAYER_PALETTE, PHYSICS_CONFIG } from '../config/constants.js';

const AVATAR_H = PHYSICS_CONFIG.PLAYER_H;

export class AvatarRenderer {
  constructor(scene) {
    this.scene = scene;
    this.avatars = new Map();
    this._geo = new THREE.BoxGeometry(0.6, AVATAR_H, 0.6);
  }

  static colorFor(id) {
    return PLAYER_PALETTE[id % PLAYER_PALETTE.length];
  }

  ensure(id, color = AvatarRenderer.colorFor(id)) {
    let a = this.avatars.get(id);
    if (a) return a;
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(this._geo, mat);
    mesh.position.set(0, 1, 0);
    this.scene.add(mesh);
    a = {
      mesh,
      target:  { x: 0, y: 1, z: 0, yaw: 0 },
      current: { x: 0, y: 1, z: 0, yaw: 0 },
    };
    this.avatars.set(id, a);
    return a;
  }

  remove(id) {
    const a = this.avatars.get(id);
    if (!a) return;
    this.scene.remove(a.mesh);
    a.mesh.material.dispose();
    this.avatars.delete(id);
  }

  setTarget(id, x, y, z, yaw, color = AvatarRenderer.colorFor(id)) {
    const a = this.ensure(id, color);
    a.target.x = x;
    a.target.y = y;
    a.target.z = z;
    a.target.yaw = yaw;
    // Teletransporte si la diferencia es enorme (join inicial)
    if (Math.abs(a.current.x - x) > 8 || Math.abs(a.current.z - z) > 8) {
      a.current.x = x;
      a.current.y = y;
      a.current.z = z;
      a.current.yaw = yaw;
    }
  }

  /** dt en segundos; usa un factor independiente del framerate. */
  update(dt) {
    const t = 1 - Math.pow(0.0001, dt); // lerp rápido y estable
    for (const a of this.avatars.values()) {
      a.current.x += (a.target.x - a.current.x) * t;
      a.current.y += (a.target.y - a.current.y) * t;
      a.current.z += (a.target.z - a.current.z) * t;

      let dy = a.target.yaw - a.current.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      a.current.yaw += dy * t;

      a.mesh.position.set(a.current.x, a.current.y + AVATAR_H / 2, a.current.z);
      a.mesh.rotation.y = a.current.yaw;
    }
  }
}
