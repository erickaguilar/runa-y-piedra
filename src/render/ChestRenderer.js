// src/render/ChestRenderer.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Spring } from '../ui/Spring.js';

const LID_OPEN_ANGLE = 1.48; // ~85 grados de apertura completa
const LID_SPRING_K = 200;    // Rigidez sub-amortiguada con 1 overshoot visible
const LID_SPRING_C = 14;     // Amortiguación con rebote físico tangible
const LIGHT_MAX_INTENSITY = 3.2;

// Dimensiones de cofre rectangular medieval
const CHEST_W = 0.90; // Ancho (eje X)
const CHEST_H = 0.44; // Altura de la base (eje Y)
const CHEST_D = 0.60; // Profundidad (eje Z)
const LID_RADIUS = CHEST_D / 2; // Radio del arco abovedado (0.30m)

export class ChestRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ChestEntitiesGroup';
    this.scene.add(this.group);

    this.chests = new Map();

    // 1. Textura procedural SVG para madera de roble oscuro con vetas, nudos y clavos
    this._woodTexture = ChestRenderer.createChestWoodTexture(256, 256);

    // 2. Materiales compartidos
    this.woodMat = new THREE.MeshLambertMaterial({
      map: this._woodTexture,
      color: 0xffffff,
    });
    this.ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a });      // Hierro forjado oscuro
    this.goldMat = new THREE.MeshLambertMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
    });                                                                    // Oro brillante de tesoro
    this.gemMat = new THREE.MeshLambertMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
    });                                                                    // Zafiro rúnico azul
    this.rubyMat = new THREE.MeshLambertMaterial({
      color: 0xdc2626,
      emissive: 0x991b1b,
    });                                                                    // Rubí ancestral carmesí
    this.emeraldMat = new THREE.MeshLambertMaterial({
      color: 0x059669,
      emissive: 0x065f46,
    });                                                                    // Esmeralda profunda

    // 3. Geometrías compartidas optimizadas (fusión con mergeGeometries)
    this._createGeometries();
  }

  /**
   * Genera proceduralmente una textura vectorial SVG de alta definición (256x256)
   * con tablones horizontales de roble envejecido, ranuras sombreadas con biseles,
   * vetas longitudinales orgánicas, nudos de madera y clavos de hierro forjado.
   */
  static createChestWoodTexture(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#422006';
    ctx.fillRect(0, 0, width, height);

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <!-- Fondo base de madera de roble oscuro -->
        <rect width="${width}" height="${height}" fill="#2e1405"/>
        
        <!-- 4 Tablones horizontales con matices cálidos de madera antigua -->
        <rect x="2" y="4" width="${width - 4}" height="58" fill="#4a240a"/>
        <rect x="2" y="66" width="${width - 4}" height="58" fill="#5c2e0e"/>
        <rect x="2" y="128" width="${width - 4}" height="58" fill="#452109"/>
        <rect x="2" y="190" width="${width - 4}" height="60" fill="#54290c"/>

        <!-- Ranuras profundas entre tablones con sombras y bisel de luz -->
        <line x1="0" y1="64" x2="${width}" y2="64" stroke="#170902" stroke-width="3"/>
        <line x1="0" y1="66" x2="${width}" y2="66" stroke="#7a3f18" stroke-width="1" opacity="0.6"/>
        <line x1="0" y1="126" x2="${width}" y2="126" stroke="#170902" stroke-width="3"/>
        <line x1="0" y1="128" x2="${width}" y2="128" stroke="#7a3f18" stroke-width="1" opacity="0.6"/>
        <line x1="0" y1="188" x2="${width}" y2="188" stroke="#170902" stroke-width="3"/>
        <line x1="0" y1="190" x2="${width}" y2="190" stroke="#7a3f18" stroke-width="1" opacity="0.6"/>

        <!-- Vetas horizontales de madera noble -->
        <g stroke="#331604" stroke-width="1.2" opacity="0.6" fill="none">
          <path d="M 0 18 Q 60 26 130 16 T ${width} 24"/>
          <path d="M 0 42 Q 90 32 180 46 T ${width} 38"/>
          <path d="M 0 82 Q 70 94 160 80 T ${width} 88"/>
          <path d="M 0 106 Q 110 98 200 112 T ${width} 104"/>
          <path d="M 0 146 Q 50 156 140 142 T ${width} 150"/>
          <path d="M 0 168 Q 100 160 190 174 T ${width} 166"/>
          <path d="M 0 208 Q 80 220 170 206 T ${width} 214"/>
          <path d="M 0 232 Q 60 224 150 238 T ${width} 230"/>
        </g>

        <!-- Nudos de roble -->
        <g fill="#240c03" opacity="0.75">
          <ellipse cx="64" cy="38" rx="10" ry="6"/>
          <ellipse cx="196" cy="100" rx="12" ry="7"/>
          <ellipse cx="88" cy="162" rx="9" ry="5"/>
          <ellipse cx="170" cy="224" rx="11" ry="6"/>
        </g>
        <g stroke="#3d1b06" stroke-width="1.4" fill="none" opacity="0.65">
          <ellipse cx="64" cy="38" rx="16" ry="10"/>
          <ellipse cx="196" cy="100" rx="18" ry="11"/>
          <ellipse cx="88" cy="162" rx="15" ry="9"/>
          <ellipse cx="170" cy="224" rx="17" ry="10"/>
        </g>

        <!-- Clavos de forja perimetrales -->
        <g fill="#18181b">
          <circle cx="16" cy="16" r="3"/><circle cx="16" cy="78" r="3"/><circle cx="16" cy="140" r="3"/><circle cx="16" cy="202" r="3"/>
          <circle cx="${width - 16}" cy="16" r="3"/><circle cx="${width - 16}" cy="78" r="3"/><circle cx="${width - 16}" cy="140" r="3"/><circle cx="${width - 16}" cy="202" r="3"/>
        </g>
        <g fill="#71717a">
          <circle cx="15" cy="15" r="1"/><circle cx="15" cy="77" r="1"/><circle cx="15" cy="139" r="1"/><circle cx="15" cy="201" r="1"/>
          <circle cx="${width - 17}" cy="15" r="1"/><circle cx="${width - 17}" cy="77" r="1"/><circle cx="${width - 17}" cy="139" r="1"/><circle cx="${width - 17}" cy="201" r="1"/>
        </g>

        <!-- Bisel de profundidad y viñeteado perimetral -->
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#170902" stroke-width="3" opacity="0.8"/>
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
    // 1. Cuerpo de madera de la base
    this.baseWoodGeo = new THREE.BoxGeometry(CHEST_W, CHEST_H, CHEST_D);
    this.baseWoodGeo.translate(0, CHEST_H / 2, 0);

    // 2. Herrajes de hierro forjado de la base (fusionados en 1 BufferGeometry)
    // Marco inferior (plinto)
    const bRim = new THREE.BoxGeometry(CHEST_W + 0.02, 0.06, CHEST_D + 0.02)
      .translate(0, 0.03, 0);
    // Marco superior de cierre
    const tRim = new THREE.BoxGeometry(CHEST_W + 0.02, 0.03, CHEST_D + 0.02)
      .translate(0, CHEST_H - 0.015, 0);
    // 2 Bandas verticales paralelas
    const b1 = new THREE.BoxGeometry(0.07, CHEST_H + 0.01, CHEST_D + 0.02)
      .translate(-0.25, CHEST_H / 2, 0);
    const b2 = new THREE.BoxGeometry(0.07, CHEST_H + 0.01, CHEST_D + 0.02)
      .translate(0.25, CHEST_H / 2, 0);
    // 4 Esquineros en ángulo
    const c1 = new THREE.BoxGeometry(0.06, CHEST_H, 0.06)
      .translate(-CHEST_W / 2 + 0.01, CHEST_H / 2, -CHEST_D / 2 + 0.01);
    const c2 = new THREE.BoxGeometry(0.06, CHEST_H, 0.06)
      .translate(CHEST_W / 2 - 0.01, CHEST_H / 2, -CHEST_D / 2 + 0.01);
    const c3 = new THREE.BoxGeometry(0.06, CHEST_H, 0.06)
      .translate(-CHEST_W / 2 + 0.01, CHEST_H / 2, CHEST_D / 2 - 0.01);
    const c4 = new THREE.BoxGeometry(0.06, CHEST_H, 0.06)
      .translate(CHEST_W / 2 - 0.01, CHEST_H / 2, CHEST_D / 2 - 0.01);
    // Placa frontal de cerradura
    const lockPlate = new THREE.BoxGeometry(0.14, 0.16, 0.03)
      .translate(0, CHEST_H - 0.09, CHEST_D / 2 + 0.015);
    // Asas laterales de transporte (anillas forjadas)
    const hL = new THREE.TorusGeometry(0.05, 0.012, 6, 12)
      .rotateY(Math.PI / 2)
      .translate(-CHEST_W / 2 - 0.01, CHEST_H * 0.55, 0);
    const hR = new THREE.TorusGeometry(0.05, 0.012, 6, 12)
      .rotateY(Math.PI / 2)
      .translate(CHEST_W / 2 + 0.01, CHEST_H * 0.55, 0);
    const hMountL = new THREE.BoxGeometry(0.02, 0.08, 0.08)
      .translate(-CHEST_W / 2 - 0.005, CHEST_H * 0.55, 0);
    const hMountR = new THREE.BoxGeometry(0.02, 0.08, 0.08)
      .translate(CHEST_W / 2 + 0.005, CHEST_H * 0.55, 0);

    this.baseIronGeo = mergeGeometries([bRim, tRim, b1, b2, c1, c2, c3, c4, lockPlate, hL, hR, hMountL, hMountR]);
    bRim.dispose(); tRim.dispose(); b1.dispose(); b2.dispose();
    c1.dispose(); c2.dispose(); c3.dispose(); c4.dispose();
    lockPlate.dispose(); hL.dispose(); hR.dispose(); hMountL.dispose(); hMountR.dispose();

    // 3. Inserto dorado de cerradura
    this.keyholeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8);
    this.keyholeGeo.rotateX(Math.PI / 2);
    this.keyholeGeo.translate(0, CHEST_H - 0.08, CHEST_D / 2 + 0.031);

    // 4. Tapa abovedada semicilíndrica de madera
    this.lidWoodGeo = new THREE.CylinderGeometry(LID_RADIUS, LID_RADIUS, CHEST_W, 16, 1, false, -Math.PI / 2, Math.PI);
    this.lidWoodGeo.rotateZ(Math.PI / 2);
    this.lidWoodGeo.rotateX(-Math.PI / 2);
    this.lidWoodGeo.scale(1, 0.75, 1);
    this.lidWoodGeo.translate(0, 0, CHEST_D / 2);

    // 5. Herrajes de la tapa abovedada (fusionados en 1 BufferGeometry)
    // Marco inferior de la tapa
    const lidRim = new THREE.BoxGeometry(CHEST_W + 0.02, 0.03, CHEST_D + 0.02)
      .translate(0, 0.015, CHEST_D / 2);

    const makeArchBand = (x, w, extraR) => {
      const g = new THREE.CylinderGeometry(LID_RADIUS + extraR, LID_RADIUS + extraR, w, 16, 1, false, -Math.PI / 2, Math.PI);
      g.rotateZ(Math.PI / 2);
      g.rotateX(-Math.PI / 2);
      g.scale(1, 0.75, 1);
      g.translate(x, 0, CHEST_D / 2);
      return g;
    };

    // 2 Bandas arqueadas paralelas que recorren la bóveda
    const bandArc1 = makeArchBand(-0.25, 0.07, 0.012);
    const bandArc2 = makeArchBand(0.25, 0.07, 0.012);
    // Ribetes arqueados en los extremos laterales
    const endRim1 = makeArchBand(-CHEST_W / 2 + 0.015, 0.03, 0.008);
    const endRim2 = makeArchBand(CHEST_W / 2 - 0.015, 0.03, 0.008);
    // Cerrojo frontal colgante (hasp)
    const hasp = new THREE.BoxGeometry(0.08, 0.12, 0.03)
      .translate(0, -0.04, CHEST_D + 0.015);

    this.lidIronGeo = mergeGeometries([lidRim, bandArc1, bandArc2, endRim1, endRim2, hasp]);
    lidRim.dispose(); bandArc1.dispose(); bandArc2.dispose();
    endRim1.dispose(); endRim2.dispose(); hasp.dispose();

    // 6. Tesoros interiores
    // Montículo de oro
    this.goldMoundGeo = new THREE.DodecahedronGeometry(0.20, 1);
    this.goldMoundGeo.scale(1.8, 0.65, 1.2);
    this.goldMoundGeo.translate(0, CHEST_H + 0.02, 0);

    // Gemas preciosas talladas
    this.gemSapphireGeo = new THREE.DodecahedronGeometry(0.08, 0);
    this.gemSapphireGeo.translate(0.16, CHEST_H + 0.09, 0.08);

    this.gemRubyGeo = new THREE.DodecahedronGeometry(0.07, 0);
    this.gemRubyGeo.translate(-0.14, CHEST_H + 0.08, -0.06);

    this.gemEmeraldGeo = new THREE.DodecahedronGeometry(0.06, 0);
    this.gemEmeraldGeo.translate(0.02, CHEST_H + 0.11, 0.06);
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
      if (cfg.yaw) {
        chestGroup.rotation.y = cfg.yaw;
      }

      // 1. BASE DE MADERA Y FORJA (fusión a 2 draw calls)
      const baseWoodMesh = new THREE.Mesh(this.baseWoodGeo, this.woodMat);
      chestGroup.add(baseWoodMesh);

      const baseIronMesh = new THREE.Mesh(this.baseIronGeo, this.ironMat);
      chestGroup.add(baseIronMesh);

      const keyholeMesh = new THREE.Mesh(this.keyholeGeo, this.goldMat);
      chestGroup.add(keyholeMesh);

      // 2. TESORO INTERIOR
      const goldMesh = new THREE.Mesh(this.goldMoundGeo, this.goldMat);
      chestGroup.add(goldMesh);

      const sapphireMesh = new THREE.Mesh(this.gemSapphireGeo, this.gemMat);
      chestGroup.add(sapphireMesh);

      const rubyMesh = new THREE.Mesh(this.gemRubyGeo, this.rubyMat);
      chestGroup.add(rubyMesh);

      const emeraldMesh = new THREE.Mesh(this.gemEmeraldGeo, this.emeraldMat);
      chestGroup.add(emeraldMesh);

      // Luz dorada interior que se irradia al abrir el cofre
      const lootLight = new THREE.PointLight(0xfbbf24, 0, 8, 2.0);
      lootLight.position.set(0, CHEST_H + 0.15, 0);
      chestGroup.add(lootLight);

      // 3. TAPA ABOVEDADA PIVOTADA (bisagra en borde trasero superior)
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, CHEST_H, -CHEST_D / 2);

      const lidWoodMesh = new THREE.Mesh(this.lidWoodGeo, this.woodMat);
      lidPivot.add(lidWoodMesh);

      const lidIronMesh = new THREE.Mesh(this.lidIronGeo, this.ironMat);
      lidPivot.add(lidIronMesh);

      chestGroup.add(lidPivot);
      this.group.add(chestGroup);

      const lidSpring = new Spring(LID_SPRING_K, LID_SPRING_C, 0);
      lidSpring.snap(0);

      this.chests.set(chestId, {
        id: chestId,
        name: cfg.name || 'Cofre del Tesoro',
        reward: cfg.reward || 'Tesoros de la Mazmorra',
        message: cfg.message,
        x,
        y,
        z,
        isOpen: false,
        lidPivot,
        lootLight,
        chestGroup,
        lidSpring,
      });
    }
  }

  openChest(chestId = 1) {
    const chest = this.chests.get(chestId);
    if (!chest || chest.isOpen) return false;

    chest.isOpen = true;
    chest.lidSpring.set(LID_OPEN_ANGLE);
    return true;
  }

  isChestOpen(chestId = 1) {
    const chest = this.chests.get(chestId);
    return chest ? chest.isOpen : false;
  }

  update(dt = 0.016) {
    for (const chest of this.chests.values()) {
      if (chest.isOpen && (!chest.lidSpring.isSettled || chest.lidPivot.rotation.x === 0)) {
        const angle = chest.lidSpring.update(dt);
        chest.lidPivot.rotation.x = -angle;
        if (chest.lootLight) {
          // Luz normalizada acotada para evitar parpadeos con el overshoot elástico
          const t = Math.min(1.0, Math.max(0.0, angle / LID_OPEN_ANGLE));
          chest.lootLight.intensity = t * LIGHT_MAX_INTENSITY;
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
    if (this._woodTexture) {
      this._woodTexture.dispose();
      this._woodTexture = null;
    }
    this.baseWoodGeo?.dispose();
    this.baseIronGeo?.dispose();
    this.keyholeGeo?.dispose();
    this.lidWoodGeo?.dispose();
    this.lidIronGeo?.dispose();
    this.goldMoundGeo?.dispose();
    this.gemSapphireGeo?.dispose();
    this.gemRubyGeo?.dispose();
    this.gemEmeraldGeo?.dispose();

    this.woodMat?.dispose();
    this.ironMat?.dispose();
    this.goldMat?.dispose();
    this.gemMat?.dispose();
    this.rubyMat?.dispose();
    this.emeraldMat?.dispose();
  }
}
