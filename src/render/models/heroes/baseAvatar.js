// src/render/models/heroes/baseAvatar.js
import * as THREE from 'three';
import { PHYSICS_CONFIG } from '../../../config/constants.js';

export const AVATAR_H = PHYSICS_CONFIG.PLAYER_H;

/**
 * Geometrías compartidas del avatar humanoide (1.8 m, encaja en la cápsula física).
 */
export function buildSharedGeometries() {
  const head = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const torso = new THREE.BoxGeometry(0.55, 0.65, 0.32);
  // Cinto 20 mm por fuera del torso: evita caras casi-coplanares (z-fighting)
  const belt = new THREE.BoxGeometry(0.59, 0.12, 0.36);
  const arm = new THREE.BoxGeometry(0.18, 0.62, 0.2);
  arm.translate(0, -0.28, 0); // pivote en el hombro
  const leg = new THREE.BoxGeometry(0.22, 0.75, 0.24);
  leg.translate(0, -0.375, 0); // pivote en la cadera
  return { head, torso, belt, arm, leg };
}

/**
 * Materiales compartidos: piel, cara con textura procedural, pantalón y cinto.
 */
export function buildSharedMaterials() {
  if (typeof document === 'undefined') {
    return {
      skin: new THREE.MeshLambertMaterial({ color: 0xe8b98a }),
      face: new THREE.MeshLambertMaterial({ color: 0xe8b98a }),
      pants: new THREE.MeshLambertMaterial({ color: 0x334155 }),
      belt: new THREE.MeshLambertMaterial({ color: 0x27272a }),
    };
  }
  // Cara procedural 64x64: ojos y boca sobre tono piel
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8b98a';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(14, 26, 10, 12); // ojo izq
  ctx.fillRect(40, 26, 10, 12); // ojo der
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(24, 46, 16, 5);  // boca
  const faceTex = new THREE.CanvasTexture(canvas);
  faceTex.magFilter = THREE.NearestFilter;
  faceTex.colorSpace = THREE.SRGBColorSpace;
  return {
    skin: new THREE.MeshLambertMaterial({ color: 0xe8b98a }),
    face: new THREE.MeshLambertMaterial({ map: faceTex }),
    pants: new THREE.MeshLambertMaterial({ color: 0x334155 }),
    belt: new THREE.MeshLambertMaterial({ color: 0x27272a }),
  };
}

/**
 * Genera el Sprite 3D flotante con el nametag y distintivo del héroe.
 */
export function createNameSprite(name, color = '#38bdf8') {
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.38, 1);
    sprite.position.set(0, (AVATAR_H / 2) + 0.35, 0);
    return sprite;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Fondo oscuro redondeado
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  if (ctx.roundRect) {
    ctx.roundRect(8, 6, 240, 52, 14);
  } else {
    ctx.rect(8, 6, 240, 52);
  }
  ctx.fill();

  // Borde temático del héroe
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Emblema circular del color del aventurero
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(30, 32, 7, 0, Math.PI * 2);
  ctx.fill();

  // Texto con el apodo del jugador
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const displayName = (name && name.trim()) ? name.trim().slice(0, 12) : 'Aventurero';
  ctx.fillText(displayName, 46, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.5, 0.38, 1);
  sprite.position.set(0, (AVATAR_H / 2) + 0.35, 0);
  sprite.renderOrder = 999;
  return sprite;
}

/**
 * Construye la jerarquía 3D del esqueleto base humanoide y sus articulaciones.
 */
export function buildBaseAvatarMesh(color, G, M) {
  const tunicMat = new THREE.MeshLambertMaterial({ color });
  const hairMat = new THREE.MeshLambertMaterial({ color });

  const root = new THREE.Group();

  // Cabeza: piel por los lados, cara al frente (+z), pelo arriba y atrás.
  const headMesh = new THREE.Mesh(G.head, [M.skin, M.skin, hairMat, M.skin, M.face, hairMat]);
  headMesh.position.set(0, 1.6, 0);
  root.add(headMesh);

  // Torso con túnica del héroe + cinto de forja
  const torsoMesh = new THREE.Mesh(G.torso, tunicMat);
  torsoMesh.position.set(0, 1.05, 0);
  root.add(torsoMesh);
  const beltMesh = new THREE.Mesh(G.belt, M.belt);
  beltMesh.position.set(0, 0.78, 0);
  root.add(beltMesh);

  // Brazos con pivote en el hombro (y=1.32)
  const armLPivot = new THREE.Group();
  armLPivot.position.set(-0.34, 1.32, 0);
  const armL = new THREE.Mesh(G.arm, tunicMat);
  armLPivot.add(armL);
  root.add(armLPivot);

  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.34, 1.32, 0);
  const armR = new THREE.Mesh(G.arm, tunicMat);
  armRPivot.add(armR);
  root.add(armRPivot);

  // Piernas con pivote en la cadera (y=0.75)
  const legLPivot = new THREE.Group();
  legLPivot.position.set(-0.14, 0.75, 0);
  const legL = new THREE.Mesh(G.leg, M.pants);
  legLPivot.add(legL);
  root.add(legLPivot);

  const legRPivot = new THREE.Group();
  legRPivot.position.set(0.14, 0.75, 0);
  const legR = new THREE.Mesh(G.leg, M.pants);
  legRPivot.add(legR);
  root.add(legRPivot);

  root.position.set(0, 1, 0);
  root.scale.setScalar(0.9);

  return {
    root,
    mats: [tunicMat, hairMat],
    parts: { armLPivot, armRPivot, legLPivot, legRPivot, head: headMesh, torso: torsoMesh, belt: beltMesh },
  };
}
