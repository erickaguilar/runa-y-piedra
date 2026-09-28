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
    this._woodTexture = DoorRenderer.createWoodPlankTexture(256, 512);
    return {
      wood: new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: this._woodTexture,
      }),
      woodDark: new THREE.MeshLambertMaterial({ color: 0x451a03 }),  // Relieves y juntas oscuras
      iron: new THREE.MeshLambertMaterial({ color: 0x27272a }),      // Hierro forjado oscuro
      gold: new THREE.MeshLambertMaterial({ color: 0xd97706 }),      // Cerrojos y herrajes dorados
    };
  }

  /**
   * Genera proceduralmente una textura de alta resolución (256x512) para las hojas de puerta,
   * con 4 tablones verticales de roble noble, vetas longitudinales orgánicas, nudos de madera,
   * ranuras profundas y remaches de forja en escala 1:2 (proporción exacta de la hoja 3D).
   */
  static createWoodPlankTexture(width = 256, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Color base inmediato para evitar parpadeos durante la carga asíncrona de la imagen
    ctx.fillStyle = '#582f14';
    ctx.fillRect(0, 0, width, height);

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <!-- Fondo base de madera de roble oscuro -->
        <rect width="${width}" height="${height}" fill="#381c0c"/>
        
        <!-- 4 Tablones verticales con matices de madera cálida -->
        <rect x="2" y="2" width="60" height="${height - 4}" fill="#582f14"/>
        <rect x="66" y="2" width="60" height="${height - 4}" fill="#6d3a19"/>
        <rect x="130" y="2" width="60" height="${height - 4}" fill="#582f14"/>
        <rect x="194" y="2" width="60" height="${height - 4}" fill="#643516"/>

        <!-- Ranuras profundas entre tablones con sombras y biseles de luz -->
        <line x1="64" y1="0" x2="64" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
        <line x1="66" y1="0" x2="66" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>
        <line x1="128" y1="0" x2="128" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
        <line x1="130" y1="0" x2="130" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>
        <line x1="192" y1="0" x2="192" y2="${height}" stroke="#1f0f06" stroke-width="4"/>
        <line x1="194" y1="0" x2="194" y2="${height}" stroke="#8c4e23" stroke-width="1" opacity="0.6"/>

        <!-- Vetas longitudinales de madera (fibra orgánica) -->
        <g stroke="#3d1f0d" stroke-width="1.2" opacity="0.65" fill="none">
          <path d="M 12 0 Q 18 120 14 260 T 20 ${height}"/>
          <path d="M 36 0 Q 30 180 38 340 T 32 ${height}"/>
          <path d="M 48 0 Q 52 140 46 300 T 50 ${height}"/>

          <path d="M 78 0 Q 84 160 80 320 T 86 ${height}"/>
          <path d="M 100 0 Q 94 130 102 280 T 96 ${height}"/>
          <path d="M 116 0 Q 120 200 114 380 T 118 ${height}"/>

          <path d="M 142 0 Q 148 150 144 300 T 150 ${height}"/>
          <path d="M 164 0 Q 158 170 166 350 T 160 ${height}"/>
          <path d="M 178 0 Q 182 130 176 290 T 180 ${height}"/>

          <path d="M 206 0 Q 212 180 208 340 T 214 ${height}"/>
          <path d="M 228 0 Q 222 140 230 300 T 224 ${height}"/>
          <path d="M 244 0 Q 248 190 242 370 T 246 ${height}"/>
        </g>

        <!-- Nudos de madera artesanales -->
        <g fill="#2e1507" opacity="0.8">
          <ellipse cx="32" cy="110" rx="7" ry="12"/>
          <ellipse cx="104" cy="380" rx="8" ry="14"/>
          <ellipse cx="160" cy="180" rx="7" ry="11"/>
          <ellipse cx="226" cy="440" rx="6" ry="10"/>
        </g>
        <g stroke="#4a2610" stroke-width="1.5" fill="none" opacity="0.7">
          <ellipse cx="32" cy="110" rx="12" ry="20"/>
          <ellipse cx="104" cy="380" rx="14" ry="22"/>
          <ellipse cx="160" cy="180" rx="11" ry="18"/>
          <ellipse cx="226" cy="440" rx="10" ry="16"/>
        </g>

        <!-- Clavos de hierro forjado con remaches en los extremos -->
        <g fill="#18181b">
          <circle cx="32" cy="24" r="3"/><circle cx="96" cy="24" r="3"/>
          <circle cx="160" cy="24" r="3"/><circle cx="224" cy="24" r="3"/>
          <circle cx="32" cy="${height - 24}" r="3"/><circle cx="96" cy="${height - 24}" r="3"/>
          <circle cx="160" cy="${height - 24}" r="3"/><circle cx="224" cy="${height - 24}" r="3"/>
        </g>
        <g fill="#71717a">
          <circle cx="31" cy="23" r="1"/><circle cx="95" cy="23" r="1"/>
          <circle cx="159" cy="23" r="1"/><circle cx="223" cy="23" r="1"/>
          <circle cx="31" cy="${height - 25}" r="1"/><circle cx="95" cy="${height - 25}" r="1"/>
          <circle cx="159" cy="${height - 25}" r="1"/><circle cx="223" cy="${height - 25}" r="1"/>
        </g>

        <!-- Bisel perimetral de relieve -->
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#1f0f06" stroke-width="2" opacity="0.8"/>
        <line x1="2" y1="2" x2="${width - 2}" y2="2" stroke="#8c4e23" stroke-width="2" opacity="0.5"/>
      </svg>
    `;

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      texture.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    return texture;
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
    if (this._woodTexture) {
      this._woodTexture.dispose();
      this._woodTexture = null;
    }
    for (const m of Object.values(this._materials)) m.dispose?.();
    for (const g of Object.values(this._geometries)) g.dispose?.();
  }
}
