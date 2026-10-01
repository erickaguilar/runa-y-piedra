// src/render/AvatarRenderer.js
import * as THREE from 'three';
import { PLAYER_PALETTE } from '../config/constants.js';
import {
  AVATAR_H,
  buildSharedGeometries,
  buildSharedMaterials,
  createNameSprite,
  buildBaseAvatarMesh,
  GEAR_BUILDERS,
} from './models/heroes/index.js';

export class AvatarRenderer {
  constructor(scene) {
    this.scene = scene;
    this.avatars = new Map();
    this._geoCache = AvatarRenderer._buildSharedGeometries();
    this._sharedMats = AvatarRenderer._buildSharedMaterials();
  }

  /** Geometrías compartidas del muñeco (1.8 m, encaja en la cápsula física). */
  static _buildSharedGeometries() {
    return buildSharedGeometries();
  }

  /** Materiales compartidos: piel, cara, pantalón y cinto (el color del héroe es por avatar). */
  static _buildSharedMaterials() {
    return buildSharedMaterials();
  }

  /** Retira el equipo anterior del avatar (nodos + materiales). */
  _clearGear(a) {
    for (const { obj, parent } of a.gearNodes || []) {
      parent.remove(obj);
      obj.traverse((o) => { if (o.isMesh) o.geometry.dispose?.(); });
    }
    for (const m of a.gearMats || []) m.dispose?.();
    a.gearNodes = [];
    a.gearMats = [];
    if (a.gear) {
      a.mesh.remove(a.gear);
      a.gear = null;
    }
  }

  /** Cambia el equipo visual según el id del héroe ('paladin', etc.). */
  setHeroGear(a, heroId) {
    if (!a || a.heroId === (heroId || null)) return;
    this._clearGear(a);
    a.heroId = heroId || null;
    const build = (heroId && GEAR_BUILDERS[heroId]) || null;
    if (!build) return;
    const gear = new THREE.Group();
    a.mesh.add(gear);
    a.gear = gear;
    a.gearNodes = [];
    a.gearMats = [];
    const add = (obj, parent) => {
      parent.add(obj);
      a.gearNodes.push({ obj, parent });
    };
    a.gearMats = build(a, this._geoCache, add) || [];
  }

  static colorFor(id) {
    return PLAYER_PALETTE[Math.abs(Number(id) || 0) % PLAYER_PALETTE.length];
  }

  static createNameSprite(name, color = '#38bdf8') {
    return createNameSprite(name, color);
  }

  ensure(id, color = AvatarRenderer.colorFor(id)) {
    let a = this.avatars.get(id);
    if (a) return a;

    const { root, mats, parts } = buildBaseAvatarMesh(color, this._geoCache, this._sharedMats);
    this.scene.add(root);

    a = {
      mesh: root,
      mats,
      gear: null,
      gearNodes: [],
      gearMats: [],
      heroId: null,
      parts,
      sprite: null,
      name: 'Aventurero',
      target:  { x: 0, y: 1, z: 0, yaw: 0 },
      current: { x: 0, y: 1, z: 0, yaw: 0 },
      speed: 0,
      walkPhase: Math.random() * Math.PI * 2,
      isLocal: false,
    };
    this.avatars.set(id, a);
    return a;
  }

  setMetadata(id, name, color, heroId = null) {
    const a = this.ensure(id, color);
    if (!a.isLocal) {
      a.mesh.visible = true;
    }
    if (color !== undefined) {
      for (const m of a.mats) m.color.set(color);
    }
    this.setHeroGear(a, heroId);
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
    this._clearGear(a);
    if (a.sprite) {
      a.mesh.remove(a.sprite);
      a.sprite.material.map.dispose();
      a.sprite.material.dispose();
    }
    this.scene.remove(a.mesh);
    for (const m of a.mats || []) m.dispose();
    this.avatars.delete(id);
  }

  setTarget(id, x, y, z, yaw, color = AvatarRenderer.colorFor(id)) {
    const a = this.ensure(id, color);
    if (!a.isLocal) {
      a.mesh.visible = true;
    }
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
      // Solo los materiales propios (túnica/pelo): los compartidos no se tocan
      for (const m of a.mats || []) {
        m.opacity = isFrozen ? 0.55 : 1.0;
        m.transparent = isFrozen;
      }
    }
  }

  /**
   * Avatar del jugador local (tercera persona): sin etiqueta de nombre y con
   * snap directo (sin interpolación) para cero latencia visual.
   */
  updateLocal(id, x, y, z, yaw, color, heroId = null) {
    const a = this.ensure(id, color);
    a.isLocal = true;
    if (color !== undefined) {
      for (const m of a.mats) m.color.set(color);
    }
    this.setHeroGear(a, heroId);
    const now = performance.now();
    const dt = a._lt ? Math.min(0.25, (now - a._lt) / 1000) : 0.016;
    a._lt = now;
    if (dt > 1e-4) {
      const inst = Math.hypot(x - a.current.x, z - a.current.z) / dt;
      a.speed += (Math.min(inst, 8) - a.speed) * 0.35;
    }
    a.mesh.visible = true;
    a.target.x = x;
    a.target.y = y;
    a.target.z = z;
    a.target.yaw = yaw;
    a.current.x = x;
    a.current.y = y;
    a.current.z = z;
    a.current.yaw = yaw;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.y = yaw + Math.PI;
  }

  setLocalVisible(id, visible) {
    const a = this.avatars.get(id);
    if (a) a.mesh.visible = visible;
  }

  /** dt en segundos; usa un factor independiente del framerate. */
  update(dt) {
    const t = 1 - Math.pow(0.0001, dt); // lerp rápido y estable
    for (const a of this.avatars.values()) {
      if (!a.isLocal) {
        const px = a.current.x;
        const pz = a.current.z;
        a.current.x += (a.target.x - a.current.x) * t;
        a.current.y += (a.target.y - a.current.y) * t;
        a.current.z += (a.target.z - a.current.z) * t;

        let dy = a.target.yaw - a.current.yaw;
        while (dy > Math.PI) dy -= Math.PI * 2;
        while (dy < -Math.PI) dy += Math.PI * 2;
        a.current.yaw += dy * t;

        // Velocidad horizontal para la animación de marcha
        const inst = Math.hypot(a.current.x - px, a.current.z - pz) / Math.max(dt, 1e-4);
        a.speed += (Math.min(inst, 8) - a.speed) * Math.min(1, dt * 6);

        // El grupo tiene origen en los pies (las piezas usan altura absoluta)
        a.mesh.position.set(a.current.x, a.current.y, a.current.z);
        a.mesh.rotation.y = a.current.yaw + Math.PI; // cara (+z) hacia el avance
      }

      // Marcha: brazos y piernas opuestos; balanceo sutil en reposo
      const amp = 0.06 + Math.min(0.65, a.speed * 0.14);
      a.walkPhase += dt * (2.5 + a.speed * 2.0);
      const s = Math.sin(a.walkPhase) * amp;
      a.parts.armLPivot.rotation.x = s;
      a.parts.armRPivot.rotation.x = -s;
      a.parts.legLPivot.rotation.x = -s;
      a.parts.legRPivot.rotation.x = s;
    }
  }
}
