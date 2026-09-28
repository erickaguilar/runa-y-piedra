import * as THREE from 'three';

export class TorchRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'TorchLightsGroup';
    this.scene.add(this.group);

    this.torches = [];

    // Geometrías compartidas
    this.bracketGeo = new THREE.BoxGeometry(0.08, 0.22, 0.08);
    this.cupGeo = new THREE.CylinderGeometry(0.1, 0.06, 0.1, 6);
    this.coreFlameGeo = new THREE.DodecahedronGeometry(0.11, 0);
    this.outerFlameGeo = new THREE.DodecahedronGeometry(0.18, 0);

    // Materiales compartidos
    this.bracketMat = new THREE.MeshLambertMaterial({ color: 0x27272a }); // Hierro forjado oscuro
    this.cupMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });     // Soporte metálico
    this.coreFlameMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed }); // Núcleo cálido de llama
    this.outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.65,
    });
  }

  /**
   * Carga y posiciona las antorchas y candiles definidos en el nivel.
   * @param {Array<Object>} torchConfigs
   */
  loadTorches(torchConfigs = []) {
    this.clear();

    if (!Array.isArray(torchConfigs) || torchConfigs.length === 0) {
      return;
    }

    for (let i = 0; i < torchConfigs.length; i++) {
      const cfg = torchConfigs[i];
      const x = cfg.x ?? 12;
      const y = cfg.y ?? 2.8;
      const z = cfg.z ?? 5;
      const colorVal = typeof cfg.color === 'string' ? parseInt(cfg.color, 16) : (cfg.color ?? 0xffa726);
      const intensity = cfg.intensity ?? 2.2;
      const distance = cfg.distance ?? 14;
      const hasLight = cfg.hasLight !== false;

      // Grupo visual de la antorcha
      const torchMesh = new THREE.Group();
      torchMesh.position.set(x, y, z);

      // 1. Soporte de hierro forjado
      const bracket = new THREE.Mesh(this.bracketGeo, this.bracketMat);
      bracket.position.set(0, -0.06, 0);
      torchMesh.add(bracket);

      const cup = new THREE.Mesh(this.cupGeo, this.cupMat);
      cup.position.set(0, 0.04, 0);
      torchMesh.add(cup);

      // 2. Fuego / Llama ardiente
      const coreFlame = new THREE.Mesh(this.coreFlameGeo, this.coreFlameMat);
      coreFlame.position.set(0, 0.16, 0);
      torchMesh.add(coreFlame);

      const outerFlame = new THREE.Mesh(this.outerFlameGeo, this.outerFlameMat);
      outerFlame.position.set(0, 0.18, 0);
      torchMesh.add(outerFlame);

      this.group.add(torchMesh);

      // 3. Fuente de luz PointLight si corresponde
      let light = null;
      if (hasLight) {
        light = new THREE.PointLight(colorVal, intensity, distance, 2.0);
        light.position.set(x, y + 0.22, z);
        this.group.add(light);
      }

      this.torches.push({
        id: cfg.id || `torch_${i}`,
        baseIntensity: intensity,
        phase: Math.random() * Math.PI * 2,
        light,
        coreFlame,
        outerFlame,
      });
    }
  }

  /**
   * Animación de parpadeo (flicker) natural de las llamas de las antorchas.
   * @param {number} time Segundos transcurridos
   */
  update(time = performance.now() * 0.001) {
    for (let i = 0; i < this.torches.length; i++) {
      const t = this.torches[i];
      // Oscilación suave con frecuencias combinadas
      const flicker = Math.sin(time * 8.5 + t.phase) * 0.07 + Math.cos(time * 14.0 + t.phase * 1.7) * 0.04;

      if (t.light) {
        t.light.intensity = t.baseIntensity * (1.0 + flicker);
      }

      const scaleY = 1.0 + flicker * 0.8;
      const scaleXZ = 1.0 + flicker * 0.4;
      t.coreFlame.scale.set(scaleXZ, scaleY, scaleXZ);
      t.outerFlame.scale.set(scaleXZ, scaleY, scaleXZ);
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
    this.torches = [];
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    this.bracketGeo.dispose();
    this.cupGeo.dispose();
    this.coreFlameGeo.dispose();
    this.outerFlameGeo.dispose();
    this.bracketMat.dispose();
    this.cupMat.dispose();
    this.coreFlameMat.dispose();
    this.outerFlameMat.dispose();
  }
}
