import * as THREE from 'three';

export class ChestRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ChestEntitiesGroup';
    this.scene.add(this.group);

    this.chests = new Map();

    // Geometrías compartidas
    this.baseGeo = new THREE.BoxGeometry(0.8, 0.38, 0.6);
    this.strapGeo = new THREE.BoxGeometry(0.82, 0.40, 0.12);
    this.lidGeo = new THREE.BoxGeometry(0.82, 0.16, 0.58);
    this.latchGeo = new THREE.BoxGeometry(0.12, 0.14, 0.08);
    this.gemGeo = new THREE.DodecahedronGeometry(0.1, 0);

    // Materiales compartidos
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });  // Madera de roble noble
    this.metalMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Refuerzos y bisagras doradas
    this.ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a });  // Hierro forjado oscuro
    this.goldMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });   // Oro brillante
    this.gemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });    // Gema rúnica azul resplandeciente
  }

  loadChests(chestConfigs = []) {
    this.clear();

    if (!Array.isArray(chestConfigs) || chestConfigs.length === 0) {
      return;
    }

    for (const cfg of chestConfigs) {
      const chestId = cfg.id || 1;
      const x = cfg.x ?? 4.0;
      const y = cfg.y ?? 0.0;
      const z = cfg.z ?? 6.0;

      const chestGroup = new THREE.Group();
      chestGroup.position.set(x, y, z);

      // 1. Base del cofre
      const baseMesh = new THREE.Mesh(this.baseGeo, this.woodMat);
      baseMesh.position.set(0, 0.19, 0);
      chestGroup.add(baseMesh);

      // Bandas metálicas de refuerzo
      const strapMesh = new THREE.Mesh(this.strapGeo, this.metalMat);
      strapMesh.position.set(0, 0.19, 0);
      chestGroup.add(strapMesh);

      // 2. Bisagra y Tapa superior (Pivotada en el borde trasero)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.38, -0.28);

      const lidMesh = new THREE.Mesh(this.lidGeo, this.woodMat);
      lidMesh.position.set(0, 0.08, 0.28);
      lidPivot.add(lidMesh);

      const lidStrap = new THREE.Mesh(this.strapGeo, this.metalMat);
      lidStrap.scale.set(1.0, 0.42, 1.0);
      lidStrap.position.set(0, 0.08, 0.28);
      lidPivot.add(lidStrap);

      // Pestillo / Cerradura frontal
      const latch = new THREE.Mesh(this.latchGeo, this.ironMat);
      latch.position.set(0, 0.02, 0.58);
      lidPivot.add(latch);

      chestGroup.add(lidPivot);

      // 3. Tesoro interior (Gemas y lingotes)
      const goldTreasure = new THREE.Mesh(this.gemGeo, this.goldMat);
      goldTreasure.scale.set(1.5, 0.7, 1.2);
      goldTreasure.position.set(0, 0.24, 0);
      chestGroup.add(goldTreasure);

      const gemTreasure = new THREE.Mesh(this.gemGeo, this.gemMat);
      gemTreasure.position.set(0.12, 0.28, 0.08);
      chestGroup.add(gemTreasure);

      // Luz dorada interior que se revela al abrir
      const lootLight = new THREE.PointLight(0xfbbf24, 0, 6, 2.0);
      lootLight.position.set(0, 0.4, 0);
      chestGroup.add(lootLight);

      this.group.add(chestGroup);

      this.chests.set(chestId, {
        id: chestId,
        name: cfg.name || 'Cofre del Tesoro',
        reward: cfg.reward || 'Tesoros de la Mazmorra',
        message: cfg.message,
        x,
        y,
        z,
        isOpen: false,
        openProgress: 0,
        lidPivot,
        lootLight,
        chestGroup,
      });
    }
  }

  openChest(chestId = 1) {
    const chest = this.chests.get(chestId);
    if (!chest || chest.isOpen) return false;

    chest.isOpen = true;
    return true;
  }

  isChestOpen(chestId = 1) {
    const chest = this.chests.get(chestId);
    return chest ? chest.isOpen : false;
  }

  update(dt = 0.016) {
    for (const chest of this.chests.values()) {
      if (chest.isOpen && chest.openProgress < 1.0) {
        chest.openProgress = Math.min(1.0, chest.openProgress + dt * 3.5);
        // Curva suave de apertura
        const angle = Math.sin(chest.openProgress * Math.PI * 0.5) * 1.35; // ~77 grados
        chest.lidPivot.rotation.x = -angle;
        if (chest.lootLight) {
          chest.lootLight.intensity = chest.openProgress * 1.8;
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
    this.baseGeo.dispose();
    this.strapGeo.dispose();
    this.lidGeo.dispose();
    this.latchGeo.dispose();
    this.gemGeo.dispose();
    this.woodMat.dispose();
    this.metalMat.dispose();
    this.ironMat.dispose();
    this.goldMat.dispose();
    this.gemMat.dispose();
  }
}
