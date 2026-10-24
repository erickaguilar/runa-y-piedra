// src/render/ProjectileRenderer.js
import * as THREE from 'three';
import { WEAPON_TYPES } from '../config/combat.js';

export class ProjectileRenderer {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [capacity=16]
   */
  constructor(scene, capacity = 16) {
    this.scene = scene;
    this.capacity = capacity;
    this.group = new THREE.Group();
    this.group.name = 'ProjectilesGroup';
    this.scene.add(this.group);

    this.slots = this._initMeshPool(capacity);
    this.time = 0;
  }

  _initMeshPool(capacity) {
    const slots = [];

    // Geometrías y materiales compartidos (Zero-GC)
    const arrowShaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
    // Orientar el cilindro hacia el eje Z para facilitar lookAt
    arrowShaftGeo.rotateX(Math.PI / 2);
    const arrowHeadGeo = new THREE.ConeGeometry(0.06, 0.15, 6);
    arrowHeadGeo.rotateX(Math.PI / 2);
    arrowHeadGeo.translate(0, 0, 0.35);

    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const arrowHeadMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

    const magicCoreGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const magicCoreMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const magicGlowGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const magicGlowMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    for (let i = 0; i < capacity; i++) {
      const slotGroup = new THREE.Group();
      slotGroup.visible = false;

      // Sub-grupo de flecha
      const arrowGroup = new THREE.Group();
      const shaftMesh = new THREE.Mesh(arrowShaftGeo, arrowMat);
      const headMesh = new THREE.Mesh(arrowHeadGeo, arrowHeadMat);
      arrowGroup.add(shaftMesh);
      arrowGroup.add(headMesh);
      slotGroup.add(arrowGroup);

      // Sub-grupo de orbe mágico
      const magicGroup = new THREE.Group();
      const coreMesh = new THREE.Mesh(magicCoreGeo, magicCoreMat);
      const glowMesh = new THREE.Mesh(magicGlowGeo, magicGlowMat);
      magicGroup.add(coreMesh);
      magicGroup.add(glowMesh);
      slotGroup.add(magicGroup);

      this.group.add(slotGroup);
      slots.push({
        slotGroup,
        arrowGroup,
        magicGroup,
        glowMesh,
      });
    }

    this._sharedGeos = [arrowShaftGeo, arrowHeadGeo, magicCoreGeo, magicGlowGeo];
    this._sharedMats = [arrowMat, arrowHeadMat, magicCoreMat, magicGlowMat];

    return slots;
  }

  /**
   * Actualiza la posición y orientación de los proyectiles visibles.
   * @param {number} dt
   * @param {Array<Object>} projectiles
   */
  update(dt, projectiles = []) {
    this.time += dt;

    for (let i = 0; i < this.capacity; i++) {
      const slot = this.slots[i];
      const p = projectiles[i];

      if (!p || !p.active) {
        if (slot.slotGroup.visible) {
          slot.slotGroup.visible = false;
        }
        continue;
      }

      slot.slotGroup.visible = true;
      slot.slotGroup.position.set(p.x, p.y, p.z);

      const isMagic = p.type === WEAPON_TYPES.PROJECTILE_MAGIC;
      slot.arrowGroup.visible = !isMagic;
      slot.magicGroup.visible = isMagic;

      if (isMagic) {
        // Pulsación suave de energía arcana
        const pulse = 1.0 + Math.sin(this.time * 14 + i) * 0.18;
        slot.magicGroup.scale.set(pulse, pulse, pulse);
      } else {
        // Orientar flecha según vector de velocidad
        if (p.speed > 0) {
          slot.slotGroup.lookAt(p.x + p.vx, p.y + p.vy, p.z + p.vz);
        }
      }
    }
  }

  dispose() {
    for (const g of this._sharedGeos) g.dispose();
    for (const m of this._sharedMats) m.dispose();
    this.scene.remove(this.group);
  }
}
