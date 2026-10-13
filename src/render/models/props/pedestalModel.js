// src/render/models/props/pedestalModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const IDLE_LIGHT = 1.4;
export const BLESSED_LIGHT = 2.6;
export const FLASH_LIGHT = 7.0;
export const PARTICLE_COUNT = 36;

export const THEMES = {
  classic: { light: 0xfbbf24, rune: 0xfde68a, crystal: 0xf59e0b, ember: 0xfcd34d },
  inferno: { light: 0xfb9235, rune: 0xfdba74, crystal: 0xea580c, ember: 0xf97316 },
  abyss: { light: 0xa78bfa, rune: 0xddd6fe, crystal: 0x7c3aed, ember: 0x8b5cf6 },
  cartography: { light: 0x38bdf8, rune: 0xbae6fd, crystal: 0x0284c7, ember: 0x38bdf8 },
  merchant: { light: 0x10b981, rune: 0xa7f3d0, crystal: 0x059669, ember: 0x34d399 },
};

/**
 * Crea los materiales para el pedestal y orbe místico según el tema de la mazmorra.
 */
export function createPedestalMaterials(themeName = 'classic') {
  const t = THEMES[themeName] || THEMES.classic;

  let stoneColor = 0x475569;
  let stoneDarkColor = 0x1e293b;
  let accentColor = 0xf59e0b; // Dorado por defecto
  let emissiveAccent = 0x78350f;

  if (themeName === 'abyss' || themeName === 'shadow') {
    stoneColor = 0x334155; // Pizarra oscura abisal
    stoneDarkColor = 0x0f172a; // Obsidiana profunda
    accentColor = 0x8b5cf6; // Amatista espectral
    emissiveAccent = 0x4c1d95;
  } else if (themeName === 'merchant') {
    stoneColor = 0x52525b; // Cantería de bazar
    stoneDarkColor = 0x27272a; // Basalto de tienda
    accentColor = 0x10b981; // Malaquita / Jade comercial
    emissiveAccent = 0x064e3b;
  } else if (themeName === 'inferno') {
    stoneColor = 0x442c2c;
    stoneDarkColor = 0x1a0b0b;
    accentColor = 0xf97316;
    emissiveAccent = 0x7c2d12;
  }

  return {
    theme: themeName,
    stone: new THREE.MeshLambertMaterial({ color: stoneColor }),
    stoneDark: new THREE.MeshLambertMaterial({ color: stoneDarkColor }),
    iron: new THREE.MeshLambertMaterial({ color: 0x27272a }), // Forja reforzada
    gold: new THREE.MeshLambertMaterial({ color: accentColor, emissive: emissiveAccent }),
    rune: new THREE.MeshBasicMaterial({ color: t.rune, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    crystal: new THREE.MeshLambertMaterial({
      color: 0xffffff, emissive: t.crystal, emissiveIntensity: 0.92, transparent: true, opacity: 0.96,
    }),
    ember: new THREE.PointsMaterial({
      color: t.ember, size: 0.055, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }),
  };
}

/**
 * Crea las geometrías de cantería, collar, runas y elementos centrales según el tipo/tema del pedestal.
 * Cada tipo posee una arquitectura y propósito visual único:
 * - 'classic': Altar sagrado con monolito biselado, cornisa dorada, 4 arbotantes en esquina y gema octaédrica.
 * - 'abyss': Trono ceremonial oscuro con aguja hexagonal, 4 monolitos colmillares que canalizan el vacío y octaedro alargado con halo orbital oblicuo.
 * - 'merchant': Mostrador de cambio de bazar con pedestal octogonal, platillo de ofrendas con balanza/copón y gema icosaédrica (diamante esmeralda).
 */
export function createPedestalGeometries(themeName = 'classic') {
  if (themeName === 'abyss' || themeName === 'shadow') {
    return _createAbyssPedestalGeometries();
  }
  if (themeName === 'merchant') {
    return _createMerchantPedestalGeometries();
  }
  return _createClassicPedestalGeometries();
}

/** Geometrías para el Altar Clásico del Santuario */
function _createClassicPedestalGeometries() {
  // Zócalo escalonado de cantería (2 peldaños robustos)
  const plinth1 = new THREE.BoxGeometry(1.0, 0.18, 1.0).translate(0, 0.09, 0);
  const plinth2 = new THREE.BoxGeometry(0.82, 0.16, 0.82).translate(0, 0.26, 0);
  const stoneBase = mergeGeometries([plinth1, plinth2]);
  plinth1.dispose(); plinth2.dispose();

  // Fuste monolítico de 4 caras con arbotantes en las 4 esquinas
  const colCore = new THREE.CylinderGeometry(0.30, 0.38, 0.86, 4, 1);
  colCore.rotateY(Math.PI / 4);
  colCore.translate(0, 0.77, 0);

  // 4 contrafuertes angulares de refuerzo sacro
  const b1 = new THREE.BoxGeometry(0.12, 0.50, 0.12).translate(0.32, 0.59, 0.32);
  const b2 = new THREE.BoxGeometry(0.12, 0.50, 0.12).translate(-0.32, 0.59, 0.32);
  const b3 = new THREE.BoxGeometry(0.12, 0.50, 0.12).translate(0.32, 0.59, -0.32);
  const b4 = new THREE.BoxGeometry(0.12, 0.50, 0.12).translate(-0.32, 0.59, -0.32);
  const column = mergeGeometries([colCore, b1, b2, b3, b4]);
  colCore.dispose(); b1.dispose(); b2.dispose(); b3.dispose(); b4.dispose();

  // Collar de forja + losa de coronación + filete dorado
  const collar = new THREE.BoxGeometry(0.64, 0.10, 0.64).translate(0, 1.25, 0);
  const cap = new THREE.BoxGeometry(0.80, 0.12, 0.80).translate(0, 1.36, 0);

  // Cornisa y ribete perimetral dorado
  const trimN = new THREE.BoxGeometry(0.82, 0.035, 0.05).translate(0, 1.425, 0.385);
  const trimS = new THREE.BoxGeometry(0.82, 0.035, 0.05).translate(0, 1.425, -0.385);
  const trimE = new THREE.BoxGeometry(0.05, 0.035, 0.82).translate(0.385, 1.425, 0);
  const trimW = new THREE.BoxGeometry(0.05, 0.035, 0.82).translate(-0.385, 1.425, 0);
  const goldTrim = mergeGeometries([trimN, trimS, trimE, trimW]);
  trimN.dispose(); trimS.dispose(); trimE.dispose(); trimW.dispose();

  // Runa solar: disco sagrado central + anillo orbital concéntrico
  const runeDisc = new THREE.CircleGeometry(0.24, 24);
  runeDisc.rotateX(-Math.PI / 2);
  runeDisc.translate(0, 1.445, 0);

  const runeRing = new THREE.RingGeometry(0.28, 0.34, 24);
  runeRing.rotateX(-Math.PI / 2);
  runeRing.translate(0, 1.445, 0);

  // 1. Reliquia del Capítulo 1: Cáliz Sagrado de los Primeros Reyes (Cáliz 3D en forja de oro)
  // Base / pie acampanado del cáliz
  const chaliceFoot = new THREE.CylinderGeometry(0.045, 0.11, 0.035, 16).translate(0, -0.12, 0);
  // Tallo y nudo central cincelado
  const chaliceStem = new THREE.CylinderGeometry(0.022, 0.026, 0.10, 12).translate(0, -0.05, 0);
  const chaliceNode = new THREE.SphereGeometry(0.036, 12, 10).translate(0, -0.05, 0);
  // Copa del cáliz (cuerpo cónico suave + reborde circular)
  const chaliceCup = new THREE.CylinderGeometry(0.125, 0.04, 0.14, 16).translate(0, 0.07, 0);
  const chaliceRim = new THREE.TorusGeometry(0.125, 0.012, 6, 20);
  chaliceRim.rotateX(Math.PI / 2);
  chaliceRim.translate(0, 0.14, 0);

  const chaliceGeo = mergeGeometries([chaliceFoot, chaliceStem, chaliceNode, chaliceCup, chaliceRim]);
  chaliceFoot.dispose(); chaliceStem.dispose(); chaliceNode.dispose();
  chaliceCup.dispose(); chaliceRim.dispose();

  // 2. Esencia solar sagrada: pequeña lágrima / gema sagrada flotando en la boca del cáliz
  const solarRelic = new THREE.OctahedronGeometry(0.045, 0).translate(0, 0.13, 0);

  return {
    variant: 'classic',
    stoneBase,
    column,
    collar,
    cap,
    goldTrim,
    runeDisc,
    runeRing,
    crystal: chaliceGeo,
    accessory: solarRelic,
  };
}

/** Geometrías para el Altar Abisal / Trono del Vacío */
function _createAbyssPedestalGeometries() {
  // 1. Base escalonada hexagonal de piedra oscura
  const step1 = new THREE.CylinderGeometry(0.66, 0.72, 0.16, 6).translate(0, 0.08, 0);
  const step2 = new THREE.CylinderGeometry(0.54, 0.60, 0.16, 6).translate(0, 0.24, 0);
  const stoneBase = mergeGeometries([step1, step2]);
  step1.dispose(); step2.dispose();

  // 2. Fuste hexagonal estilizado con anillo de forja central
  const colHex = new THREE.CylinderGeometry(0.34, 0.44, 0.88, 6).translate(0, 0.76, 0);
  const midRing = new THREE.CylinderGeometry(0.40, 0.40, 0.08, 6).translate(0, 0.76, 0);

  // 4 garras / colmillos ceremoniales perimetrales en las esquinas de la losa superior
  const talonGeos = [];
  const talonRadius = 0.46;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const sx = Math.cos(angle) * talonRadius;
    const sz = Math.sin(angle) * talonRadius;
    const tBase = new THREE.CylinderGeometry(0.045, 0.055, 0.08, 4).translate(sx, 1.40, sz);
    const tHorn = new THREE.ConeGeometry(0.04, 0.26, 4).translate(sx, 1.57, sz);
    talonGeos.push(tBase, tHorn);
  }
  const column = mergeGeometries([colHex, midRing, ...talonGeos]);
  colHex.dispose(); midRing.dispose();
  for (const t of talonGeos) t.dispose();

  // 3. Collar de forja oscura y losa de coronación hexagonal
  const collar = new THREE.CylinderGeometry(0.44, 0.46, 0.10, 6).translate(0, 1.25, 0);
  const cap = new THREE.CylinderGeometry(0.50, 0.44, 0.12, 6).translate(0, 1.36, 0);

  // Ribete de runas amatistas en los bordes
  const rim = new THREE.TorusGeometry(0.48, 0.024, 4, 6);
  rim.rotateX(Math.PI / 2);
  rim.translate(0, 1.425, 0);
  const goldTrim = rim;

  // 4. Runa abisal: sello de vacío de 6 puntas
  const runeDisc = new THREE.CircleGeometry(0.24, 6);
  runeDisc.rotateX(-Math.PI / 2);
  runeDisc.translate(0, 1.445, 0);

  const runeRing = new THREE.RingGeometry(0.28, 0.36, 6);
  runeRing.rotateX(-Math.PI / 2);
  runeRing.translate(0, 1.445, 0);

  // 5. Reliquia del Capítulo 2: Ojo del Vacío Amatista 3D (Completo en 360°)
  const eyeSphere = new THREE.SphereGeometry(0.10, 20, 16);
  const eyelidTop = new THREE.TorusGeometry(0.102, 0.015, 6, 16, Math.PI);
  eyelidTop.rotateX(Math.PI * 0.15).translate(0, 0.02, 0);
  const eyelidBottom = new THREE.TorusGeometry(0.102, 0.015, 6, 16, Math.PI);
  eyelidBottom.rotateX(Math.PI * 1.15).translate(0, -0.02, 0);

  const pupilFront = new THREE.BoxGeometry(0.022, 0.11, 0.03).translate(0, 0, 0.092);
  const pupilBack = new THREE.BoxGeometry(0.022, 0.11, 0.03).translate(0, 0, -0.092);

  const voidEyeCore = mergeGeometries([eyeSphere, eyelidTop, eyelidBottom, pupilFront, pupilBack]);
  eyeSphere.dispose(); eyelidTop.dispose(); eyelidBottom.dispose();
  pupilFront.dispose(); pupilBack.dispose();

  // 6. Corona de las Sombras 3D: anillo celestial cerrado con 6 puntas astrales (sin cortes)
  const crownGeos = [];
  const baseRing = new THREE.TorusGeometry(0.21, 0.014, 8, 32);
  baseRing.rotateX(Math.PI / 2);
  crownGeos.push(baseRing);

  for (let k = 0; k < 6; k++) {
    const angle = (k * Math.PI) / 3;
    const px = Math.cos(angle) * 0.21;
    const pz = Math.sin(angle) * 0.21;
    const spike = new THREE.ConeGeometry(0.026, 0.10, 4);
    spike.translate(px, 0.05, pz);
    crownGeos.push(spike);
  }

  const voidCrownGeo = mergeGeometries(crownGeos);
  for (const g of crownGeos) g.dispose();

  return {
    variant: 'abyss',
    stoneBase,
    column,
    collar,
    cap,
    goldTrim,
    runeDisc,
    runeRing,
    crystal: voidEyeCore,
    accessory: voidCrownGeo,
  };
}

/** Geometrías para el Pedestal del Mercader / Bazar Rúnico */
function _createMerchantPedestalGeometries() {
  // Zócalo ancho octogonal de cantería pulida
  const step1 = new THREE.CylinderGeometry(0.66, 0.72, 0.15, 8).translate(0, 0.075, 0);
  const step2 = new THREE.CylinderGeometry(0.56, 0.62, 0.15, 8).translate(0, 0.225, 0);
  const stoneBase = mergeGeometries([step1, step2]);
  step1.dispose(); step2.dispose();

  // Fuste estriado octogonal con anillo de cambio central
  const colOct = new THREE.CylinderGeometry(0.36, 0.40, 0.86, 8).translate(0, 0.75, 0);
  const colRing = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8).translate(0, 0.75, 0);
  const column = mergeGeometries([colOct, colRing]);
  colOct.dispose(); colRing.dispose();

  // Collar de forja reforzada y mesa/mostrador circular superior
  const collar = new THREE.CylinderGeometry(0.48, 0.44, 0.10, 8).translate(0, 1.24, 0);
  const cap = new THREE.CylinderGeometry(0.55, 0.48, 0.12, 12).translate(0, 1.35, 0);

  // Cuenco/platillo de ofrendas doradas tallado en el mostrador
  const bowlOuter = new THREE.CylinderGeometry(0.44, 0.36, 0.06, 16).translate(0, 1.44, 0);
  const coinDish = new THREE.TorusGeometry(0.40, 0.025, 6, 16);
  coinDish.rotateX(Math.PI / 2);
  coinDish.translate(0, 1.47, 0);
  const goldTrim = mergeGeometries([bowlOuter, coinDish]);
  bowlOuter.dispose(); coinDish.dispose();

  // Runa comercial de prosperidad: círculo esmeralda con octagrama
  const runeDisc = new THREE.CircleGeometry(0.24, 16);
  runeDisc.rotateX(-Math.PI / 2);
  runeDisc.translate(0, 1.485, 0);

  const runeRing = new THREE.RingGeometry(0.27, 0.35, 8);
  runeRing.rotateX(-Math.PI / 2);
  runeRing.translate(0, 1.485, 0);

  // 1. Mástil y fulcro central de la balanza
  const mast = new THREE.CylinderGeometry(0.018, 0.024, 0.34, 12);
  const fulcrumCap = new THREE.SphereGeometry(0.034, 12, 12).translate(0, 0.17, 0);
  const mastGeo = mergeGeometries([mast, fulcrumCap]);
  mast.dispose(); fulcrumCap.dispose();

  // 2. Travesaño / Brazo basculante horizontal de la balanza
  const beamBar = new THREE.CylinderGeometry(0.012, 0.012, 0.38, 8);
  beamBar.rotateZ(Math.PI / 2);
  beamBar.translate(0, 0.155, 0);
  const beamPivot = new THREE.TorusGeometry(0.025, 0.008, 6, 12).translate(0, 0.155, 0);
  const beamGeo = mergeGeometries([beamBar, beamPivot]);
  beamBar.dispose(); beamPivot.dispose();

  // 3. Platillos de pesaje (izquierdo y derecho) + tirantes/cadenas
  const panLeftDish = new THREE.CylinderGeometry(0.065, 0.035, 0.02, 16).translate(-0.16, 0.04, 0);
  const chainL1 = new THREE.CylinderGeometry(0.004, 0.004, 0.115, 4);
  chainL1.rotateZ(0.18);
  chainL1.translate(-0.16, 0.095, 0.03);
  const chainL2 = new THREE.CylinderGeometry(0.004, 0.004, 0.115, 4);
  chainL2.rotateZ(0.18);
  chainL2.translate(-0.16, 0.095, -0.03);

  const panRightDish = new THREE.CylinderGeometry(0.065, 0.035, 0.02, 16).translate(0.16, 0.04, 0);
  const chainR1 = new THREE.CylinderGeometry(0.004, 0.004, 0.115, 4);
  chainR1.rotateZ(-0.18);
  chainR1.translate(0.16, 0.095, 0.03);
  const chainR2 = new THREE.CylinderGeometry(0.004, 0.004, 0.115, 4);
  chainR2.rotateZ(-0.18);
  chainR2.translate(0.16, 0.095, -0.03);

  // Balanza completa de cantería y forja dorada
  const scalesGeo = mergeGeometries([
    mastGeo,
    beamGeo,
    panLeftDish, chainL1, chainL2,
    panRightDish, chainR1, chainR2,
  ]);
  mastGeo.dispose(); beamGeo.dispose();
  panLeftDish.dispose(); chainL1.dispose(); chainL2.dispose();
  panRightDish.dispose(); chainR1.dispose(); chainR2.dispose();

  // Peso / Gema de tasación: pequeña esmeralda facetada en el platillo izquierdo
  const gemWeight = new THREE.OctahedronGeometry(0.035, 0).translate(-0.16, 0.065, 0);

  // La balanza reemplaza la figura geométrica
  const crystal = scalesGeo;

  // El accesorio opcional es la pequeña gema esmeralda de tasación o aro
  const accessory = gemWeight;

  return {
    variant: 'merchant',
    stoneBase,
    column,
    collar,
    cap,
    goldTrim,
    runeDisc,
    runeRing,
    crystal,
    scalesGeo,
    accessory,
  };
}

/**
 * Ensambla el modelo completo del altar o pedestal con su geometría y materiales temáticos.
 */
export function buildPedestalMesh(geos, mats) {
  const root = new THREE.Group();

  const baseMesh = new THREE.Mesh(geos.stoneBase, mats.stoneDark);
  const columnMesh = new THREE.Mesh(geos.column, mats.stone);
  const collarMesh = new THREE.Mesh(geos.collar, mats.iron);
  const capMesh = new THREE.Mesh(geos.cap, mats.stone);
  const trimMesh = new THREE.Mesh(geos.goldTrim, mats.gold);
  root.add(baseMesh, columnMesh, collarMesh, capMesh, trimMesh);

  // Runa giratoria sobre la losa
  const runePivot = new THREE.Group();
  runePivot.position.set(0, 0, 0);
  const runeMesh = new THREE.Mesh(geos.runeDisc, mats.rune);
  const ringMesh = new THREE.Mesh(geos.runeRing, mats.gold);
  runePivot.add(runeMesh, ringMesh);
  root.add(runePivot);

  // Cota de altura compartida: las figuras geométricas y sus aros coinciden en el mismo centro
  const baseY = geos.variant === 'merchant' ? 1.68 : 1.66;

  // Figura central flotante y reliquia temática según el capítulo:
  // - classic: Cáliz de Oro (mats.gold) con Esencia Solar Sagrada (mats.crystal)
  // - abyss: Ojo del Vacío Amatista (mats.crystal) custodiado por Corona de Sombras (mats.gold)
  // - merchant: Balanza de Comercio (mats.gold) con Gema Esmeralda de Pesaje (mats.crystal)
  let centerMat = mats.crystal;
  let accMat = mats.gold;

  if (geos.variant === 'classic') {
    centerMat = mats.gold;
    accMat = mats.crystal;
  } else if (geos.variant === 'merchant') {
    centerMat = mats.gold;
    accMat = mats.crystal;
  } else if (geos.variant === 'abyss') {
    centerMat = mats.crystal;
    accMat = mats.gold;
  }

  const crystalMesh = new THREE.Mesh(geos.crystal, centerMat);
  crystalMesh.position.set(0, baseY, 0);
  root.add(crystalMesh);

  // Accesorio temático opcional
  let accessoryMesh = null;
  if (geos.accessory) {
    accessoryMesh = new THREE.Mesh(geos.accessory, accMat);
    accessoryMesh.position.set(0, baseY, 0);
    root.add(accessoryMesh);
  }

  // Luz cálida o mística del altar
  const light = new THREE.PointLight(mats.rune.color, IDLE_LIGHT, 8.5, 2.0);
  light.position.set(0, 1.75, 0);
  root.add(light);

  // Brasas ascendentes
  const emberPos = new Float32Array(PARTICLE_COUNT * 3);
  const emberSpeed = new Float32Array(PARTICLE_COUNT);
  for (let k = 0; k < PARTICLE_COUNT; k++) {
    const r = 0.12 + Math.random() * 0.35;
    const a = Math.random() * Math.PI * 2;
    emberPos[k * 3] = Math.cos(a) * r;
    emberPos[k * 3 + 1] = 0.2 + Math.random() * 1.7;
    emberPos[k * 3 + 2] = Math.sin(a) * r;
    emberSpeed[k] = 0.22 + Math.random() * 0.30;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, mats.ember);
  root.add(embers);

  return {
    root,
    runePivot,
    runeMesh,
    ringMesh,
    crystalMesh,
    accessoryMesh,
    light,
    embers,
    emberPos,
    emberSpeed,
  };
}
