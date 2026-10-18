// src/heroes/portraits/texturesTorso.js
// Factorias de textura y material de las partes "torso" de los heroes Sumi-e.
// Cada parte cachea su CanvasTexture/MeshLambertMaterial para reutilizacion global.
// Extraido de src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

import * as THREE from 'three';
import { HERO_PORTRAITS } from './registry.js';

const _chestTextureCache = new Map();

const _torsoSideTextureCache = new Map();

const _torsoBackTextureCache = new Map();

const _chestMaterialCache = new Map();

const _torsoSideMaterialCache = new Map();

const _torsoBackMaterialCache = new Map();

/**
 * Genera o recupera del caché la textura CanvasTexture de Three.js para el torso / pecho del héroe.
 * Renderizado 100% síncrono píxel a píxel.
 */
export function createHeroChestTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_chestTextureCache.has(key)) {
    return _chestTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawChestToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawChestToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _chestTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material MeshLambertMaterial frontal para el torso / pecho 3D del héroe.
 */
export function createHeroChestMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_chestMaterialCache.has(heroId)) {
      return _chestMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x581c87 });
    mat.userData = { isShared: true, heroId };
    _chestMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_chestMaterialCache.has(heroId)) {
    return _chestMaterialCache.get(heroId);
  }

  const texture = createHeroChestTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _chestMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral (+X o -X) del torso del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0, flipX=false), 'L' para cara -X (índice 1, flipX=true).
 * @param {number} size
 */
export function createHeroTorsoSideTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_torsoSideTextureCache.has(key)) {
    return _torsoSideTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawTorsoSideToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawTorsoSideToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _torsoSideTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral (+X o -X) para el torso 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0), 'L' para cara -X (índice 1).
 */
export function createHeroTorsoSideMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_torsoSideMaterialCache.has(cacheKey)) {
      return _torsoSideMaterialCache.get(cacheKey);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x44403c });
    mat.userData = { isShared: true, heroId, side: normSide };
    _torsoSideMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_torsoSideMaterialCache.has(cacheKey)) {
    return _torsoSideMaterialCache.get(cacheKey);
  }

  const texture = createHeroTorsoSideTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _torsoSideMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura trasera / espalda (-Z, índice 5) del torso del héroe.
 */
export function createHeroTorsoBackTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_torsoBackTextureCache.has(key)) {
    return _torsoBackTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawTorsoBackToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawTorsoBackToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _torsoBackTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material trasero / espalda (-Z, índice 5) para el torso 3D del héroe.
 */
export function createHeroTorsoBackMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_torsoBackMaterialCache.has(heroId)) {
      return _torsoBackMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x44403c });
    mat.userData = { isShared: true, heroId };
    _torsoBackMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_torsoBackMaterialCache.has(heroId)) {
    return _torsoBackMaterialCache.get(heroId);
  }

  const texture = createHeroTorsoBackTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _torsoBackMaterialCache.set(heroId, mat);
  return mat;
}

/** Libera todas las texturas y materiales cacheados de la region "torso". */
export function disposeTorsoPortraitTextures() {
  for (const mat of _chestMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _chestMaterialCache.clear();
  for (const mat of _torsoSideMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _torsoSideMaterialCache.clear();
  for (const mat of _torsoBackMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _torsoBackMaterialCache.clear();
  for (const tex of _chestTextureCache.values()) {
    tex.dispose?.();
  }
  _chestTextureCache.clear();
  for (const tex of _torsoSideTextureCache.values()) {
    tex.dispose?.();
  }
  _torsoSideTextureCache.clear();
  for (const tex of _torsoBackTextureCache.values()) {
    tex.dispose?.();
  }
  _torsoBackTextureCache.clear();
}
