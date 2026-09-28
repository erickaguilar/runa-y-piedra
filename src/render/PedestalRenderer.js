// src/render/PedestalRenderer.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const IDLE_LIGHT = 1.4;
const BLESSED_LIGHT = 2.6;
const FLASH_LIGHT = 7.0;
const PARTICLE_COUNT = 36;

// Temas por mazmorra: dorado ancestral vs brasa volcánica
const THEMES = {
  classic: { light: 0xfbbf24, rune: 0xfde68a, crystal: 0xf59e0b, ember: 0xfcd34d },
  inferno: { light: 0xfb9235, rune: 0xfdba74, crystal: 0xea580c, ember: 0xf97316 },
};

export class PedestalRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PedestalEntitiesGroup';
    this.scene.add(this.group);

    this.pedestals = new Map();
    this._mats = this._createMaterials('classic');
    this._geos = this._createGeometries();
  }

  _createMaterials(themeName) {
    const t = THEMES[themeName] || THEMES.classic;
    return {
      theme: themeName,
      stone: new THREE.MeshLambertMaterial({ color: 0x475569 }), // Sillar pizarra (muros)
      stoneDark: new THREE.MeshLambertMaterial({ color: 0x1e293b }), // Zócalo profundo
      iron: new THREE.MeshLambertMaterial({ color: 0x27272a }), // Forja (cofres/puertas)
      gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f }),
      rune: new THREE.MeshBasicMaterial({ color: t.rune, transparent: true, opacity: 0.95 }),
      crystal: new THREE.MeshLambertMaterial({
        color: 0xffffff, emissive: t.crystal, emissiveIntensity: 0.9, transparent: true, opacity: 0.96,
      }),
      ember: new THREE.PointsMaterial({
        color: t.ember, size: 0.055, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      }),
    };
  }

  _createGeometries() {
    // Zócalo escalonado de cantería (2 peldaños)
    const plinth1 = new THREE.BoxGeometry(1.0, 0.18, 1.0).translate(0, 0.09, 0);
    const plinth2 = new THREE.BoxGeometry(0.8, 0.16, 0.8).translate(0, 0.26, 0);
    const stoneBase = mergeGeometries([plinth1, plinth2]);
    plinth1.dispose(); plinth2.dispose();

    // Fuste monolítico de 4 caras (prisma ahusado, aristas alineadas a los ejes)
    const column = new THREE.CylinderGeometry(0.30, 0.38, 0.86, 4, 1);
    column.rotateY(Math.PI / 4);
    column.translate(0, 0.77, 0);

    // Collar de forja + losa de coronación + filete dorado
    const collar = new THREE.BoxGeometry(0.62, 0.10, 0.62).translate(0, 1.25, 0);
    const cap = new THREE.BoxGeometry(0.78, 0.12, 0.78).translate(0, 1.36, 0);
    const trimN = new THREE.BoxGeometry(0.80, 0.035, 0.05).translate(0, 1.425, 0.375);
    const trimS = new THREE.BoxGeometry(0.80, 0.035, 0.05).translate(0, 1.425, -0.375);
    const trimE = new THREE.BoxGeometry(0.05, 0.035, 0.80).translate(0.375, 1.425, 0);
    const trimW = new THREE.BoxGeometry(0.05, 0.035, 0.80).translate(-0.375, 1.425, 0);
    const goldTrim = mergeGeometries([trimN, trimS, trimE, trimW]);
    trimN.dispose(); trimS.dispose(); trimE.dispose(); trimW.dispose();

    // Runa solar: disco + anillo (giran en sentidos opuestos)
    const runeDisc = new THREE.CircleGeometry(0.24, 24);
    runeDisc.rotateX(-Math.PI / 2);
    runeDisc.translate(0, 1.445, 0);
    const runeRing = new THREE.RingGeometry(0.27, 0.33, 24);
    runeRing.rotateX(-Math.PI / 2);
    runeRing.translate(0, 1.445, 0);

    // Cristal rúnico flotante (octaedro)
    const crystal = new THREE.OctahedronGeometry(0.14, 0);
    crystal.translate(0, 1.95, 0);

    return { stoneBase, column, collar, cap, goldTrim, runeDisc, runeRing, crystal };
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

  loadPedestals(objectives = [], { theme = 'classic' } = {}) {
    this.clear();
    this._applyTheme(theme);
    if (!Array.isArray(objectives) || objectives.length === 0) return;

    objectives.forEach((cfg, i) => {
      if ((cfg.type || 'pedestal') !== 'pedestal') return;
      const id = cfg.id ?? i + 1;
      const x = cfg.x ?? 12;
      const y = cfg.y ?? 1.0;
      const z = cfg.z ?? 30;

      const root = new THREE.Group();
      // El bloque PEDESTAL ocupa (x, 1, z): su base física está en y=1.0
      root.position.set(x, Math.max(1.0, y), z);

      const baseMesh = new THREE.Mesh(this._geos.stoneBase, this._mats.stoneDark);
      const columnMesh = new THREE.Mesh(this._geos.column, this._mats.stone);
      const collarMesh = new THREE.Mesh(this._geos.collar, this._mats.iron);
      const capMesh = new THREE.Mesh(this._geos.cap, this._mats.stone);
      const trimMesh = new THREE.Mesh(this._geos.goldTrim, this._mats.gold);
      root.add(baseMesh, columnMesh, collarMesh, capMesh, trimMesh);

      // Runa giratoria sobre la losa
      const runePivot = new THREE.Group();
      runePivot.position.set(0, 0, 0);
      const runeMesh = new THREE.Mesh(this._geos.runeDisc, this._mats.rune);
      const ringMesh = new THREE.Mesh(this._geos.runeRing, this._mats.gold);
      runePivot.add(runeMesh, ringMesh);
      root.add(runePivot);

      // Cristal flotante
      const crystalMesh = new THREE.Mesh(this._geos.crystal, this._mats.crystal);
      root.add(crystalMesh);

      // Luz cálida del altar
      const light = new THREE.PointLight(this._mats.rune.color, IDLE_LIGHT, 9, 2.0);
      light.position.set(0, 2.1, 0);
      root.add(light);

      // Brasas ascendentes
      const pos = new Float32Array(PARTICLE_COUNT * 3);
      const speed = new Float32Array(PARTICLE_COUNT);
      for (let k = 0; k < PARTICLE_COUNT; k++) {
        const r = 0.15 + Math.random() * 0.45;
        const a = Math.random() * Math.PI * 2;
        pos[k * 3] = Math.cos(a) * r;
        pos[k * 3 + 1] = Math.random() * 2.2;
        pos[k * 3 + 2] = Math.sin(a) * r;
        speed[k] = 0.25 + Math.random() * 0.5;
      }
      const emberGeo = new THREE.BufferGeometry();
      emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const embers = new THREE.Points(emberGeo, this._mats.ember);
      root.add(embers);

      this.group.add(root);
      this.pedestals.set(id, {
        id, x, y, z, root, runePivot, ringMesh, crystalMesh, light, embers, emberSpeed: speed,
        isActive: false, flash: 0, spinBoost: 0, phase: Math.random() * Math.PI * 2,
      });
    });
  }

  /** Bendición del altar: destello + ráfaga de brasas; queda en estado "bendecido". */
  activate(id = null) {
    let any = false;
    for (const p of this.pedestals.values()) {
      if (id !== null && p.id !== id) continue;
      p.isActive = true;
      p.flash = 1;
      p.spinBoost = 7;
      // Reavivar brasas desde la base para la ráfaga
      const attr = p.embers.geometry.getAttribute('position');
      for (let k = 0; k < PARTICLE_COUNT; k++) {
        attr.array[k * 3 + 1] = Math.random() * 0.5;
      }
      attr.needsUpdate = true;
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
    this._mats.stone.dispose?.();
    this._mats.stoneDark.dispose?.();
    this._mats.iron.dispose?.();
    this._mats.gold.dispose?.();
    this._mats.rune.dispose?.();
    this._mats.crystal.dispose?.();
    this._mats.ember.dispose?.();
  }
}
