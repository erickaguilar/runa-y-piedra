// src/render/PropShowcaseRenderer.js
import * as THREE from 'three';
import {
  createChestWoodTexture,
  createChestMaterials,
  createChestGeometries,
  buildChestMesh,
  createWoodPlankTexture,
  createDoorMaterials,
  createDoorGeometries,
  buildDoorLeaf,
  buildDoorFrame,
  createPedestalMaterials,
  createPedestalGeometries,
  buildPedestalMesh,
  createCartographyMaterials,
  createCartographyGeometries,
  buildCartographyTableMesh,
  createPressurePlateMaterials,
  createPressurePlateGeometries,
  buildPressurePlateMesh,
  createStairsMaterials,
  buildStairsMesh,
} from './models/props/index.js';

/**
 * Genera un Sprite 3D flotante con el título y categoría del modelo de exhibición.
 */
export function createPropLabelSprite(title, color = '#38bdf8', category = 'PROP 3D') {
  const labelText = title || 'Modelo 3D';
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 0.45, 1);
    sprite.position.set(0, 2.3, 0);
    sprite.name = labelText;
    sprite.userData = { title: labelText, color, category };
    return sprite;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 75;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    if (ctx.roundRect) ctx.roundRect(8, 8, 284, 59, 14);
    else ctx.rect(8, 8, 284, 59);
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    if (ctx.roundRect) ctx.roundRect(8, 8, 284, 59, 14);
    else ctx.strokeRect(8, 8, 284, 59);
    ctx.stroke();

    // Etiqueta de categoría
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(category.toUpperCase(), 150, 27);

    // Título del modelo
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(labelText.slice(0, 25), 150, 50);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.9, 0.48, 1);
  sprite.position.set(0, 2.3, 0);
  sprite.name = labelText;
  sprite.userData = { title: labelText, color, category };
  return sprite;
}

/**
 * PropShowcaseRenderer.js
 * 
 * Gestiona una sala de exhibición estática de todos los elementos y props 3D del juego
 * (cofres, puertas, altares, monolitos, losas, escalinatas) sin ninguna funcionalidad
 * o lógica interactiva (sin candados, llaves, transiciones ni compras) para permitir
 * la inspección visual, ajuste de materiales, geometría y pulido gráfico en el Showroom.
 */
export class PropShowcaseRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PropShowcaseEntitiesGroup';
    this.scene.add(this.group);

    this.showcases = [];

    // Texturas compartidas
    this._chestWoodTex = createChestWoodTexture(256, 256);
    this._doorWoodTex = createWoodPlankTexture(256, 512);

    // Materiales compartidos
    this._chestMats = createChestMaterials(this._chestWoodTex);
    this._doorMats = createDoorMaterials(this._doorWoodTex);
    this._pedestalClassicMats = createPedestalMaterials('classic');
    this._pedestalShadowMats = createPedestalMaterials('abyss');
    this._pedestalMerchantMats = createPedestalMaterials('merchant');
    this._cartoMats = createCartographyMaterials();
    this._plateMats = createPressurePlateMaterials();
    this._stairsMats = createStairsMaterials(this._doorWoodTex);

    // Geometrías compartidas
    this._chestGeos = createChestGeometries();
    this._doorGeos = createDoorGeometries();
    this._pedestalClassicGeos = createPedestalGeometries('classic');
    this._pedestalShadowGeos = createPedestalGeometries('abyss');
    this._pedestalMerchantGeos = createPedestalGeometries('merchant');
    this._pedestalGeos = this._pedestalClassicGeos; // Para retrocompatibilidad
    this._cartoGeos = createCartographyGeometries();
    this._plateGeos = createPressurePlateGeometries();
  }

  /**
   * Carga y posiciona la colección de modelos de exhibición sin mecánicas.
   * @param {Array<object>} configs - Lista de props ({ type, name, x, y, z, yaw, color, note })
   */
  loadShowcases(configs = []) {
    this.clear();
    if (!Array.isArray(configs) || configs.length === 0) return;

    for (let i = 0; i < configs.length; i++) {
      const cfg = configs[i];
      const id = cfg.id || `prop_showcase_${i + 1}`;
      const type = cfg.type || 'chest_closed';
      const x = cfg.x ?? 12.0;
      const y = cfg.y ?? 1.0;
      const z = cfg.z ?? 60.0;
      const yaw = cfg.yaw ?? 0;
      const name = cfg.name || this._defaultNameForType(type);
      const color = cfg.color || this._defaultColorForType(type);
      const category = cfg.category || 'MODELO 3D';

      const entity = this._buildPropEntity(type, cfg);
      if (!entity) continue;

      const { root, animated } = entity;
      root.position.set(x, y, z);
      root.rotation.y = yaw;

      // Label flotante overhead
      const label = createPropLabelSprite(name, color, category);
      label.position.y = entity.labelHeight ?? 2.3;
      root.add(label);

      this.group.add(root);
      this.showcases.push({
        id,
        type,
        name,
        color,
        category,
        x,
        y,
        z,
        yaw,
        root,
        label,
        sprite: label,
        animated,
      });
    }
  }

  /**
   * Busca un prop de exhibición por coordenadas x, z en el mundo.
   */
  findShowcaseAt(x, z, tolerance = 1.5) {
    return this.showcases.find(
      s => Math.hypot(s.x - x, s.z - z) <= tolerance
    ) || null;
  }

  _defaultNameForType(type) {
    switch (type) {
      case 'chest_closed': return 'Cofre (Cerrado)';
      case 'chest_open': return 'Cofre (Abierto con Botín)';
      case 'door_closed': return 'Puerta 3D (Cerrada)';
      case 'door_open': return 'Puerta 3D (Abierta)';
      case 'pedestal_classic': return 'Altar Rúnico (Dorado)';
      case 'pedestal_shadow': return 'Altar Rúnico (Sombras)';
      case 'pedestal_merchant': return 'Pedestal Mercader (Bazar)';
      case 'cartography': return 'Mesa Cartografía (Atlas)';
      case 'pressure_plate_trigger': return 'Losa Rúnica (Trigger)';
      case 'pressure_plate_hold': return 'Losa de Retención (Hold)';
      case 'stairs': return 'Escalinata Ancestral (3D)';
      default: return 'Elemento 3D';
    }
  }

  _defaultColorForType(type) {
    switch (type) {
      case 'chest_closed': return '#f59e0b';
      case 'chest_open': return '#fbbf24';
      case 'door_closed': return '#d97706';
      case 'door_open': return '#60a5fa';
      case 'pedestal_classic': return '#f59e0b';
      case 'pedestal_shadow': return '#a855f7';
      case 'pedestal_merchant': return '#10b981';
      case 'cartography': return '#38bdf8';
      case 'pressure_plate_trigger': return '#f59e0b';
      case 'pressure_plate_hold': return '#10b981';
      case 'stairs': return '#94a3b8';
      default: return '#38bdf8';
    }
  }

  _buildPropEntity(type, cfg) {
    switch (type) {
      case 'chest_closed': {
        const { chestGroup } = buildChestMesh(this._chestGeos, this._chestMats);
        return { root: chestGroup, labelHeight: 1.6 };
      }

      case 'chest_open': {
        const { chestGroup, lidPivot, lootLight } = buildChestMesh(this._chestGeos, this._chestMats);
        if (lidPivot) lidPivot.rotation.x = -1.48; // Abierto a ~85 grados
        if (lootLight) lootLight.intensity = 2.4;
        return { root: chestGroup, labelHeight: 1.6 };
      }

      case 'door_closed': {
        const root = new THREE.Group();
        const frame = buildDoorFrame(2.0, 2.0, this._doorMats);
        frame.position.set(0, 1.0, 0);
        root.add(frame);

        const leftLeaf = buildDoorLeaf(+1, this._doorGeos, this._doorMats);
        leftLeaf.position.set(-1.0, 1.0, 0);
        const rightLeaf = buildDoorLeaf(-1, this._doorGeos, this._doorMats);
        rightLeaf.position.set(1.0, 1.0, 0);
        root.add(leftLeaf, rightLeaf);

        return { root, labelHeight: 2.8 };
      }

      case 'door_open': {
        const root = new THREE.Group();
        const frame = buildDoorFrame(2.0, 2.0, this._doorMats);
        frame.position.set(0, 1.0, 0);
        root.add(frame);

        const leftPivot = new THREE.Object3D();
        leftPivot.position.set(-1.0, 1.0, 0);
        leftPivot.rotation.y = 1.48; // Abierta ~85° hacia adelante
        const leftLeaf = buildDoorLeaf(+1, this._doorGeos, this._doorMats);
        leftPivot.add(leftLeaf);

        const rightPivot = new THREE.Object3D();
        rightPivot.position.set(1.0, 1.0, 0);
        rightPivot.rotation.y = -1.48; // Abierta ~85° hacia adelante
        const rightLeaf = buildDoorLeaf(-1, this._doorGeos, this._doorMats);
        rightPivot.add(rightLeaf);

        root.add(leftPivot, rightPivot);
        return { root, labelHeight: 2.8 };
      }

      case 'pedestal_classic': {
        const p = buildPedestalMesh(this._pedestalClassicGeos, this._pedestalClassicMats);
        return {
          root: p.root,
          labelHeight: 2.6,
          animated: { type: 'pedestal', ...p, phase: 0 },
        };
      }

      case 'pedestal_shadow': {
        const p = buildPedestalMesh(this._pedestalShadowGeos, this._pedestalShadowMats);
        return {
          root: p.root,
          labelHeight: 2.6,
          animated: { type: 'pedestal', variant: 'abyss', ...p, phase: 1.5 },
        };
      }

      case 'pedestal_merchant': {
        const p = buildPedestalMesh(this._pedestalMerchantGeos, this._pedestalMerchantMats);
        return {
          root: p.root,
          labelHeight: 2.6,
          animated: { type: 'pedestal', variant: 'merchant', ...p, phase: 3.0 },
        };
      }

      case 'cartography': {
        const c = buildCartographyTableMesh(this._cartoGeos, this._cartoMats);
        return {
          root: c.root,
          labelHeight: 2.4,
          animated: { type: 'cartography', ...c, phase: 0 },
        };
      }

      case 'pressure_plate_trigger': {
        const p = buildPressurePlateMesh(this._plateGeos, this._plateMats, { mode: 'trigger' });
        return { root: p.root, labelHeight: 1.4 };
      }

      case 'pressure_plate_hold': {
        const p = buildPressurePlateMesh(this._plateGeos, this._plateMats, { mode: 'hold' });
        return { root: p.root, labelHeight: 1.4 };
      }

      case 'stairs': {
        const rect = { x1: -1, x2: 0, z1: -1, z2: 1 };
        const s = buildStairsMesh(rect, this._stairsMats);
        // Deslizar levemente la losa hacia un lado (0.7m) para apreciar tanto la losa como el hueco
        if (s.slab) s.slab.position.x = 0.65;
        if (s.pitLight) s.pitLight.intensity = 1.8;
        return { root: s.root, labelHeight: 2.2 };
      }

      default:
        return null;
    }
  }

  /**
   * Actualiza animaciones visuales (rotación de cristales, orbes, partículas).
   */
  update(dt = 0.016) {
    for (const item of this.showcases) {
      const anim = item.animated;
      if (!anim) continue;

      if (anim.type === 'pedestal') {
        anim.phase = (anim.phase || 0) + dt;
        if (anim.runePivot) {
          anim.runePivot.rotation.y += dt * 0.8;
        }
        const baseY = anim.variant === 'merchant' ? 1.68 : 1.66;
        const bob = Math.sin(anim.phase * 2.2) * 0.035;

        if (anim.crystalMesh) {
          anim.crystalMesh.position.y = baseY + bob;
          anim.crystalMesh.rotation.y += dt * 1.2;
        }
        if (anim.accessoryMesh) {
          anim.accessoryMesh.position.y = baseY + bob;
          if (anim.variant === 'merchant') {
            anim.accessoryMesh.rotation.z += dt * 0.9;
          } else {
            anim.accessoryMesh.rotation.y += dt * 1.5;
            anim.accessoryMesh.rotation.z += dt * 0.5;
          }
        }
        if (anim.embers && anim.emberSpeed) {
          const pos = anim.embers.geometry.attributes.position;
          const count = pos.count;
          for (let k = 0; k < count; k++) {
            let py = pos.getY(k) + anim.emberSpeed[k] * dt;
            if (py > 2.0) py = 1.3;
            pos.setY(k, py);
          }
          pos.needsUpdate = true;
        }
      } else if (anim.type === 'cartography') {
        anim.phase = (anim.phase || 0) + dt;
        if (anim.compassMesh) {
          anim.compassMesh.rotation.y += dt * 0.5;
        }
      }
    }
  }

  /**
   * Limpia y libera las instancias activas.
   */
  clear() {
    for (const item of this.showcases) {
      this.group.remove(item.root);
      if (item.label) {
        item.label.material?.map?.dispose?.();
        item.label.material?.dispose?.();
      }
    }
    this.showcases = [];
  }

  /**
   * Libera todos los recursos WebGL.
   */
  dispose() {
    this.clear();
    this.scene.remove(this.group);

    this._chestWoodTex?.dispose?.();
    this._doorWoodTex?.dispose?.();

    const disposeMatGroup = (mats) => {
      if (!mats) return;
      for (const m of Object.values(mats)) m?.dispose?.();
    };
    disposeMatGroup(this._chestMats);
    disposeMatGroup(this._doorMats);
    disposeMatGroup(this._pedestalClassicMats);
    disposeMatGroup(this._pedestalShadowMats);
    disposeMatGroup(this._pedestalMerchantMats);
    disposeMatGroup(this._cartoMats);
    disposeMatGroup(this._plateMats);
    disposeMatGroup(this._stairsMats);

    const disposeGeoGroup = (geos) => {
      if (!geos) return;
      for (const g of Object.values(geos)) g?.dispose?.();
    };
    disposeGeoGroup(this._chestGeos);
    disposeGeoGroup(this._doorGeos);
    disposeGeoGroup(this._pedestalClassicGeos);
    disposeGeoGroup(this._pedestalShadowGeos);
    disposeGeoGroup(this._pedestalMerchantGeos);
    disposeGeoGroup(this._cartoGeos);
    disposeGeoGroup(this._plateGeos);
  }
}
