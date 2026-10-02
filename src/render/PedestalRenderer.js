// src/render/PedestalRenderer.js
import * as THREE from 'three';
import {
  IDLE_LIGHT,
  BLESSED_LIGHT,
  FLASH_LIGHT,
  PARTICLE_COUNT,
  createPedestalMaterials,
  createPedestalGeometries,
  buildPedestalMesh,
} from './models/props/pedestalModel.js';
import {
  createCartographyMaterials,
  createCartographyGeometries,
  buildCartographyTableMesh,
  CARTO_PARTICLE_COUNT,
  CARTO_LIGHT_INTENSITY,
} from './models/props/cartographyModel.js';

export class PedestalRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PedestalEntitiesGroup';
    this.scene.add(this.group);

    this.pedestals = new Map();
    this._mats = this._createMaterials('classic');
    this._geos = this._createGeometries();
    this._cartoMats = createCartographyMaterials();
    this._cartoGeos = createCartographyGeometries();
  }

  _createMaterials(themeName) {
    return createPedestalMaterials(themeName);
  }

  _createGeometries() {
    return createPedestalGeometries();
  }

  _applyTheme(themeName) {
    if (this._mats.theme === themeName) return;
    this._mats.rune.dispose?.();
    this._mats.crystal.dispose?.();
    this._mats.ember.dispose?.();
    const fresh = this._createMaterials(themeName);
    this._mats.theme = fresh.theme;
    this._mats.rune = fresh.rune;
    this._mats.crystal = fresh.crystal;
    this._mats.ember = fresh.ember;
    for (const p of this.pedestals.values()) {
      if (p.runeMesh) p.runeMesh.material = this._mats.rune;
      if (p.crystalMesh) p.crystalMesh.material = this._mats.crystal;
      if (p.embers) p.embers.material = this._mats.ember;
      if (p.light) p.light.color.set(fresh.rune.color);
    }
  }

  loadPedestals(objectives = [], { theme = 'classic', monoliths = [] } = {}) {
    this.clear();
    this._applyTheme(theme);
    if (Array.isArray(objectives) && objectives.length > 0) {
      objectives.forEach((cfg, i) => {
        if ((cfg.type || 'pedestal') !== 'pedestal') return;
        const id = cfg.id ?? i + 1;
        const x = cfg.x ?? 12;
        const y = cfg.y ?? 1.0;
        const z = cfg.z ?? 30;

        const {
          root, runePivot, runeMesh, ringMesh, crystalMesh, light, embers, emberSpeed
        } = buildPedestalMesh(this._geos, this._mats);

        root.position.set(x, Math.max(1.0, y), z);
        this.group.add(root);

        this.pedestals.set(id, {
          id, x, y, z, root, runePivot, runeMesh, ringMesh, crystalMesh, light, embers, emberSpeed,
          isActive: false, flash: 0, spinBoost: 0, phase: Math.random() * Math.PI * 2,
        });
      });
    }

    if (Array.isArray(monoliths) && monoliths.length > 0) {
      monoliths.forEach((m, idx) => {
        const id = m.id ?? `monolith_${idx}`;
        const x = m.x ?? 17.5;
        const y = m.y ?? 1.0;
        const z = m.z ?? 8.5;

        const cartoMesh = buildCartographyTableMesh(this._cartoGeos, this._cartoMats);
        cartoMesh.root.position.set(x, Math.max(1.0, y), z);
        this.group.add(cartoMesh.root);

        this.pedestals.set(id, {
          id,
          x,
          y,
          z,
          ...cartoMesh,
          isActive: true,
          phase: Math.random() * Math.PI * 2,
        });
      });
    }
  }

  /** Bendición del altar: destello + ráfaga de brasas; queda en estado "bendecido". */
  activate(id = null) {
    let any = false;
    for (const p of this.pedestals.values()) {
      if (id !== null && p.id !== id) continue;
      if (p.isCartography) {
        // Pulso celestial en el mapa
        if (p.light) p.light.intensity = CARTO_LIGHT_INTENSITY * 1.8;
        any = true;
        continue;
      }
      p.isActive = true;
      p.flash = 1;
      p.spinBoost = 7;
      // Reavivar brasas desde la base para la ráfaga
      if (p.embers) {
        const attr = p.embers.geometry.getAttribute('position');
        for (let k = 0; k < PARTICLE_COUNT; k++) {
          attr.array[k * 3 + 1] = Math.random() * 0.5;
        }
        attr.needsUpdate = true;
      }
      any = true;
    }
    return any;
  }

  isActive(id = 1) {
    const p = this.pedestals.get(id);
    return p ? p.isActive : false;
  }

  update(dt = 0.016, time = performance.now() / 1000) {
    const safeDt = Math.min(dt, 0.05);
    for (const p of this.pedestals.values()) {
      if (p.isCartography) {
        // 1. Giro del Astrolabio Celestial en ejes independientes
        if (p.outerRingMesh) {
          p.outerRingMesh.rotation.y += safeDt * 0.75;
          p.outerRingMesh.rotation.z += safeDt * 0.25;
        }
        if (p.innerRingMesh) {
          p.innerRingMesh.rotation.y -= safeDt * 0.95;
          p.innerRingMesh.rotation.x += safeDt * 0.45;
        }
        // 2. Bobbing y rotación del núcleo poliédrico
        if (p.coreMesh) {
          p.coreMesh.rotation.y += safeDt * 1.4;
          p.coreMesh.rotation.x += safeDt * 0.7;
          p.coreMesh.position.y = Math.sin(time * 2.2 + p.phase) * 0.04;
        }
        // 3. Pulso de luz celestial
        if (p.light) {
          const pulse = Math.sin(time * 3.0 + p.phase) * 0.25;
          p.light.intensity = CARTO_LIGHT_INTENSITY + pulse;
        }
        // 4. Polvo estelar orbitante alrededor de la mesa
        if (p.stardustPoints) {
          const attr = p.stardustPoints.geometry.getAttribute('position');
          const arr = attr.array;
          for (let k = 0; k < CARTO_PARTICLE_COUNT; k++) {
            let yy = arr[k * 3 + 1] + p.stardustSpeed[k] * safeDt * 0.35;
            if (yy > 1.95) {
              yy = 1.08;
              const r = 0.18 + Math.random() * 0.38;
              const a = Math.random() * Math.PI * 2;
              arr[k * 3] = Math.cos(a) * r;
              arr[k * 3 + 2] = Math.sin(a) * r;
            }
            arr[k * 3 + 1] = yy;
            const swirl = safeDt * 0.55;
            const px = arr[k * 3], pz = arr[k * 3 + 2];
            arr[k * 3] = px * Math.cos(swirl) - pz * Math.sin(swirl);
            arr[k * 3 + 2] = px * Math.sin(swirl) + pz * Math.cos(swirl);
          }
          attr.needsUpdate = true;
        }
        continue;
      }

      // Runa: giro constante + impulso tras activar
      p.spinBoost = Math.max(0, p.spinBoost - safeDt * 4);
      p.runePivot.rotation.y += safeDt * (0.6 + p.spinBoost);
      p.ringMesh.rotation.y -= safeDt * 0.35;

      // Cristal: levitación + giro + latido
      const bob = Math.sin(time * 1.6 + p.phase) * 0.08;
      p.crystalMesh.position.y = bob;
      p.crystalMesh.rotation.y += safeDt * (1.2 + p.spinBoost * 0.5);
      const pulse = 1 + Math.sin(time * 2.2 + p.phase) * 0.06 + p.flash * 0.7;
      p.crystalMesh.scale.set(pulse, pulse * 1.25, pulse);

      // Luz: reposo cálido, bendecido más intenso, destello al activar + parpadeo vivo
      p.flash = Math.max(0, p.flash - safeDt * 1.6);
      const base = p.isActive ? BLESSED_LIGHT : IDLE_LIGHT;
      const flicker = Math.sin(time * 7.3 + p.phase) * 0.12 + Math.sin(time * 13.7) * 0.06;
      p.light.intensity = base + flicker + p.flash * FLASH_LIGHT;

      // Brasas ascendentes con remolino suave
      if (p.embers) {
        const attr = p.embers.geometry.getAttribute('position');
        const arr = attr.array;
        const rise = 1 + p.flash * 3;
        for (let k = 0; k < PARTICLE_COUNT; k++) {
          let yy = arr[k * 3 + 1] + p.emberSpeed[k] * rise * safeDt;
          if (yy > 2.3) {
            yy = 0.05;
            const r = 0.15 + Math.random() * 0.45;
            const a = Math.random() * Math.PI * 2;
            arr[k * 3] = Math.cos(a) * r;
            arr[k * 3 + 2] = Math.sin(a) * r;
          }
          arr[k * 3 + 1] = yy;
          const swirl = safeDt * 0.4;
          const px = arr[k * 3], pz = arr[k * 3 + 2];
          arr[k * 3] = px * Math.cos(swirl) - pz * Math.sin(swirl);
          arr[k * 3 + 2] = px * Math.sin(swirl) + pz * Math.cos(swirl);
        }
        attr.needsUpdate = true;
      }
    }
  }

  clear() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      child.traverse?.((o) => {
        if (o.isPoints) o.geometry.dispose?.();
      });
    }
    this.pedestals.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    for (const g of Object.values(this._geos)) g.dispose?.();
    for (const g of Object.values(this._cartoGeos)) g.dispose?.();
    this._mats.stone.dispose?.();
    this._mats.stoneDark.dispose?.();
    this._mats.iron.dispose?.();
    this._mats.gold.dispose?.();
    this._mats.rune.dispose?.();
    this._mats.crystal.dispose?.();
    this._mats.ember.dispose?.();
    for (const m of Object.values(this._cartoMats)) m.dispose?.();
  }
}
