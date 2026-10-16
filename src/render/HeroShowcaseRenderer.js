// src/render/HeroShowcaseRenderer.js
import * as THREE from 'three';
import {
  buildBaseAvatarMesh,
  buildSharedGeometries,
  buildSharedMaterials,
  GEAR_BUILDERS,
  createNameSprite,
} from './models/heroes/index.js';
import { PLAYER_HEROES } from '../config/constants.js';
import { heroRegistry } from '../heroes/HeroRegistry.js';

/**
 * HeroShowcaseRenderer.js - Galería de exhibición de avatares en 3D
 * 
 * Gestiona el renderizado de avatares estáticos con sus respectivos kits de clase
 * completos (armas, armaduras, capas, sombreros, etc.) y etiquetas flotantes
 * en salas de exposición o panteones de héroes (como dev_showroom).
 */
export class HeroShowcaseRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'HeroShowcaseEntitiesGroup';
    this.scene.add(this.group);

    this.showcases = [];
    this._geoCache = buildSharedGeometries();
    this._sharedMats = buildSharedMaterials();
  }

  /**
   * Carga y renderiza los héroes de exhibición según la configuración del nivel.
   * @param {Array<object>} configs - Lista de definiciones de héroes ({ id, name, x, y, z, yaw })
   */
  loadShowcases(configs = []) {
    this.clear();
    if (!Array.isArray(configs) || configs.length === 0) return;

    for (const cfg of configs) {
      const heroDef = heroRegistry.getHeroById(cfg.id)
        || PLAYER_HEROES.find(h => h.id === cfg.id)
        || PLAYER_HEROES[0];

      const color = cfg.color || heroDef.hex || heroDef.color || '#38bdf8';
      const heroId = cfg.id || heroDef.id;
      const name = cfg.name || heroDef.name;

      const { root, mats, parts } = buildBaseAvatarMesh(color, this._geoCache, this._sharedMats);
      const gear = new THREE.Group();
      root.add(gear);
      const gearNodes = [];
      const add = (obj, parent) => {
        parent.add(obj);
        gearNodes.push({ obj, parent });
      };

      const builder = GEAR_BUILDERS[heroId];
      const gearMats = builder
        ? (builder({ mesh: root, gear, parts, mats }, this._geoCache, add) || [])
        : [];

      const hexColor = typeof color === 'string'
        ? color
        : ('#' + Number(color).toString(16).padStart(6, '0'));

      const sprite = createNameSprite(name, hexColor, heroId);
      root.add(sprite);

      root.position.set(cfg.x, cfg.y ?? 1.0, cfg.z);
      // Orientación: Three.js rota sobre el eje Y.
      // Un yaw de 0 mira hacia el sur (-Z) con el offset +Math.PI
      const yaw = cfg.yaw ?? 0;
      root.rotation.y = yaw + Math.PI;

      this.group.add(root);
      this.showcases.push({
        id: heroId,
        root,
        parts,
        mats,
        gearMats,
        gearNodes,
        sprite,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Actualiza animaciones secundarias de exhibición (respiración, cristales, gemas emisivas).
   * @param {number} dt - Delta time en segundos
   */
  update(dt = 0.016) {
    for (const s of this.showcases) {
      s.phase = (s.phase + dt * 2.2) % (Math.PI * 20);
      const breath = Math.sin(s.phase);
      if (s.parts?.torso) {
        s.parts.torso.scale.set(1 + breath * 0.012, 1 + breath * 0.015, 1 + breath * 0.012);
      }
      if (s.parts?.crystal) {
        s.parts.crystal.rotation.y += dt * 1.8;
      }
      if (s.parts?.crystalInner) {
        s.parts.crystalInner.rotation.y -= dt * 2.6;
        s.parts.crystalInner.rotation.x += dt * 1.4;
      }
      if (s.parts?.emissiveMats) {
        const pulse = Math.sin(s.phase * 1.5);
        for (const em of s.parts.emissiveMats) {
          if (em.mat) {
            em.mat.emissiveIntensity = em.base + pulse * em.amp;
          }
        }
      }
    }
  }

  /**
   * Limpia los avatares activos y sus materiales individuales.
   */
  clear() {
    const disposedGeos = new Set();
    for (const s of this.showcases) {
      this.group.remove(s.root);
      for (const { obj } of s.gearNodes || []) {
        obj.traverse((o) => {
          if (o.isMesh && o.geometry && !o.geometry.userData?.isShared && !disposedGeos.has(o.geometry)) {
            disposedGeos.add(o.geometry);
            o.geometry.dispose?.();
          }
        });
      }
      for (const m of s.mats || []) m.dispose?.();
      for (const m of s.gearMats || []) {
        if (!m) continue;
        if (m.userData?.isShared) continue;
        m.map?.dispose?.();
        m.dispose?.();
      }
      if (s.sprite) {
        s.sprite.material?.map?.dispose?.();
        s.sprite.material?.dispose?.();
      }
    }
    this.showcases = [];
  }

  /**
   * Libera por completo el grupo de la escena y las cachés compartidas.
   */
  dispose() {
    this.clear();
    for (const g of Object.values(this._geoCache || {})) g?.dispose?.();
    for (const m of Object.values(this._sharedMats || {})) {
      m?.map?.dispose?.();
      m?.dispose?.();
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
