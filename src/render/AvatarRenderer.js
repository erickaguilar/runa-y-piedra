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

  static createNameSprite(name, color = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Fondo oscuro redondeado
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    if (ctx.roundRect) {
      ctx.roundRect(8, 6, 240, 52, 14);
    } else {
      ctx.rect(8, 6, 240, 52);
    }
    ctx.fill();

    // Borde temático del héroe
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Emblema circular del color del aventurero
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(30, 32, 7, 0, Math.PI * 2);
    ctx.fill();

    // Texto con el apodo del jugador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayName = (name && name.trim()) ? name.trim().slice(0, 12) : 'Aventurero';
    ctx.fillText(displayName, 46, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.38, 1);
    sprite.position.set(0, (AVATAR_H / 2) + 0.35, 0);
    sprite.renderOrder = 999;
    return sprite;
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
      sprite: null,
      name: 'Aventurero',
      target:  { x: 0, y: 1, z: 0, yaw: 0 },
      current: { x: 0, y: 1, z: 0, yaw: 0 },
    };
    this.avatars.set(id, a);
    return a;
  }

  setMetadata(id, name, color) {
    const a = this.ensure(id, color);
    if (color !== undefined) {
      a.mesh.material.color.set(color);
    }
    if (name) {
      a.name = name;
      if (a.sprite) {
        a.mesh.remove(a.sprite);
        a.sprite.material.map.dispose();
        a.sprite.material.dispose();
      }
      const hexColor = typeof color === 'string'
        ? color
        : (color !== undefined ? '#' + Number(color).toString(16).padStart(6, '0') : '#38bdf8');
      a.sprite = AvatarRenderer.createNameSprite(name, hexColor);
      a.mesh.add(a.sprite);
    }
  }

  remove(id) {
    const a = this.avatars.get(id);
    if (!a) return;
    if (a.sprite) {
      a.mesh.remove(a.sprite);
      a.sprite.material.map.dispose();
      a.sprite.material.dispose();
    }
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

  setFrozen(id, isFrozen = false) {
    const a = this.avatars.get(id);
    if (!a) return;
    if (a.isFrozen !== isFrozen) {
      a.isFrozen = isFrozen;
      a.mesh.material.opacity = isFrozen ? 0.55 : 1.0;
      a.mesh.material.transparent = isFrozen;
    }
  }

  /**
   * Avatar del jugador local (tercera persona): sin etiqueta de nombre y con
   * snap directo (sin interpolación) para cero latencia visual.
   */
  updateLocal(id, x, y, z, yaw, color) {
    const a = this.ensure(id, color);
    if (color !== undefined) a.mesh.material.color.set(color);
    a.mesh.visible = true;
    a.target.x = x;
    a.target.y = y;
    a.target.z = z;
    a.target.yaw = yaw;
    a.current.x = x;
    a.current.y = y;
    a.current.z = z;
    a.current.yaw = yaw;
    a.mesh.position.set(x, y + AVATAR_H / 2, z);
    a.mesh.rotation.y = yaw;
  }

  setLocalVisible(id, visible) {
    const a = this.avatars.get(id);
    if (a) a.mesh.visible = visible;
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
