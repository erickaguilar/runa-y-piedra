// src/render/models/props/chestModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const CHEST_W = 0.90; // Ancho (eje X)
export const CHEST_H = 0.44; // Altura total de la base (eje Y)
export const CHEST_D = 0.60; // Profundidad (eje Z)
export const LID_RADIUS = CHEST_D / 2; // Radio del arco abovedado (0.30m)
export const WALL_T = 0.05;  // Grosor de las paredes de madera del cofre
export const CAVITY_DEPTH = 0.18; // Profundidad de la cavidad interior del cofre (18 cm)

/**
 * Genera proceduralmente una textura vectorial SVG de alta definición (256x256)
 * con tablones horizontales de roble envejecido, ranuras sombreadas con biseles,
 * vetas longitudinales orgánicas, nudos de madera y clavos de hierro forjado.
 */
export function createChestWoodTexture(width = 256, height = 256) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 0, width, height);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 64" shape-rendering="crispEdges">
      <!-- Fondo base de madera quemada Yakisugi en tinta profunda -->
      <rect width="64" height="64" fill="#1c1917"/>

      <!-- 4 Tablones horizontales con matices ceniza y carbón de roble/cedro Tansu -->
      <rect x="1" y="1" width="62" height="14" fill="#383431"/>
      <rect x="1" y="17" width="62" height="14" fill="#44403c"/>
      <rect x="1" y="33" width="62" height="14" fill="#383431"/>
      <rect x="1" y="49" width="62" height="14" fill="#3f3b37"/>

      <!-- Dithering / Aguadas de volumen Tanboku en las tablas -->
      <g fill="#44403c" opacity="0.6">
        <rect x="6" y="2" width="20" height="12"/>
        <rect x="36" y="2" width="22" height="12"/>
        <rect x="10" y="34" width="24" height="12"/>
        <rect x="40" y="34" width="18" height="12"/>
      </g>
      <g fill="#504b46" opacity="0.5">
        <rect x="8" y="18" width="24" height="12"/>
        <rect x="38" y="18" width="20" height="12"/>
        <rect x="6" y="50" width="22" height="12"/>
        <rect x="34" y="50" width="24" height="12"/>
      </g>

      <!-- Ranuras profundas entre tablones con sombras y bisel de luz ceniza -->
      <line x1="0" y1="16" x2="64" y2="16" stroke="#0c0a09" stroke-width="1"/>
      <line x1="0" y1="17" x2="64" y2="17" stroke="#78716c" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="32" x2="64" y2="32" stroke="#0c0a09" stroke-width="1"/>
      <line x1="0" y1="33" x2="64" y2="33" stroke="#78716c" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="48" x2="64" y2="48" stroke="#0c0a09" stroke-width="1"/>
      <line x1="0" y1="49" x2="64" y2="49" stroke="#78716c" stroke-width="1" opacity="0.5"/>

      <!-- Vetas horizontales de pincel seco (Kasure) en trazos escalonados -->
      <g fill="#141210">
        <!-- Tablón 1 (y=1..15) -->
        <rect x="4" y="4" width="22" height="1"/><rect x="28" y="5" width="18" height="1"/><rect x="48" y="4" width="12" height="1"/>
        <rect x="8" y="9" width="26" height="1"/><rect x="36" y="10" width="20" height="1"/>
        <!-- Tablón 2 (y=17..31) -->
        <rect x="2" y="21" width="20" height="1"/><rect x="24" y="22" width="24" height="1"/><rect x="50" y="21" width="10" height="1"/>
        <rect x="6" y="26" width="28" height="1"/><rect x="36" y="27" width="22" height="1"/>
        <!-- Tablón 3 (y=33..47) -->
        <rect x="4" y="37" width="24" height="1"/><rect x="30" y="38" width="16" height="1"/><rect x="48" y="37" width="12" height="1"/>
        <rect x="8" y="42" width="22" height="1"/><rect x="32" y="43" width="26" height="1"/>
        <!-- Tablón 4 (y=49..62) -->
        <rect x="2" y="53" width="18" height="1"/><rect x="22" y="54" width="22" height="1"/><rect x="46" y="53" width="14" height="1"/>
        <rect x="6" y="58" width="26" height="1"/><rect x="34" y="59" width="24" height="1"/>
      </g>

      <!-- Nudos de madera artesanales escalonados (Pixel Art) -->
      <g fill="#0c0a09">
        <!-- Nudo 1 (Tablón 1, x=16, y=7) -->
        <rect x="14" y="6" width="6" height="4"/><rect x="15" y="5" width="4" height="6"/>
        <!-- Nudo 2 (Tablón 2, x=48, y=23) -->
        <rect x="46" y="22" width="6" height="4"/><rect x="47" y="21" width="4" height="6"/>
        <!-- Nudo 3 (Tablón 3, x=12, y=39) -->
        <rect x="10" y="38" width="6" height="4"/><rect x="11" y="37" width="4" height="6"/>
        <!-- Nudo 4 (Tablón 4, x=44, y=55) -->
        <rect x="42" y="54" width="6" height="4"/><rect x="43" y="53" width="4" height="6"/>
      </g>
      <g fill="#292524">
        <rect x="15" y="7" width="4" height="2"/>
        <rect x="47" y="23" width="4" height="2"/>
        <rect x="11" y="39" width="4" height="2"/>
        <rect x="43" y="55" width="4" height="2"/>
      </g>

      <!-- Herrajes Kanagu laterales de hierro negro forjado -->
      <g fill="#18181b">
        <rect x="1" y="1" width="4" height="62"/>
        <rect x="59" y="1" width="4" height="62"/>
      </g>
      <!-- Clavos de forja cuadrados con remaches dorados de bronce antiguo -->
      <g fill="#0c0a09">
        <rect x="2" y="4" width="2" height="2"/><rect x="2" y="20" width="2" height="2"/>
        <rect x="2" y="36" width="2" height="2"/><rect x="2" y="52" width="2" height="2"/>
        <rect x="60" y="4" width="2" height="2"/><rect x="60" y="20" width="2" height="2"/>
        <rect x="60" y="36" width="2" height="2"/><rect x="60" y="52" width="2" height="2"/>
      </g>
      <g fill="#ca8a04">
        <rect x="2" y="4" width="1" height="1"/><rect x="2" y="20" width="1" height="1"/>
        <rect x="2" y="36" width="1" height="1"/><rect x="2" y="52" width="1" height="1"/>
        <rect x="60" y="4" width="1" height="1"/><rect x="60" y="20" width="1" height="1"/>
        <rect x="60" y="36" width="1" height="1"/><rect x="60" y="52" width="1" height="1"/>
      </g>

      <!-- Sello ritual Hanko bermellón en la esquina inferior derecha -->
      <rect x="48" y="52" width="6" height="6" fill="#b91c1c"/>
      <rect x="49" y="53" width="4" height="4" fill="none" stroke="#f4efe4" stroke-width="1"/>
      <rect x="51" y="54" width="1" height="2" fill="#f4efe4"/>
      <rect x="50" y="55" width="2" height="1" fill="#f4efe4"/>

      <!-- Salpicaduras Haboku de tinta de 1px -->
      <g fill="#0c0a09">
        <rect x="26" y="10" width="1" height="1"/><rect x="34" y="26" width="1" height="1"/>
        <rect x="22" y="44" width="1" height="1"/><rect x="38" y="58" width="1" height="1"/>
      </g>

      <!-- Bisel perimetral del arcón -->
      <rect x="0" y="0" width="64" height="1" fill="#78716c" opacity="0.6"/>
      <rect x="0" y="63" width="64" height="1" fill="#0c0a09"/>
      <rect x="0" y="0" width="1" height="64" fill="#78716c" opacity="0.6"/>
      <rect x="63" y="0" width="1" height="64" fill="#0c0a09"/>
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

/**
 * Crea el conjunto de materiales compartidos para los cofres de botín.
 */
export function createChestMaterials(woodTexture) {
  return {
    wood: new THREE.MeshLambertMaterial({
      map: woodTexture,
      color: 0xffffff,
      side: THREE.DoubleSide,
    }),
    iron: new THREE.MeshLambertMaterial({ color: 0x27272a }),
    gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f }),
    gem: new THREE.MeshLambertMaterial({ color: 0x0284c7, emissive: 0x0369a1 }),
    ruby: new THREE.MeshLambertMaterial({ color: 0xdc2626, emissive: 0x991b1b }),
    emerald: new THREE.MeshLambertMaterial({ color: 0x059669, emissive: 0x065f46 }),
  };
}

/**
 * Crea y fusiona las geometrías compartidas del cofre medieval articulado.
 */
export function createChestGeometries() {
  // 1. Cuerpo de madera de la base con cavidad interior hueca
  const baseFloorH = CHEST_H - CAVITY_DEPTH; // 0.26m
  const bFloor = new THREE.BoxGeometry(CHEST_W, baseFloorH, CHEST_D).translate(0, baseFloorH / 2, 0);

  // Las paredes de madera se detienen intencionalmente a CHEST_H - 0.008
  // para que el collar de hierro superior las encapsule limpiamente sin Z-fighting coplanar.
  const wallGap = 0.008; // 8mm por debajo del borde superior
  const woodWallH = CAVITY_DEPTH - wallGap; // 0.172m
  const woodWallCenterY = baseFloorH + woodWallH / 2;

  const wFront = new THREE.BoxGeometry(CHEST_W, woodWallH, WALL_T).translate(0, woodWallCenterY, CHEST_D / 2 - WALL_T / 2);
  const wBack = new THREE.BoxGeometry(CHEST_W, woodWallH, WALL_T).translate(0, woodWallCenterY, -CHEST_D / 2 + WALL_T / 2);
  const wLeft = new THREE.BoxGeometry(WALL_T, woodWallH, CHEST_D - WALL_T * 2).translate(-CHEST_W / 2 + WALL_T / 2, woodWallCenterY, 0);
  const wRight = new THREE.BoxGeometry(WALL_T, woodWallH, CHEST_D - WALL_T * 2).translate(CHEST_W / 2 - WALL_T / 2, woodWallCenterY, 0);

  const baseWoodGeo = mergeGeometries([bFloor, wFront, wBack, wLeft, wRight]);
  bFloor.dispose(); wFront.dispose(); wBack.dispose(); wLeft.dispose(); wRight.dispose();

  // 2. Herrajes de hierro forjado de la base
  const bRim = new THREE.BoxGeometry(CHEST_W + 0.02, 0.06, CHEST_D + 0.02).translate(0, 0.03, 0);

  // Collar superior de hierro: corona la base con relieve superior (hasta CHEST_H + 0.004)
  // y cubre los cantos de madera evitando parpadeos de profundidad con la cámara.
  const tRimH = 0.026;
  const tRimCenterY = CHEST_H - 0.009;
  const rimThick = 0.056;

  const tRimF = new THREE.BoxGeometry(CHEST_W + 0.02, tRimH, rimThick).translate(0, tRimCenterY, CHEST_D / 2 - WALL_T / 2 + 0.002);
  const tRimB = new THREE.BoxGeometry(CHEST_W + 0.02, tRimH, rimThick).translate(0, tRimCenterY, -CHEST_D / 2 + WALL_T / 2 - 0.002);
  const tRimL = new THREE.BoxGeometry(rimThick, tRimH, CHEST_D - 0.04).translate(-CHEST_W / 2 + WALL_T / 2 - 0.002, tRimCenterY, 0);
  const tRimR = new THREE.BoxGeometry(rimThick, tRimH, CHEST_D - 0.04).translate(CHEST_W / 2 - WALL_T / 2 + 0.002, tRimCenterY, 0);

  // Bandas verticales de refuerzo en pared frontal (+Z) y trasera (-Z)
  // Se montan perimetralmente para no atravesar la cavidad interior del botín
  const bandW = 0.07;
  const bandThickness = 0.018; // Grosor exterior del herraje
  const bandH = CHEST_H + 0.002;

  const b1F = new THREE.BoxGeometry(bandW, bandH, bandThickness)
    .translate(-0.25, bandH / 2, CHEST_D / 2 + bandThickness / 2 - 0.004);
  const b2F = new THREE.BoxGeometry(bandW, bandH, bandThickness)
    .translate(0.25, bandH / 2, CHEST_D / 2 + bandThickness / 2 - 0.004);

  const b1B = new THREE.BoxGeometry(bandW, bandH, bandThickness)
    .translate(-0.25, bandH / 2, -CHEST_D / 2 - bandThickness / 2 + 0.004);
  const b2B = new THREE.BoxGeometry(bandW, bandH, bandThickness)
    .translate(0.25, bandH / 2, -CHEST_D / 2 - bandThickness / 2 + 0.004);

  const b1Bottom = new THREE.BoxGeometry(bandW, 0.02, CHEST_D + 0.02)
    .translate(-0.25, 0.01, 0);
  const b2Bottom = new THREE.BoxGeometry(bandW, 0.02, CHEST_D + 0.02)
    .translate(0.25, 0.01, 0);

  const cornerH = CHEST_H + 0.004;
  const c1 = new THREE.BoxGeometry(0.06, cornerH, 0.06).translate(-CHEST_W / 2 + 0.01, cornerH / 2, -CHEST_D / 2 + 0.01);
  const c2 = new THREE.BoxGeometry(0.06, cornerH, 0.06).translate(CHEST_W / 2 - 0.01, cornerH / 2, -CHEST_D / 2 + 0.01);
  const c3 = new THREE.BoxGeometry(0.06, cornerH, 0.06).translate(-CHEST_W / 2 + 0.01, cornerH / 2, CHEST_D / 2 - 0.01);
  const c4 = new THREE.BoxGeometry(0.06, cornerH, 0.06).translate(CHEST_W / 2 - 0.01, cornerH / 2, CHEST_D / 2 - 0.01);

  const lockPlate = new THREE.BoxGeometry(0.14, 0.16, 0.03).translate(0, CHEST_H - 0.09, CHEST_D / 2 + 0.015);

  const hL = new THREE.TorusGeometry(0.05, 0.012, 6, 12).rotateY(Math.PI / 2).translate(-CHEST_W / 2 - 0.01, CHEST_H * 0.55, 0);
  const hR = new THREE.TorusGeometry(0.05, 0.012, 6, 12).rotateY(Math.PI / 2).translate(CHEST_W / 2 + 0.01, CHEST_H * 0.55, 0);
  const hMountL = new THREE.BoxGeometry(0.02, 0.08, 0.08).translate(-CHEST_W / 2 - 0.005, CHEST_H * 0.55, 0);
  const hMountR = new THREE.BoxGeometry(0.02, 0.08, 0.08).translate(CHEST_W / 2 + 0.005, CHEST_H * 0.55, 0);

  const baseIronGeo = mergeGeometries([
    bRim, tRimF, tRimB, tRimL, tRimR, b1F, b2F, b1B, b2B, b1Bottom, b2Bottom, c1, c2, c3, c4, lockPlate, hL, hR, hMountL, hMountR
  ]);
  bRim.dispose(); tRimF.dispose(); tRimB.dispose(); tRimL.dispose(); tRimR.dispose();
  b1F.dispose(); b2F.dispose(); b1B.dispose(); b2B.dispose(); b1Bottom.dispose(); b2Bottom.dispose();
  c1.dispose(); c2.dispose(); c3.dispose(); c4.dispose();
  lockPlate.dispose(); hL.dispose(); hR.dispose(); hMountL.dispose(); hMountR.dispose();

  // 3. Inserto dorado de cerradura
  const keyholeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8);
  keyholeGeo.rotateX(Math.PI / 2);
  keyholeGeo.translate(0, CHEST_H - 0.08, CHEST_D / 2 + 0.031);

  // 4. Tapa abovedada semicilíndrica de madera
  const lidWoodGeo = new THREE.CylinderGeometry(LID_RADIUS, LID_RADIUS, CHEST_W, 16, 1, false, -Math.PI / 2, Math.PI);
  lidWoodGeo.rotateZ(Math.PI / 2);
  lidWoodGeo.rotateX(-Math.PI / 2);
  lidWoodGeo.scale(1, 0.75, 1);
  lidWoodGeo.translate(0, 0, CHEST_D / 2);

  // 5. Herrajes de la tapa abovedada
  const lRimF = new THREE.BoxGeometry(CHEST_W + 0.02, 0.025, 0.04).translate(0, 0.0125, CHEST_D - 0.01);
  const lRimB = new THREE.BoxGeometry(CHEST_W + 0.02, 0.025, 0.04).translate(0, 0.0125, 0.01);
  const lRimL = new THREE.BoxGeometry(0.04, 0.025, CHEST_D - 0.06).translate(-CHEST_W / 2 + 0.01, 0.0125, CHEST_D / 2);
  const lRimR = new THREE.BoxGeometry(0.04, 0.025, CHEST_D - 0.06).translate(CHEST_W / 2 - 0.01, 0.0125, CHEST_D / 2);

  const makeArchBand = (x, w, extraR) => {
    const g = new THREE.CylinderGeometry(LID_RADIUS + extraR, LID_RADIUS + extraR, w, 16, 1, true, -Math.PI / 2, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    g.scale(1, 0.75, 1);
    g.translate(x, 0, CHEST_D / 2);
    return g;
  };

  const bandArc1 = makeArchBand(-0.25, 0.07, 0.012);
  const bandArc2 = makeArchBand(0.25, 0.07, 0.012);
  const endRim1 = makeArchBand(-CHEST_W / 2 + 0.015, 0.03, 0.008);
  const endRim2 = makeArchBand(CHEST_W / 2 - 0.015, 0.03, 0.008);
  const hasp = new THREE.BoxGeometry(0.08, 0.12, 0.03).translate(0, -0.04, CHEST_D + 0.015);

  const lidIronGeo = mergeGeometries([lRimF, lRimB, lRimL, lRimR, bandArc1, bandArc2, endRim1, endRim2, hasp]);
  lRimF.dispose(); lRimB.dispose(); lRimL.dispose(); lRimR.dispose();
  bandArc1.dispose(); bandArc2.dispose(); endRim1.dispose(); endRim2.dispose(); hasp.dispose();

  // 6. Tesoros interiores
  const goldMoundGeo = new THREE.DodecahedronGeometry(0.18, 1);
  goldMoundGeo.scale(1.7, 0.7, 1.1);
  goldMoundGeo.translate(0, 0.32, 0);

  const gemSapphireGeo = new THREE.DodecahedronGeometry(0.08, 0);
  gemSapphireGeo.translate(0.15, 0.38, 0.08);

  const gemRubyGeo = new THREE.DodecahedronGeometry(0.07, 0);
  gemRubyGeo.translate(-0.14, 0.37, -0.06);

  const gemEmeraldGeo = new THREE.DodecahedronGeometry(0.06, 0);
  gemEmeraldGeo.translate(0.02, 0.40, 0.06);

  return {
    baseWoodGeo,
    baseIronGeo,
    keyholeGeo,
    lidWoodGeo,
    lidIronGeo,
    goldMoundGeo,
    gemSapphireGeo,
    gemRubyGeo,
    gemEmeraldGeo,
  };
}

/**
 * Ensambla un cofre 3D articulado completo.
 */
export function buildChestMesh(geos, mats) {
  const chestGroup = new THREE.Group();

  // 1. Base de madera y forja
  chestGroup.add(new THREE.Mesh(geos.baseWoodGeo, mats.wood));
  chestGroup.add(new THREE.Mesh(geos.baseIronGeo, mats.iron));
  chestGroup.add(new THREE.Mesh(geos.keyholeGeo, mats.gold));

  // 2. Tesoro interior
  chestGroup.add(new THREE.Mesh(geos.goldMoundGeo, mats.gold));
  chestGroup.add(new THREE.Mesh(geos.gemSapphireGeo, mats.gem));
  chestGroup.add(new THREE.Mesh(geos.gemRubyGeo, mats.ruby));
  chestGroup.add(new THREE.Mesh(geos.gemEmeraldGeo, mats.emerald));

  // Luz dorada interior
  const lootLight = new THREE.PointLight(0xfbbf24, 0, 8, 2.0);
  lootLight.position.set(0, 0.60, 0.05);
  chestGroup.add(lootLight);

  // 3. Tapa abovedada pivotada (bisagra en borde trasero superior)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, CHEST_H, -CHEST_D / 2);
  lidPivot.add(new THREE.Mesh(geos.lidWoodGeo, mats.wood));
  lidPivot.add(new THREE.Mesh(geos.lidIronGeo, mats.iron));
  chestGroup.add(lidPivot);

  return { chestGroup, lidPivot, lootLight };
}
