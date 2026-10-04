// src/render/PressurePlateRenderer.js
import * as THREE from 'three';
import { Spring } from '../ui/Spring.js';
import {
  createPressurePlateMaterials,
  createPressurePlateGeometries,
  buildPressurePlateMesh,
  PLATE_PRESS_DEPTH,
} from './models/props/pressurePlateModel.js';

const PLATE_SPRING_K = 280; // Rigidez mecánica con respuesta firme
const PLATE_SPRING_C = 22;  // Amortiguación suave sin oscilaciones infinitas

export class PressurePlateRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PressurePlateEntitiesGroup';
    this.scene.add(this.group);

    this.plates = new Map();
    this.mats = createPressurePlateMaterials();
    this.geos = createPressurePlateGeometries();
  }

  loadPressurePlates(plateConfigs = []) {
    this.clear();
    if (!Array.isArray(plateConfigs)) return;
    for (const cfg of plateConfigs) {
      this.addPressurePlate(cfg);
    }
  }

  addPressurePlate(cfg) {
    const id = cfg.id || `plate_${cfg.x}_${cfg.z}`;
    const x = cfg.x ?? 12;
    const y = cfg.y ?? 1.0;
    const z = cfg.z ?? 10;
    const action = cfg.action || 'open_door';
    const isClose = action === 'close_door';

    const { root, platePivot, plateMesh, runeMesh, light } = buildPressurePlateMesh(this.geos, this.mats, { action });
    root.position.set(x, y, z);
    this.group.add(root);

    const spring = new Spring(PLATE_SPRING_K, PLATE_SPRING_C, 0);
    spring.snap(0);

    const isPressed = !!cfg.isPressed;
    if (isPressed) {
      spring.snap(PLATE_PRESS_DEPTH);
      platePivot.position.y = -PLATE_PRESS_DEPTH;
      if (runeMesh) runeMesh.material = isClose ? this.mats.runeCloseActive : this.mats.runeActive;
      if (light) {
        light.intensity = 1.6;
        light.color.setHex(isClose ? 0xf43f5e : 0x38bdf8);
      }
    }

    this.plates.set(id, {
      id,
      x,
      y,
      z,
      root,
      platePivot,
      plateMesh,
      runeMesh,
      light,
      spring,
      isPressed,
      targetDoorId: cfg.targetDoorId ?? 1,
      action,
      reusable: cfg.reusable !== false,
    });
  }

  press(id) {
    const p = this.plates.get(id);
    if (!p || p.isPressed) return false;

    p.isPressed = true;
    p.spring.set(PLATE_PRESS_DEPTH);
    const isClose = p.action === 'close_door';
    if (p.runeMesh) p.runeMesh.material = isClose ? this.mats.runeCloseActive : this.mats.runeActive;
    if (p.light) {
      p.light.intensity = 1.8;
      p.light.color.setHex(isClose ? 0xf43f5e : 0x38bdf8);
    }
    return true;
  }

  unpress(id) {
    const p = this.plates.get(id);
    if (!p || !p.isPressed) return false;

    p.isPressed = false;
    p.spring.set(0);
    const isClose = p.action === 'close_door';
    if (p.runeMesh) p.runeMesh.material = isClose ? this.mats.runeCloseInactive : this.mats.runeInactive;
    if (p.light) {
      p.light.intensity = 0.5;
      p.light.color.setHex(isClose ? 0xef4444 : 0xf59e0b);
    }
    return true;
  }

  isPressed(id) {
    const p = this.plates.get(id);
    return p ? p.isPressed : false;
  }

  setPressedInstant(id) {
    const p = this.plates.get(id);
    if (!p) return;
    p.isPressed = true;
    p.spring.snap(PLATE_PRESS_DEPTH);
    p.platePivot.position.y = -PLATE_PRESS_DEPTH;
    const isClose = p.action === 'close_door';
    if (p.runeMesh) p.runeMesh.material = isClose ? this.mats.runeCloseActive : this.mats.runeActive;
    if (p.light) {
      p.light.intensity = 1.6;
      p.light.color.setHex(isClose ? 0xf43f5e : 0x38bdf8);
    }
  }

  setUnpressedInstant(id) {
    const p = this.plates.get(id);
    if (!p) return;
    p.isPressed = false;
    p.spring.snap(0);
    p.platePivot.position.y = 0;
    const isClose = p.action === 'close_door';
    if (p.runeMesh) p.runeMesh.material = isClose ? this.mats.runeCloseInactive : this.mats.runeInactive;
    if (p.light) {
      p.light.intensity = 0.5;
      p.light.color.setHex(isClose ? 0xef4444 : 0xf59e0b);
    }
  }

  update(dt = 0.016) {
    for (const p of this.plates.values()) {
      if (!p.spring.isSettled) {
        const val = p.spring.update(dt);
        p.platePivot.position.y = -val;
      }
    }
  }

  clear() {
    for (const p of this.plates.values()) {
      this.group.remove(p.root);
    }
    this.plates.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    for (const m of Object.values(this.mats || {})) m.dispose?.();
    for (const g of Object.values(this.geos || {})) g.dispose?.();
  }
}
