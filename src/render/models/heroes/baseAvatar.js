// src/render/models/heroes/baseAvatar.js
import * as THREE from 'three';
import { PHYSICS_CONFIG, PLAYER_HEROES } from '../../../config/constants.js';
import { heroRegistry } from '../../../heroes/HeroRegistry.js';

export const AVATAR_H = PHYSICS_CONFIG.PLAYER_H;

// ============================================================
// PROPORCIONES VOXEL CLÁSICAS (avatar de 1.80 m)
//   Piernas:  0.00 → 0.80   (0.80 m)
//   Cinturón: 0.80 → 0.88   (0.08 m)
//   Torso:    0.88 → 1.38   (0.50 m)
//   Cuello:   1.35 → 1.43   (0.08 m, solapa con torso por estética)
//   Cabeza:   1.43 → 1.83   (0.40 m)
// ============================================================

/**
 * Geometrías compartidas del avatar humanoide (1.8 m, encaja en la cápsula física).
 */
export function buildSharedGeometries() {
  const torso = new THREE.BoxGeometry(0.55, 0.50, 0.32);
  const neck = new THREE.BoxGeometry(0.18, 0.08, 0.18);
  const head = new THREE.BoxGeometry(0.40, 0.40, 0.40);
  const arm = new THREE.BoxGeometry(0.20, 0.42, 0.20);
  const hand = new THREE.BoxGeometry(0.20, 0.10, 0.20); // remate en piel
  const leg = new THREE.BoxGeometry(0.18, 0.80, 0.18);
  const belt = new THREE.BoxGeometry(0.58, 0.08, 0.34);
  const shadow = new THREE.PlaneGeometry(0.76, 0.76);
  shadow.rotateX(-Math.PI / 2);
  return { torso, neck, head, arm, hand, leg, belt, shadow };
}

/**
 * Materiales compartidos: piel, cara con textura procedural, pantalón, cinto biselado y sombra de tinta Sumi.
 */
export function buildSharedMaterials() {
  if (typeof document === 'undefined') {
    return {
      skin: new THREE.MeshLambertMaterial({ color: 0xd9b48a }),
      face: new THREE.MeshLambertMaterial({ color: 0xd9b48a }),
      pants: new THREE.MeshLambertMaterial({ color: 0x334155 }),
      belt: new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
      shadow: new THREE.MeshBasicMaterial({
        color: 0x0c0a09,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
      }),
    };
  }
  // 1. Cara procedural 64x64 con ojos nítidos, cejas y boca sobre tono piel
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Base piel durazno claro + borde sutil Sumi-e
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#d9b48a';
  ctx.fillRect(2, 2, 60, 60);
  
  // Cejas expresivas
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(14, 20, 10, 3);
  ctx.fillRect(40, 20, 10, 3);

  // Ojos (pupila oscura + brillo blanco voxel)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(14, 25, 10, 12); // ojo izq
  ctx.fillRect(40, 25, 10, 12); // ojo der
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(16, 27, 4, 4); // brillo izq
  ctx.fillRect(42, 27, 4, 4); // brillo der

  // Boca horizontal
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(24, 46, 16, 5); // boca

  const faceTex = new THREE.CanvasTexture(canvas);
  faceTex.magFilter = THREE.NearestFilter;
  faceTex.minFilter = THREE.LinearFilter;
  faceTex.generateMipmaps = false;
  faceTex.colorSpace = THREE.SRGBColorSpace;

  // 2. Cinturón procedural 32x16 con bisel de tinta Sumi y remaches
  const beltCanvas = document.createElement('canvas');
  beltCanvas.width = 32;
  beltCanvas.height = 16;
  const bCtx = beltCanvas.getContext('2d');
  bCtx.fillStyle = '#0c0a09';
  bCtx.fillRect(0, 0, 32, 16);
  bCtx.fillStyle = '#3a2a1a';
  bCtx.fillRect(1, 2, 30, 12);
  bCtx.fillStyle = '#5c3a21';
  bCtx.fillRect(2, 3, 28, 3);
  const beltTex = new THREE.CanvasTexture(beltCanvas);
  beltTex.magFilter = THREE.NearestFilter;
  beltTex.minFilter = THREE.NearestFilter;
  beltTex.generateMipmaps = false;
  beltTex.colorSpace = THREE.SRGBColorSpace;

  // 3. Sombra de contacto Sumi-e octogonal 32x32 (mancha de tinta escalonada)
  const shCanvas = document.createElement('canvas');
  shCanvas.width = 32;
  shCanvas.height = 32;
  const sCtx = shCanvas.getContext('2d');
  sCtx.clearRect?.(0, 0, 32, 32);
  // Anillo exterior de aguada suave
  sCtx.fillStyle = 'rgba(12, 10, 9, 0.22)';
  sCtx.fillRect(6, 2, 20, 28);
  sCtx.fillRect(2, 6, 28, 20);
  sCtx.fillRect(4, 4, 24, 24);
  // Núcleo intermedio de tinta
  sCtx.fillStyle = 'rgba(12, 10, 9, 0.38)';
  sCtx.fillRect(8, 5, 16, 22);
  sCtx.fillRect(5, 8, 22, 16);
  // Centro denso bajo los pies
  sCtx.fillStyle = 'rgba(12, 10, 9, 0.55)';
  sCtx.fillRect(10, 8, 12, 16);
  sCtx.fillRect(8, 10, 16, 12);

  const shadowTex = new THREE.CanvasTexture(shCanvas);
  shadowTex.magFilter = THREE.NearestFilter;
  shadowTex.minFilter = THREE.NearestFilter;
  shadowTex.generateMipmaps = false;

  return {
    skin: new THREE.MeshLambertMaterial({ color: 0xd9b48a }),
    face: new THREE.MeshLambertMaterial({ map: faceTex }),
    pants: new THREE.MeshLambertMaterial({ color: 0x334155 }),
    belt: new THREE.MeshLambertMaterial({ map: beltTex, color: 0xffffff }),
    shadow: new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
    }),
  };
}

/**
 * Genera el Sprite 3D flotante con el nametag y distintivo del héroe en estilo Sumi-e Pixel Art
 * (Tablilla octogonal de piedra basalto #181615, marco de tinta #0c0a09 y sello Hanko de clase).
 */
export function createNameSprite(name, color = '#38bdf8', heroId = null) {
  // Resolver el nombre a mostrar
  const heroDef = heroId ? heroRegistry.getHeroById(heroId) : null;
  const cleanName = (name && name.trim()) ? name.trim().slice(0, 12) : '';

  // Si el "name" coincide con el nombre de alguna clase (o está vacío),
  // es un valor por defecto. En ese caso, mostrar el nombre de la clase actual.
  const isHeroDefaultName = !cleanName ||
    PLAYER_HEROES.some(h => h.name.toLowerCase() === cleanName.toLowerCase());
  const displayName = isHeroDefaultName && heroDef
    ? heroDef.name
    : (cleanName || heroDef?.name || 'Aventurero');

  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.38, 1);
    sprite.position.set(0, 2.42, 0);
    sprite.name = displayName;
    sprite.userData = { displayName, name, heroId, color, hero: heroDef, style: 'sumie-octagonal' };
    return sprite;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect?.(0, 0, 256, 64);

  // 1. Sombra dura proyectada de tinta Sumi (offset 4px)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(14, 10, 232, 48);
  ctx.fillRect(10, 14, 240, 40);

  // 2. Marco exterior octogonal de tinta china (#0c0a09)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(10, 6, 236, 50);
  ctx.fillRect(6, 10, 244, 42);

  // 3. Bisel perimetral del color temático de la clase
  ctx.fillStyle = color;
  ctx.fillRect(12, 8, 232, 46);
  ctx.fillRect(8, 12, 240, 38);

  // 4. Losa interior de piedra basalto (#181615) con bisel superior pétreo (#292524)
  ctx.fillStyle = '#181615';
  ctx.fillRect(14, 10, 228, 42);
  ctx.fillRect(10, 14, 236, 34);
  ctx.fillStyle = '#292524';
  ctx.fillRect(14, 10, 228, 3);

  // 5. Sello Hanko cuadrado a la izquierda (marco de tinta + lacre del color del héroe + núcleo Washi)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(18, 19, 24, 24);
  ctx.fillStyle = color;
  ctx.fillRect(20, 21, 20, 20);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillRect(26, 27, 8, 8);
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(28, 29, 4, 4);

  // 6. Tipografía Papel Washi (#d6cfc2) con sombra dura de tinta (#0c0a09)
  ctx.font = 'bold 21px "Silkscreen", "Pixelify Sans", monospace, system-ui';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0c0a09';
  ctx.fillText?.(displayName, 52, 33);
  ctx.fillStyle = '#d6cfc2';
  ctx.fillText?.(displayName, 50, 31);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.5, 0.38, 1);
  sprite.position.set(0, 2.42, 0);
  sprite.renderOrder = 999;
  sprite.name = displayName;
  sprite.userData = { displayName, name, heroId, color, hero: heroDef, style: 'sumie-octagonal' };
  return sprite;
}

/**
 * Construye la jerarquía 3D del esqueleto base humanoide y sus articulaciones.
 */
export function buildBaseAvatarMesh(color, G, M) {
  const baseColor = new THREE.Color(color);
  const tunicMat = new THREE.MeshLambertMaterial({ color: baseColor });
  const sleeveMat = new THREE.MeshLambertMaterial({
    color: baseColor.clone().multiplyScalar(0.78), // 22% más oscuro
  });
  const pantsMat = new THREE.MeshLambertMaterial({
    color: baseColor.clone().multiplyScalar(0.55), // 45% más oscuro
  });

  const root = new THREE.Group();

  // ---------------- Sombra de Contacto Sumi-e (Blob Shadow) ----------------
  let shadowMesh = null;
  if (G.shadow && M.shadow) {
    shadowMesh = new THREE.Mesh(G.shadow, M.shadow);
    shadowMesh.position.set(0, 0.015, 0);
    shadowMesh.name = 'AvatarBlobShadow';
    root.add(shadowMesh);
  }

  // ---------------- Piernas ----------------
  const legLPivot = new THREE.Group();
  legLPivot.position.set(-0.15, 0.80, 0);
  const legL = new THREE.Mesh(G.leg, pantsMat);
  legL.position.set(0, -0.40, 0);
  legLPivot.add(legL);
  root.add(legLPivot);

  const legRPivot = new THREE.Group();
  legRPivot.position.set(0.15, 0.80, 0);
  const legR = new THREE.Mesh(G.leg, pantsMat);
  legR.position.set(0, -0.40, 0);
  legRPivot.add(legR);
  root.add(legRPivot);

  // ---------------- Cinturón ----------------
  const beltMesh = new THREE.Mesh(G.belt, M.belt);
  beltMesh.position.set(0, 0.84, 0);
  root.add(beltMesh);

  // ---------------- Torso ----------------
  const torsoMesh = new THREE.Mesh(G.torso, tunicMat);
  torsoMesh.position.set(0, 1.13, 0);
  root.add(torsoMesh);

  // ---------------- Cuello (cierra el gap) ----------------
  const neckMesh = new THREE.Mesh(G.neck, M.skin);
  neckMesh.position.set(0, 1.39, 0);
  root.add(neckMesh);

  // ---------------- Cabeza ----------------
  // [0: +X der, 1: -X izq, 2: +Y arriba, 3: -Y abajo, 4: +Z frente (cara), 5: -Z nuca]
  // Todas las caras laterales/superior/nuca usan M.skin. Solo el frente (+Z) lleva M.face.
  const headMats = [
    M.skin, // +X derecha
    M.skin, // -X izquierda
    M.skin, // +Y superior
    M.skin, // -Y base
    M.face, // +Z frente (ojos y boca)
    M.skin, // -Z nuca (piel, sin teñir de azul)
  ];
  const headMesh = new THREE.Mesh(G.head, headMats);
  headMesh.position.set(0, 1.63, 0);
  root.add(headMesh);

  // ---------------- Brazos (anchura voxel 0.20 m) ----------------
  // Pivotes en el hombro real (x = ±0.30, y = 1.33)
  const armLPivot = new THREE.Group();
  armLPivot.position.set(-0.30, 1.33, 0);
  const sleeveL = new THREE.Mesh(G.arm, sleeveMat);
  sleeveL.position.set(0, -0.21, 0);
  const handL = new THREE.Mesh(G.hand, M.skin);
  handL.position.set(0, -0.47, 0);
  armLPivot.add(sleeveL, handL);
  root.add(armLPivot);

  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.30, 1.33, 0);
  const sleeveR = new THREE.Mesh(G.arm, sleeveMat);
  sleeveR.position.set(0, -0.21, 0);
  const handR = new THREE.Mesh(G.hand, M.skin);
  handR.position.set(0, -0.47, 0);
  armRPivot.add(sleeveR, handR);
  root.add(armRPivot);

  root.position.set(0, 1, 0);
  root.scale.setScalar(0.9);

  return {
    root,
    mats: [tunicMat, sleeveMat, pantsMat],
    parts: {
      armLPivot,
      armRPivot,
      armL: sleeveL,
      armR: sleeveR,
      handL,
      handR,
      legLPivot,
      legRPivot,
      head: headMesh,
      torso: torsoMesh,
      belt: beltMesh,
      neck: neckMesh,
      shadow: shadowMesh,
    },
  };
}
