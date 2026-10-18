// src/heroes/portraits/texturesHead.js
// Factorias de textura y material de las partes "head" de los heroes Sumi-e.
// Cada parte cachea su CanvasTexture/MeshLambertMaterial para reutilizacion global.
// Extraido de src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

import * as THREE from 'three';
import { HERO_PORTRAITS } from './registry.js';

// Caché Singleton de texturas CanvasTexture por héroe y resolución (reutilización global)
const _faceTextureCache = new Map();

const _headSideTextureCache = new Map();

const _headBackTextureCache = new Map();

// Caché Singleton de materiales MeshLambertMaterial por héroe (reutilización global)
const _faceMaterialCache = new Map();

const _headSideMaterialCache = new Map();

const _headBackMaterialCache = new Map();

/**
 * Genera o recupera del caché la textura CanvasTexture de Three.js para la cara del héroe.
 * Renderizado 100% síncrono píxel a píxel: cero parseo de XML/SVG, cero GC y 60 FPS estables.
 */
export function createHeroFaceTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_faceTextureCache.has(key)) {
    return _faceTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _faceTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material MeshLambertMaterial frontal para la cabeza 3D del héroe.
 */
export function createHeroFaceMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_faceMaterialCache.has(heroId)) {
      return _faceMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0xd6cfc2 });
    mat.userData = { isShared: true, heroId };
    _faceMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_faceMaterialCache.has(heroId)) {
    return _faceMaterialCache.get(heroId);
  }

  const texture = createHeroFaceTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _faceMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral (+X o -X) de la cabeza del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0, flipX=false), 'L' para cara -X (índice 1, flipX=true).
 * @param {number} size
 */
export function createHeroHeadSideTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_headSideTextureCache.has(key)) {
    return _headSideTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawSideToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawSideToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _headSideTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral (+X o -X) para la cabeza 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para cara +X (índice 0), 'L' para cara -X (índice 1).
 */
export function createHeroHeadSideMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_headSideMaterialCache.has(cacheKey)) {
      return _headSideMaterialCache.get(cacheKey);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0xd6cfc2 });
    mat.userData = { isShared: true, heroId, side: normSide };
    _headSideMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_headSideMaterialCache.has(cacheKey)) {
    return _headSideMaterialCache.get(cacheKey);
  }

  const texture = createHeroHeadSideTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _headSideMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura trasera / nuca (-Z, índice 5) de la cabeza del héroe.
 */
export function createHeroHeadBackTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_headBackTextureCache.has(key)) {
    return _headBackTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawBackToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawBackToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _headBackTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material trasero / nuca (-Z, índice 5) para la cabeza 3D del héroe.
 */
export function createHeroHeadBackMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_headBackMaterialCache.has(heroId)) {
      return _headBackMaterialCache.get(heroId);
    }
    const mat = new THREE.MeshLambertMaterial({ color: 0x44403c });
    mat.userData = { isShared: true, heroId };
    _headBackMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_headBackMaterialCache.has(heroId)) {
    return _headBackMaterialCache.get(heroId);
  }

  const texture = createHeroHeadBackTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _headBackMaterialCache.set(heroId, mat);
  return mat;
}

/** Libera todas las texturas y materiales cacheados de la region "head". */
export function disposeHeadPortraitTextures() {
  for (const mat of _faceMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _faceMaterialCache.clear();
  for (const mat of _headSideMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _headSideMaterialCache.clear();
  for (const mat of _headBackMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _headBackMaterialCache.clear();
  for (const tex of _faceTextureCache.values()) {
    tex.dispose?.();
  }
  _faceTextureCache.clear();
  for (const tex of _headSideTextureCache.values()) {
    tex.dispose?.();
  }
  _headSideTextureCache.clear();
  for (const tex of _headBackTextureCache.values()) {
    tex.dispose?.();
  }
  _headBackTextureCache.clear();
}
