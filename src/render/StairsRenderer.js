// src/render/StairsRenderer.js
import * as THREE from 'three';
import {
  SHAKE_TIME,
  SLIDE_TIME,
  SLIDE_DIST,
  FOG_COUNT,
  createStairsMaterials,
  buildStairsMesh,
} from './models/props/stairsModel.js';
import { createWoodPlankTexture } from './models/props/doorModel.js';

export class StairsRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'StairsEntitiesGroup';
    this.scene.add(this.group);

    this.stairs = null; // Solo hay una escalinata por nivel (tras el altar)

    this._woodTexture = createWoodPlankTexture(256, 512);
    this.mats = createStairsMaterials(this._woodTexture);
    this.woodMat = this.mats.wood;
    this.stoneMat = this.mats.stone;
    this.stoneDarkMat = this.mats.stoneDark;
    this.ironMat = this.mats.iron;
    this.goldMat = this.mats.gold;
    this.blackMat = this.mats.black;
  }

  /**
   * Registra la escalinata sellada sobre el rectángulo de fosa.
   * @param {{x1,x2,z1,z2}} rect bloques de suelo que se retirarán al abrir
   */
  loadStairs(rect = null) {
    this.clear();
    if (!rect) return;

    const { root, slab, pitLight, fog } = buildStairsMesh(rect, this.mats);
    this.group.add(root);

    this.stairs = {
      rect, root, slab, pitLight, fog,
      state: 'closed', t: 0, shakeSeed: Math.random() * 10,
    };
  }

  /** Arranca la apertura: temblor 0.5s y deslizamiento de la losa. */
  open() {
    if (!this.stairs || this.stairs.state !== 'closed') return false;
    this.stairs.state = 'shaking';
    this.stairs.t = 0;
    return true;
  }

  isOpen() {
    return !!this.stairs && this.stairs.state === 'open';
  }

  /** Apertura instantánea (clientes que se unen con la fosa ya abierta). */
  setOpenInstant() {
    if (!this.stairs) return;
    this.stairs.state = 'open';
    this.stairs.slab.position.x = SLIDE_DIST;
    this.stairs.fog.visible = true;
    this.stairs.fog.material.opacity = 0.6;
    this.stairs.pitLight.intensity = 0.9;
  }

  update(dt = 0.016, time = performance.now() / 1000) {
    const s = this.stairs;
    if (!s) return;
    const safeDt = Math.min(dt, 0.05);

    if (s.state === 'shaking') {
      s.t += safeDt;
      const k = Math.min(1, s.t / SHAKE_TIME);
      s.slab.position.x = Math.sin(time * 70 + s.shakeSeed) * 0.035 * k;
      s.slab.position.z = Math.cos(time * 58 + s.shakeSeed) * 0.03 * k;
      if (s.t >= SHAKE_TIME) {
        s.state = 'sliding';
        s.t = 0;
        s.slab.position.x = 0;
        s.slab.position.z = 0;
      }
    } else if (s.state === 'sliding') {
      s.t += safeDt;
      const k = Math.min(1, s.t / SLIDE_TIME);
      const eased = 1 - Math.pow(1 - k, 3);
      s.slab.position.x = eased * SLIDE_DIST;
      s.fog.visible = k > 0.3;
      s.fog.material.opacity = 0.6 * k;
      s.pitLight.intensity = 0.9 * k;
      if (k >= 1) s.state = 'open';
    } else if (s.state === 'open') {
      // Niebla ascendiendo en bucle desde el fondo del pozo
      const attr = s.fog.geometry.getAttribute('position');
      const arr = attr.array;
      for (let i = 0; i < FOG_COUNT; i++) {
        let y = arr[i * 3 + 1] + safeDt * 0.22;
        if (y > 0.5) y = -6.8;
        arr[i * 3 + 1] = y;
      }
      attr.needsUpdate = true;
      s.pitLight.intensity = 0.9 + Math.sin(time * 5.1) * 0.15;
    }
  }

  clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      child.traverse?.((o) => {
        if (o.isMesh) o.geometry.dispose?.();
        if (o.isPoints) { o.geometry.dispose?.(); o.material.dispose?.(); }
      });
    }
    this.stairs = null;
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    if (this._woodTexture) {
      this._woodTexture.dispose();
      this._woodTexture = null;
    }
    for (const mat of Object.values(this.mats || {})) mat.dispose?.();
  }
}
