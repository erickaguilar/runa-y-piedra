// src/render/ChestRenderer.js
import * as THREE from 'three';
import { Spring } from '../ui/Spring.js';
import {
  createChestWoodTexture,
  createChestMaterials,
  createChestGeometries,
  buildChestMesh,
} from './models/props/chestModel.js';

const LID_OPEN_ANGLE = 1.48; // ~85 grados de apertura completa
const LID_SPRING_K = 200;    // Rigidez sub-amortiguada con 1 overshoot visible
const LID_SPRING_C = 14;     // Amortiguación con rebote físico tangible
const LIGHT_MAX_INTENSITY = 3.0;

export class ChestRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ChestEntitiesGroup';
    this.scene.add(this.group);

    this.chests = new Map();

    // 1. Textura procedural SVG para madera de roble
    this._woodTexture = ChestRenderer.createChestWoodTexture(256, 256);

    // 2. Materiales compartidos
    this.mats = createChestMaterials(this._woodTexture);
    this.woodMat = this.mats.wood;
    this.ironMat = this.mats.iron;
    this.goldMat = this.mats.gold;
    this.gemMat = this.mats.gem;
    this.rubyMat = this.mats.ruby;
    this.emeraldMat = this.mats.emerald;

    // 3. Geometrías compartidas optimizadas
    this.geos = createChestGeometries();
    this.baseWoodGeo = this.geos.baseWoodGeo;
    this.baseIronGeo = this.geos.baseIronGeo;
    this.keyholeGeo = this.geos.keyholeGeo;
    this.lidWoodGeo = this.geos.lidWoodGeo;
    this.lidIronGeo = this.geos.lidIronGeo;
    this.goldMoundGeo = this.geos.goldMoundGeo;
    this.gemSapphireGeo = this.geos.gemSapphireGeo;
    this.gemRubyGeo = this.geos.gemRubyGeo;
    this.gemEmeraldGeo = this.geos.gemEmeraldGeo;
  }

  static createChestWoodTexture(width = 256, height = 256) {
    return createChestWoodTexture(width, height);
  }

  loadChests(chestConfigs = []) {
    this.clear();

    if (!Array.isArray(chestConfigs) || chestConfigs.length === 0) {
      return;
    }

    for (const cfg of chestConfigs) {
      const chestId = cfg.id || 1;
      const x = cfg.x ?? 4.5;
      const y = cfg.y ?? 1.0;
      const z = cfg.z ?? 5.5;

      const { chestGroup, lidPivot, lootLight } = buildChestMesh(this.geos, this.mats);
      chestGroup.position.set(x, y, z);
      if (cfg.yaw) {
        chestGroup.rotation.y = cfg.yaw;
      }
      this.group.add(chestGroup);

      const lidSpring = new Spring(LID_SPRING_K, LID_SPRING_C, 0);
      lidSpring.snap(0);

      this.chests.set(chestId, {
        id: chestId,
        name: cfg.name || 'Cofre del Tesoro',
        reward: cfg.reward || 'Tesoros de la Mazmorra',
        message: cfg.message,
        x,
        y,
        z,
        isOpen: false,
        lidPivot,
        lootLight,
        chestGroup,
        lidSpring,
      });
    }
  }

  openChest(chestId = 1) {
    const chest = this.chests.get(chestId);
    if (!chest || chest.isOpen) return false;

    chest.isOpen = true;
    chest.lidSpring.set(LID_OPEN_ANGLE);
    return true;
  }

  isChestOpen(chestId = 1) {
    const chest = this.chests.get(chestId);
    return chest ? chest.isOpen : false;
  }

  /** Apertura instantánea sin animación (sincronización de clientes que se unen tarde en INIT). */
  setOpenInstant(chestId = 1) {
    const chest = this.chests.get(chestId);
    if (!chest) return;

    chest.isOpen = true;
    chest.lidSpring.snap(LID_OPEN_ANGLE);
    chest.lidPivot.rotation.x = -LID_OPEN_ANGLE;
    if (chest.lootLight) {
      chest.lootLight.intensity = LIGHT_MAX_INTENSITY;
    }
  }

  update(dt = 0.016) {
    for (const chest of this.chests.values()) {
      if (chest.isOpen && !chest.lidSpring.isSettled) {
        const angle = chest.lidSpring.update(dt);
        chest.lidPivot.rotation.x = -angle;
        if (chest.lootLight) {
          const t = Math.min(1.0, Math.max(0.0, angle / LID_OPEN_ANGLE));
          chest.lootLight.intensity = t * LIGHT_MAX_INTENSITY;
        }

        if (chest.lidSpring.isSettled) {
          chest.lidPivot.rotation.x = -LID_OPEN_ANGLE;
          if (chest.lootLight) {
            chest.lootLight.intensity = LIGHT_MAX_INTENSITY;
          }
        }
      }
    }
  }

  clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child.isPointLight) {
        child.dispose?.();
      }
    }
    this.chests.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    if (this._woodTexture) {
      this._woodTexture.dispose();
      this._woodTexture = null;
    }
    for (const geo of Object.values(this.geos || {})) geo.dispose?.();
    for (const mat of Object.values(this.mats || {})) mat.dispose?.();
  }
}
