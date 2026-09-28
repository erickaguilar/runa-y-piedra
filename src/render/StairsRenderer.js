// src/render/StairsRenderer.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Máquina de estados de la losa: closed -> shaking -> sliding -> open
const SHAKE_TIME = 0.5;
const SLIDE_TIME = 1.4;
const SLIDE_DIST = 2.4;
const FOG_COUNT = 10;

export class StairsRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'StairsEntitiesGroup';
    this.scene.add(this.group);

    this.stairs = null; // Solo hay una escalinata por nivel (tras el altar)

    this.stoneMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    this.stoneDarkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    this.ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a });
    this.goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
    this.blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  }

  /**
   * Registra la escalinata sellada sobre el rectángulo de fosa.
   * @param {{x1,x2,z1,z2}} rect bloques de suelo que se retirarán al abrir
   */
  loadStairs(rect = null) {
    this.clear();
    if (!rect) return;

    const cx = (rect.x1 + rect.x2 + 1) / 2; // centro X del hueco (11..12 -> 12.0)
    const cz = (rect.z1 + rect.z2 + 1) / 2; // centro Z del hueco (31..33 -> 32.0)
    const w = rect.x2 - rect.x1 + 1; // 2
    const d = rect.z2 - rect.z1 + 1; // 3

    const root = new THREE.Group();
    root.position.set(cx, 1.0, cz); // sobre el suelo (y=1.0)

    // --- Losa sellada (2x3) con bandas de forja y runas doradas ---
    const slab = new THREE.Group();
    const slabBase = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.14, d + 0.2), this.stoneDarkMat);
    slabBase.position.y = 0.07;
    slab.add(slabBase);
    const bandGeos = [];
    for (let i = 0; i < 3; i++) {
      const zoff = -d / 2 + 0.5 + i * 1.0;
      bandGeos.push(new THREE.BoxGeometry(w + 0.24, 0.05, 0.12).translate(0, 0.15, zoff));
    }
    const bands = new THREE.Mesh(mergeGeometries(bandGeos), this.ironMat);
    bandGeos.forEach(g => g.dispose());
    slab.add(bands);
    const runeGeos = [];
    for (let i = 0; i < 2; i++) {
      const zoff = -d / 2 + 1.0 + i * 1.0;
      runeGeos.push(new THREE.BoxGeometry(0.12, 0.03, 0.5).translate(-0.5, 0.155, zoff));
      runeGeos.push(new THREE.BoxGeometry(0.12, 0.03, 0.5).translate(0.5, 0.155, zoff));
    }
    const runes = new THREE.Mesh(mergeGeometries(runeGeos), this.goldMat);
    runeGeos.forEach(g => g.dispose());
    slab.add(runes);
    root.add(slab);

    // --- Escalones de piedra descendentes (visuales, dentro de la fosa) ---
    const steps = new THREE.Group();
    const stepTops = [0.72, 0.48, 0.24, 0.02];
    stepTops.forEach((top, i) => {
      const h = top + 1.0; // desde y=-1.0 hasta el peldaño
      const step = new THREE.Mesh(new THREE.BoxGeometry(w - 0.15, h, 0.72), this.stoneMat);
      step.position.set(0, -1.0 + h / 2, -d / 2 + 0.4 + i * 0.73);
      steps.add(step);
    });
    // Garganta oscura entre peldaños (vende la profundidad)
    const throat = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.9, d - 0.2), this.blackMat);
    throat.position.set(0, -0.55, 0);
    steps.add(throat);
    steps.visible = false;
    root.add(steps);

    // --- Luz brasienta desde abajo + niebla ascendente ---
    const pitLight = new THREE.PointLight(0xfb9235, 0, 7, 2.0);
    pitLight.position.set(0, -0.3, 0);
    root.add(pitLight);

    const fogPos = new Float32Array(FOG_COUNT * 3);
    for (let k = 0; k < FOG_COUNT; k++) {
      fogPos[k * 3] = (Math.random() - 0.5) * (w - 0.4);
      fogPos[k * 3 + 1] = -0.8 + Math.random() * 1.4;
      fogPos[k * 3 + 2] = (Math.random() - 0.5) * (d - 0.4);
    }
    const fogGeo = new THREE.BufferGeometry();
    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
    const fogMat = new THREE.PointsMaterial({
      color: 0x94a3b8, size: 0.16, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true,
    });
    const fog = new THREE.Points(fogGeo, fogMat);
    fog.visible = false;
    root.add(fog);

    this.group.add(root);
    this.stairs = {
      rect, root, slab, steps, pitLight, fog,
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
    this.stairs.steps.visible = true;
    this.stairs.fog.visible = true;
    this.stairs.fog.material.opacity = 0.55;
    this.stairs.pitLight.intensity = 1.6;
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
        s.slab.position.z = 0;
      }
    } else if (s.state === 'sliding') {
      s.t += safeDt;
      const k = Math.min(1, s.t / SLIDE_TIME);
      const eased = 1 - Math.pow(1 - k, 3);
      s.slab.position.x = eased * SLIDE_DIST;
      s.steps.visible = k > 0.15;
      s.fog.visible = k > 0.3;
      s.fog.material.opacity = 0.55 * k;
      s.pitLight.intensity = 1.6 * k;
      if (k >= 1) s.state = 'open';
    } else if (s.state === 'open') {
      // Niebla ascendiendo en bucle desde la fosa
      const attr = s.fog.geometry.getAttribute('position');
      const arr = attr.array;
      for (let i = 0; i < FOG_COUNT; i++) {
        let y = arr[i * 3 + 1] + safeDt * 0.22;
        if (y > 0.7) y = -0.8;
        arr[i * 3 + 1] = y;
      }
      attr.needsUpdate = true;
      s.pitLight.intensity = 1.6 + Math.sin(time * 5.1) * 0.25;
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
    this.stoneMat.dispose?.();
    this.stoneDarkMat.dispose?.();
    this.ironMat.dispose?.();
    this.goldMat.dispose?.();
    this.blackMat.dispose?.();
  }
}
