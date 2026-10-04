// src/render/DoorRenderer.js
import * as THREE from 'three';
import { Spring } from '../ui/Spring.js';
import {
  createWoodPlankTexture,
  createDoorMaterials,
  createDoorGeometries,
  buildDoorLeaf,
} from './models/props/doorModel.js';

const DOOR_TARGET_ANGLE = 1.48; // ~85° — deja margen de seguridad para el overshoot del 8% (~92° max)
const DOOR_SPRING_K     = 240;  // Rigidez enérgica con respuesta rápida (~0.38s)
const DOOR_SPRING_C     = 20;   // Amortiguación con 1 micro-rebote táctil contra el sillar

export class DoorRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'DoorEntitiesGroup';
    this.scene.add(this.group);

    this.doors = new Map();
    this._woodTexture = DoorRenderer.createWoodPlankTexture(256, 512);
    this._materials = createDoorMaterials(this._woodTexture);
    this._geometries = createDoorGeometries();
  }

  static createWoodPlankTexture(width = 256, height = 512) {
    return createWoodPlankTexture(width, height);
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

  /**
   * Construye una hoja de puerta delegando en el módulo paramétrico doorModel.
   */
  _buildLeaf(sign) {
    return buildDoorLeaf(sign, this._geometries, this._materials);
  }

  openDoor(id = 1) {
    const d = this.doors.get(id);
    if (!d || d.isOpen) return false;

    d.isOpen = true;
    d.leftSpring.set(d.targetLeft);
    d.rightSpring.set(d.targetRight);
    return true;
  }

  closeDoor(id = 1) {
    const d = this.doors.get(id);
    if (!d || !d.isOpen) return false;

    d.isOpen = false;
    d.leftSpring.set(0);
    d.rightSpring.set(0);
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

  /** Cierre instantáneo sin animación. */
  setClosedInstant(id = 1) {
    const d = this.doors.get(id);
    if (!d) return;

    d.isOpen = false;
    d.leftSpring.snap(0);
    d.rightSpring.snap(0);
    d.leftPivot.rotation.y = 0;
    d.rightPivot.rotation.y = 0;
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
    if (this._woodTexture) {
      this._woodTexture.dispose();
      this._woodTexture = null;
    }
    for (const m of Object.values(this._materials)) m.dispose?.();
    for (const g of Object.values(this._geometries)) g.dispose?.();
  }
}
