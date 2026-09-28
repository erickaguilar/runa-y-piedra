// src/render/DoorRenderer.js
import * as THREE from 'three';
import { Spring } from '../ui/Spring.js';

const DOOR_TARGET_ANGLE = 1.48; // ~85° — deja margen de seguridad para el overshoot del 8% (~92° max)
const DOOR_SPRING_K     = 240;  // Rigidez enérgica con respuesta rápida (~0.38s)
const DOOR_SPRING_C     = 20;   // Amortiguación con 1 micro-rebote táctil contra el sillar

const LEAF_THICKNESS    = 0.12; // 12 cm de roble macizo
const LEAF_WIDTH        = 1.00; // 2 hojas de 1.00m cubren el vano de 2.00m
const LEAF_HEIGHT       = 1.98; // Ajustado al vano de 2 bloques de altura

export class DoorRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'DoorEntitiesGroup';
    this.scene.add(this.group);

    this.doors = new Map();
    this._materials = this._createMaterials();
    this._geometries = this._createGeometries();
  }

  _createMaterials() {
    return {
      wood: new THREE.MeshLambertMaterial({ color: 0x78350f }),      // Roble noble medieval
      woodDark: new THREE.MeshLambertMaterial({ color: 0x5a2a08 }),  // Relieves de madera
      iron: new THREE.MeshLambertMaterial({ color: 0x27272a }),      // Hierro forjado oscuro
      gold: new THREE.MeshLambertMaterial({ color: 0xd97706 }),      // Cerrojos y herrajes dorados
    };
  }

  _createGeometries() {
    return {
      panel: new THREE.BoxGeometry(LEAF_WIDTH, LEAF_HEIGHT, LEAF_THICKNESS),
      band:  new THREE.BoxGeometry(LEAF_WIDTH, 0.09, LEAF_THICKNESS + 0.02),
      lock:  new THREE.BoxGeometry(0.12, 0.22, LEAF_THICKNESS + 0.04),
      knob:  new THREE.SphereGeometry(0.04, 8, 6),
    };
  }

  loadDoors(doorConfigs = []) {
    this.clear();
    if (!Array.isArray(doorConfigs)) return;
    for (const cfg of doorConfigs) {
      this.addDoor(cfg);
    }
  }

  /**
   * Registra y construye una puerta batiente 3D con pivotes en ambos bordes del vano.
   * Por defecto, swingDir = 1 hace girar las hojas hacia +Z (hacia la sala de destino).
   */
  addDoor(def) {
    const id = def.id ?? 1;
    const x1 = def.x1 ?? 11;
    const x2 = def.x2 ?? 13;
    const y1 = def.y1 ?? 1;
    const y2 = def.y2 ?? 3;
    const z  = def.z  ?? 11;
    const swingDir = def.swingDir ?? 1; // +1 hacia la sala de destino (+Z)

    const yMid = (y1 + y2) / 2;
    const zMid = z + 0.5;

    // Los pivotes residen en los marcos laterales del vano
    const leftPivot = new THREE.Object3D();
    leftPivot.position.set(x1, yMid, zMid);

    const rightPivot = new THREE.Object3D();
    rightPivot.position.set(x2, yMid, zMid);

    // Hoja izquierda (se extiende hacia +X desde x1 hasta el centro x=12)
    const leftLeaf = this._buildLeaf(+1);
    leftPivot.add(leftLeaf);

    // Hoja derecha (se extiende hacia -X desde x2 hasta el centro x=12)
    const rightLeaf = this._buildLeaf(-1);
    rightPivot.add(rightLeaf);

    this.group.add(leftPivot);
    this.group.add(rightPivot);

    // Giro hacia +Z: leftPivot rota negativo y rightPivot rota positivo
    const targetLeft = -DOOR_TARGET_ANGLE * swingDir;
    const targetRight = DOOR_TARGET_ANGLE * swingDir;

    const leftSpring = new Spring(DOOR_SPRING_K, DOOR_SPRING_C, 0);
    const rightSpring = new Spring(DOOR_SPRING_K, DOOR_SPRING_C, 0);
    leftSpring.snap(0);
    rightSpring.snap(0);

    this.doors.set(id, {
      id,
      name: def.name || `Puerta ${id}`,
      leftPivot,
      rightPivot,
      leftSpring,
      rightSpring,
      targetLeft,
      targetRight,
      isOpen: false,
    });
  }

  /** Construye una hoja con panel de roble, 2 bandas de hierro pasantes, cerradura y pomo. */
  _buildLeaf(sign) {
    const g = new THREE.Group();

    // 1. Panel de madera desplazado desde el pivote hacia el centro del vano
    const panel = new THREE.Mesh(this._geometries.panel, this._materials.wood);
    panel.position.set(sign * (LEAF_WIDTH / 2), 0, 0);
    g.add(panel);

    // 2. Bandas de hierro reforzado (superior e inferior, sobresalen por ambos lados)
    for (const dy of [+0.65, -0.65]) {
      const band = new THREE.Mesh(this._geometries.band, this._materials.iron);
      band.position.set(sign * (LEAF_WIDTH / 2), dy, 0);
      g.add(band);
    }

    // 3. Cerrojo de forja central en el borde de cierre
    const lock = new THREE.Mesh(this._geometries.lock, this._materials.iron);
    lock.position.set(sign * (LEAF_WIDTH - 0.08), 0, 0);
    g.add(lock);

    // 4. Pomo dorado sobre el cerrojo
    const knob = new THREE.Mesh(this._geometries.knob, this._materials.gold);
    knob.position.set(sign * (LEAF_WIDTH - 0.08), -0.02, (LEAF_THICKNESS / 2) + 0.03);
    g.add(knob);

    return g;
  }

  openDoor(id = 1) {
    const d = this.doors.get(id);
    if (!d || d.isOpen) return false;

    d.isOpen = true;
    d.leftSpring.set(d.targetLeft);
    d.rightSpring.set(d.targetRight);
    return true;
  }

  isDoorOpen(id = 1) {
    const d = this.doors.get(id);
    return d ? d.isOpen : false;
  }

  /** Apertura instantánea sin animación (sincronización de clientes que se unen tarde en INIT). */
  setOpenInstant(id = 1) {
    const d = this.doors.get(id);
    if (!d) return;

    d.isOpen = true;
    d.leftSpring.snap(d.targetLeft);
    d.rightSpring.snap(d.targetRight);
    d.leftPivot.rotation.y = d.targetLeft;
    d.rightPivot.rotation.y = d.targetRight;
  }

  update(dt = 0.016) {
    for (const d of this.doors.values()) {
      if (!d.leftSpring.isSettled || !d.rightSpring.isSettled) {
        const la = d.leftSpring.update(dt);
        const ra = d.rightSpring.update(dt);
        d.leftPivot.rotation.y = la;
        d.rightPivot.rotation.y = ra;
      }
    }
  }

  clear() {
    for (const d of this.doors.values()) {
      this.group.remove(d.leftPivot);
      this.group.remove(d.rightPivot);
    }
    this.doors.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    for (const m of Object.values(this._materials)) m.dispose?.();
    for (const g of Object.values(this._geometries)) g.dispose?.();
  }
}
