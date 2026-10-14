// src/render/models/props/doorModel.js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const LEAF_THICKNESS = 0.12; // 12 cm de roble macizo
export const LEAF_WIDTH     = 1.00; // 2 hojas de 1.00m cubren el vano de 2.00m
export const LEAF_HEIGHT    = 1.98; // Ajustado al vano de 2 bloques de altura

/**
 * Genera proceduralmente una textura de alta resolución (256x512) para las hojas de puerta,
 * con 4 tablones verticales de roble noble, vetas longitudinales orgánicas, nudos de madera,
 * ranuras profundas y remaches de forja en escala 1:2.
 */
export function createWoodPlankTexture(width = 256, height = 512) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 0, width, height);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 64 128" shape-rendering="crispEdges">
      <!-- Fondo base de madera quemada Yakisugi en tinta profunda -->
      <rect width="64" height="128" fill="#1c1917"/>

      <!-- 4 Tablones verticales con matices ceniza y carbón de roble/cedro -->
      <rect x="1" y="1" width="14" height="126" fill="#383431"/>
      <rect x="17" y="1" width="14" height="126" fill="#44403c"/>
      <rect x="33" y="1" width="14" height="126" fill="#383431"/>
      <rect x="49" y="1" width="14" height="126" fill="#3f3b37"/>

      <!-- Dithering / Aguadas de volumen de madera envejecida (Tanboku) -->
      <g fill="#44403c" opacity="0.6">
        <rect x="2" y="14" width="12" height="28"/>
        <rect x="34" y="38" width="12" height="32"/>
        <rect x="50" y="70" width="12" height="24"/>
      </g>
      <g fill="#504b46" opacity="0.5">
        <rect x="18" y="20" width="12" height="34"/>
        <rect x="18" y="76" width="12" height="28"/>
        <rect x="34" y="80" width="12" height="26"/>
      </g>

      <!-- Ranuras profundas entre tablones con sombras y bisel de luz ceniza -->
      <line x1="16" y1="0" x2="16" y2="128" stroke="#0c0a09" stroke-width="1"/>
      <line x1="17" y1="0" x2="17" y2="128" stroke="#78716c" stroke-width="1" opacity="0.5"/>
      <line x1="32" y1="0" x2="32" y2="128" stroke="#0c0a09" stroke-width="1"/>
      <line x1="33" y1="0" x2="33" y2="128" stroke="#78716c" stroke-width="1" opacity="0.5"/>
      <line x1="48" y1="0" x2="48" y2="128" stroke="#0c0a09" stroke-width="1"/>
      <line x1="49" y1="0" x2="49" y2="128" stroke="#78716c" stroke-width="1" opacity="0.5"/>

      <!-- Vetas longitudinales de pincel seco (Kasure) en trazos escalonados -->
      <g fill="#141210">
        <!-- Tablón 1 -->
        <rect x="4" y="8" width="1" height="24"/><rect x="5" y="32" width="1" height="18"/><rect x="4" y="50" width="1" height="36"/>
        <rect x="10" y="2" width="1" height="30"/><rect x="11" y="32" width="1" height="42"/><rect x="10" y="74" width="1" height="50"/>
        <!-- Tablón 2 -->
        <rect x="21" y="4" width="1" height="40"/><rect x="22" y="44" width="1" height="32"/><rect x="21" y="76" width="1" height="48"/>
        <rect x="27" y="10" width="1" height="28"/><rect x="28" y="38" width="1" height="36"/><rect x="27" y="74" width="1" height="52"/>
        <!-- Tablón 3 -->
        <rect x="37" y="6" width="1" height="32"/><rect x="38" y="38" width="1" height="44"/><rect x="37" y="82" width="1" height="42"/>
        <rect x="43" y="2" width="1" height="46"/><rect x="44" y="48" width="1" height="38"/><rect x="43" y="86" width="1" height="40"/>
        <!-- Tablón 4 -->
        <rect x="53" y="8" width="1" height="36"/><rect x="54" y="44" width="1" height="40"/><rect x="53" y="84" width="1" height="42"/>
        <rect x="58" y="4" width="1" height="26"/><rect x="59" y="30" width="1" height="48"/><rect x="58" y="78" width="1" height="46"/>
      </g>

      <!-- Nudos de madera artesanales escalonados (Pixel Art) -->
      <g fill="#0c0a09">
        <!-- Nudo 1 (Tablón 1, y=36) -->
        <rect x="6" y="34" width="4" height="6"/><rect x="7" y="33" width="2" height="8"/>
        <!-- Nudo 2 (Tablón 2, y=98) -->
        <rect x="23" y="96" width="4" height="6"/><rect x="24" y="95" width="2" height="8"/>
        <!-- Nudo 3 (Tablón 3, y=52) -->
        <rect x="39" y="50" width="4" height="6"/><rect x="40" y="49" width="2" height="8"/>
        <!-- Nudo 4 (Tablón 4, y=104) -->
        <rect x="55" y="102" width="4" height="6"/><rect x="56" y="101" width="2" height="8"/>
      </g>
      <g fill="#292524">
        <rect x="7" y="35" width="2" height="4"/>
        <rect x="24" y="97" width="2" height="4"/>
        <rect x="40" y="51" width="2" height="4"/>
        <rect x="56" y="103" width="2" height="4"/>
      </g>

      <!-- Herrajes de forja caligráfica Kanagu (Cantoneras en las 4 esquinas) -->
      <g fill="#18181b">
        <!-- Superior izquierdo -->
        <rect x="2" y="2" width="10" height="2"/><rect x="2" y="2" width="2" height="10"/>
        <!-- Superior derecho -->
        <rect x="52" y="2" width="10" height="2"/><rect x="60" y="2" width="2" height="10"/>
        <!-- Inferior izquierdo -->
        <rect x="2" y="124" width="10" height="2"/><rect x="2" y="116" width="2" height="10"/>
        <!-- Inferior derecho -->
        <rect x="52" y="124" width="10" height="2"/><rect x="60" y="116" width="2" height="10"/>
      </g>

      <!-- Clavos de forja cuadrados y remaches con micro-brillo de 1px -->
      <g fill="#0c0a09">
        <rect x="7" y="5" width="2" height="2"/><rect x="23" y="5" width="2" height="2"/>
        <rect x="39" y="5" width="2" height="2"/><rect x="55" y="5" width="2" height="2"/>
        <rect x="7" y="121" width="2" height="2"/><rect x="23" y="121" width="2" height="2"/>
        <rect x="39" y="121" width="2" height="2"/><rect x="55" y="121" width="2" height="2"/>
      </g>
      <g fill="#71717a">
        <rect x="7" y="5" width="1" height="1"/><rect x="23" y="5" width="1" height="1"/>
        <rect x="39" y="5" width="1" height="1"/><rect x="55" y="5" width="1" height="1"/>
        <rect x="7" y="121" width="1" height="1"/><rect x="23" y="121" width="1" height="1"/>
        <rect x="39" y="121" width="1" height="1"/><rect x="55" y="121" width="1" height="1"/>
      </g>

      <!-- Sello ritual Hanko bermellón en el canto medio derecho -->
      <rect x="53" y="61" width="7" height="7" fill="#b91c1c"/>
      <rect x="54" y="62" width="5" height="5" fill="none" stroke="#f4efe4" stroke-width="1"/>
      <rect x="56" y="63" width="1" height="3" fill="#f4efe4"/>
      <rect x="55" y="64" width="3" height="1" fill="#f4efe4"/>

      <!-- Salpicaduras Haboku de 1px -->
      <g fill="#0c0a09">
        <rect x="12" y="44" width="1" height="1"/><rect x="28" y="22" width="1" height="1"/>
        <rect x="44" y="72" width="1" height="1"/><rect x="52" y="88" width="1" height="1"/>
      </g>

      <!-- Bisel perimetral de la hoja -->
      <rect x="0" y="0" width="64" height="1" fill="#78716c" opacity="0.6"/>
      <rect x="0" y="127" width="64" height="1" fill="#0c0a09"/>
      <rect x="0" y="0" width="1" height="128" fill="#78716c" opacity="0.6"/>
      <rect x="63" y="0" width="1" height="128" fill="#0c0a09"/>
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
 * Crea los materiales compartidos para las puertas.
 */
export function createDoorMaterials(woodTexture) {
  return {
    wood: new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: woodTexture,
    }),
    iron: new THREE.MeshLambertMaterial({
      color: 0x27272a,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -4.0,
    }),
    stone: new THREE.MeshLambertMaterial({
      color: 0x3f3f46,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -4.0,
    }),
    stoneAccent: new THREE.MeshLambertMaterial({
      color: 0x27272a,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -4.0,
    }),
  };
}

/**
 * Crea las geometrías de las hojas batientes y sus herrajes de forja.
 */
export function createDoorGeometries() {
  const leftWood = new THREE.BoxGeometry(LEAF_WIDTH, LEAF_HEIGHT, LEAF_THICKNESS);
  leftWood.translate(LEAF_WIDTH / 2, 0, 0);

  const rightWood = new THREE.BoxGeometry(LEAF_WIDTH, LEAF_HEIGHT, LEAF_THICKNESS);
  rightWood.translate(-LEAF_WIDTH / 2, 0, 0);

  const buildHardwareGeom = (sign) => {
    // Las bandas horizontales de refuerzo terminan a 4cm del canto batiente (LEAF_WIDTH - 0.04)
    // para que la arista/canto de la puerta sea 100% madera pura y no exista Z-fighting coplanar.
    const strapW = LEAF_WIDTH - 0.04;
    const b1 = new THREE.BoxGeometry(strapW, 0.09, LEAF_THICKNESS + 0.02)
      .translate(sign * (strapW / 2), 0.65, 0);
    const b2 = new THREE.BoxGeometry(strapW, 0.09, LEAF_THICKNESS + 0.02)
      .translate(sign * (strapW / 2), -0.65, 0);

    // Chapa de cerradura: centrada en sign * (LEAF_WIDTH - 0.08) dejando 2cm de margen respecto al canto
    const lk = new THREE.BoxGeometry(0.12, 0.22, LEAF_THICKNESS + 0.04)
      .translate(sign * (LEAF_WIDTH - 0.08), 0, 0);
    const kFront = new THREE.SphereGeometry(0.04, 8, 6)
      .translate(sign * (LEAF_WIDTH - 0.08), -0.02, (LEAF_THICKNESS / 2) + 0.03);
    const kBack = new THREE.SphereGeometry(0.04, 8, 6)
      .translate(sign * (LEAF_WIDTH - 0.08), -0.02, -(LEAF_THICKNESS / 2) - 0.03);

    // Nudillos redondeados de la bisagra en el marco lateral (x = 0)
    const knuckle1 = new THREE.CylinderGeometry(0.022, 0.022, 0.11, 8)
      .translate(0, 0.65, 0);
    const knuckle2 = new THREE.CylinderGeometry(0.022, 0.022, 0.11, 8)
      .translate(0, -0.65, 0);

    const merged = mergeGeometries([b1, b2, lk, kFront, kBack, knuckle1, knuckle2]);
    b1.dispose(); b2.dispose(); lk.dispose(); kFront.dispose(); kBack.dispose();
    knuckle1.dispose(); knuckle2.dispose();
    return merged;
  };

  return {
    leftWood,
    rightWood,
    leftIron: buildHardwareGeom(+1),
    rightIron: buildHardwareGeom(-1),
  };
}

/**
 * Ensambla una hoja de puerta (izquierda si sign=+1, derecha si sign=-1).
 */
export function buildDoorLeaf(sign, geos, mats) {
  const leafGroup = new THREE.Group();
  const woodGeo = sign > 0 ? geos.leftWood : geos.rightWood;
  const ironGeo = sign > 0 ? geos.leftIron : geos.rightIron;

  leafGroup.add(new THREE.Mesh(woodGeo, mats.wood));
  leafGroup.add(new THREE.Mesh(ironGeo, mats.iron));

  return leafGroup;
}

/**
 * Construye el marco y dintel arquitectónico de piedra y forja de la puerta.
 * @param {number} width Ancho del vano de paso (metros, usualmente 2.0)
 * @param {number} height Altura del vano de paso (metros, usualmente 2.0)
 * @param {object} mats Materiales compartidos de la puerta
 */
export function buildDoorFrame(width = 2.0, height = 2.0, mats) {
  const frameGroup = new THREE.Group();
  frameGroup.name = 'DoorFrame';

  const halfW = width / 2;
  const jambW = 0.18;
  const jambDepth = 0.36;
  const lintelH = 0.32;
  const lintelDepth = 0.40;
  // Offset sutil (8 mm) hacia el interior del vano para evitar coplanaridad absoluta con los bloques de muro voxel
  const inset = 0.008;

  // 1. Jamba izquierda (pilar vertical de sillar)
  const leftJambGeo = new THREE.BoxGeometry(jambW, height, jambDepth);
  leftJambGeo.translate(-halfW - jambW / 2 + inset, 0, 0);

  // 2. Jamba derecha (pilar vertical de sillar)
  const rightJambGeo = new THREE.BoxGeometry(jambW, height, jambDepth);
  rightJambGeo.translate(halfW + jambW / 2 - inset, 0, 0);

  // 3. Dintel superior continuo (viga de piedra sobre el vano)
  const lintelGeo = new THREE.BoxGeometry(width + 2 * jambW + 0.16, lintelH, lintelDepth);
  lintelGeo.translate(0, height / 2 + lintelH / 2 - inset, 0);

  // Combinar los sillares de piedra base
  const stoneMerged = mergeGeometries([leftJambGeo, rightJambGeo, lintelGeo]);
  leftJambGeo.dispose();
  rightJambGeo.dispose();
  lintelGeo.dispose();

  if (stoneMerged) {
    const stoneMesh = new THREE.Mesh(stoneMerged, mats.stone);
    frameGroup.add(stoneMesh);
  }

  // 4. Clave de arco central (sillar ornamental en el centro del dintel)
  const keystoneGeo = new THREE.BoxGeometry(0.24, lintelH + 0.10, lintelDepth + 0.06);
  keystoneGeo.translate(0, height / 2 + lintelH / 2 - inset, 0);
  const keystoneMesh = new THREE.Mesh(keystoneGeo, mats.stoneAccent);
  frameGroup.add(keystoneMesh);

  // 5. Escuadras de hierro forjado en las esquinas superiores del marco
  const bracketSize = 0.12;
  const b1 = new THREE.BoxGeometry(bracketSize, bracketSize, lintelDepth + 0.02)
    .translate(-halfW + bracketSize / 2 + inset, height / 2 - bracketSize / 2 - inset, 0);
  const b2 = new THREE.BoxGeometry(bracketSize, bracketSize, lintelDepth + 0.02)
    .translate(halfW - bracketSize / 2 - inset, height / 2 - bracketSize / 2 - inset, 0);
  const bracketsMerged = mergeGeometries([b1, b2]);
  b1.dispose();
  b2.dispose();

  if (bracketsMerged) {
    const bracketsMesh = new THREE.Mesh(bracketsMerged, mats.iron);
    frameGroup.add(bracketsMesh);
  }

  return frameGroup;
}
