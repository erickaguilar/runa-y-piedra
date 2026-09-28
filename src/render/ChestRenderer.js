import * as THREE from 'three';

export class ChestRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ChestEntitiesGroup';
    this.scene.add(this.group);

    this.chests = new Map();

    // Geometrías compartidas a escala de bloque 1x1x1 (0.96m con 0.02m de margen anti Z-fighting)
    // Base cúbica: 0.96m ancho x 0.62m alto x 0.96m profundidad
    this.baseGeo = new THREE.BoxGeometry(0.96, 0.62, 0.96);
    this.strapGeo = new THREE.BoxGeometry(0.98, 0.64, 0.18);
    this.cornerGeo = new THREE.BoxGeometry(0.18, 0.64, 0.98);
    this.rimGeo = new THREE.BoxGeometry(0.98, 0.08, 0.98);

    // Tapa cúbica pivotada: 0.96m ancho x 0.34m alto x 0.96m profundidad
    this.lidGeo = new THREE.BoxGeometry(0.96, 0.34, 0.96);
    this.lidStrapGeo = new THREE.BoxGeometry(0.98, 0.36, 0.18);
    this.lidCornerGeo = new THREE.BoxGeometry(0.18, 0.36, 0.98);
    this.latchGeo = new THREE.BoxGeometry(0.16, 0.20, 0.08);

    // Tesoros interiores
    this.goldGeo = new THREE.DodecahedronGeometry(0.20, 0);
    this.gemGeo = new THREE.DodecahedronGeometry(0.14, 0);

    // Materiales compartidos
    this.woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });  // Madera de roble noble
    this.metalMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Refuerzos y herrajes dorados
    this.ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a });  // Hierro forjado oscuro
    this.goldMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });   // Oro brillante
    this.gemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });    // Gema rúnica azul resplandeciente
    this.rubyMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });   // Rubí ancestral carmesí
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

      const chestGroup = new THREE.Group();
      chestGroup.position.set(x, y, z);

      // 1. BASE CÚBICA (ocupa y: 0 a 0.62)
      const baseMesh = new THREE.Mesh(this.baseGeo, this.woodMat);
      baseMesh.position.set(0, 0.31, 0);
      chestGroup.add(baseMesh);

      // Bandas metálicas de refuerzo
      const strapMesh = new THREE.Mesh(this.strapGeo, this.metalMat);
      strapMesh.position.set(0, 0.31, 0);
      chestGroup.add(strapMesh);

      const cornerMesh = new THREE.Mesh(this.cornerGeo, this.metalMat);
      cornerMesh.position.set(0, 0.31, 0);
      chestGroup.add(cornerMesh);

      // Borde inferior de hierro forjado
      const rimMesh = new THREE.Mesh(this.rimGeo, this.ironMat);
      rimMesh.position.set(0, 0.04, 0);
      chestGroup.add(rimMesh);

      // 2. BISAGRA Y TAPA SUPERIOR (Pivotada en el borde trasero a y = 0.62, z = -0.48)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.62, -0.48);

      const lidMesh = new THREE.Mesh(this.lidGeo, this.woodMat);
      lidMesh.position.set(0, 0.17, 0.48);
      lidPivot.add(lidMesh);

      const lidStrap = new THREE.Mesh(this.lidStrapGeo, this.metalMat);
      lidStrap.position.set(0, 0.17, 0.48);
      lidPivot.add(lidStrap);

      const lidCorner = new THREE.Mesh(this.lidCornerGeo, this.metalMat);
      lidCorner.position.set(0, 0.17, 0.48);
      lidPivot.add(lidCorner);

      // Pestillo / Cerradura frontal
      const latch = new THREE.Mesh(this.latchGeo, this.ironMat);
      latch.position.set(0, 0.05, 0.97);
      lidPivot.add(latch);

      chestGroup.add(lidPivot);

      // 3. TESORO INTERIOR (Oro, gema celeste y rubí)
      const goldTreasure = new THREE.Mesh(this.goldGeo, this.goldMat);
      goldTreasure.scale.set(2.4, 0.9, 2.0);
      goldTreasure.position.set(0, 0.40, 0);
      chestGroup.add(goldTreasure);

      const gemTreasure = new THREE.Mesh(this.gemGeo, this.gemMat);
      gemTreasure.scale.set(1.4, 1.4, 1.4);
      gemTreasure.position.set(0.18, 0.48, 0.14);
      chestGroup.add(gemTreasure);

      const rubyTreasure = new THREE.Mesh(this.gemGeo, this.rubyMat);
      rubyTreasure.scale.set(1.2, 1.2, 1.2);
      rubyTreasure.position.set(-0.16, 0.46, -0.12);
      chestGroup.add(rubyTreasure);

      // Luz dorada interior que se activa al abrir el cofre
      const lootLight = new THREE.PointLight(0xfbbf24, 0, 8, 2.0);
      lootLight.position.set(0, 0.70, 0);
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
        // Curva suave de apertura de bisagra 3D (~83 grados)
        const angle = Math.sin(chest.openProgress * Math.PI * 0.5) * 1.45;
        chest.lidPivot.rotation.x = -angle;
        if (chest.lootLight) {
          chest.lootLight.intensity = chest.openProgress * 3.0;
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
    this.cornerGeo.dispose();
    this.rimGeo.dispose();
    this.lidGeo.dispose();
    this.lidStrapGeo.dispose();
    this.lidCornerGeo.dispose();
    this.latchGeo.dispose();
    this.goldGeo.dispose();
    this.gemGeo.dispose();
    this.woodMat.dispose();
    this.metalMat.dispose();
    this.ironMat.dispose();
    this.goldMat.dispose();
    this.gemMat.dispose();
    this.rubyMat.dispose();
  }
}
