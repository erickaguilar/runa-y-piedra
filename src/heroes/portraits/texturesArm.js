// src/heroes/portraits/texturesArm.js
// Factorias de textura y material de las partes "arm" de los heroes Sumi-e.
// Cada parte cachea su CanvasTexture/MeshLambertMaterial para reutilizacion global.
// Extraido de src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

import * as THREE from 'three';
import { HERO_PORTRAITS } from './registry.js';

const _armFrontTextureCache = new Map();

const _armSideTextureCache = new Map();

const _armInnerTextureCache = new Map();

const _armBackTextureCache = new Map();

const _armFrontMaterialCache = new Map();

const _armSideMaterialCache = new Map();

const _armInnerMaterialCache = new Map();

const _armBackMaterialCache = new Map();

/**
 * Genera o recupera del caché la textura frontal (+Z, índice 4) del brazo del héroe.
 */
export function createHeroArmFrontTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_armFrontTextureCache.has(key)) {
    return _armFrontTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawArmFrontToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawArmFrontToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _armFrontTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material frontal (+Z, índice 4) para el brazo 3D del héroe.
 */
export function createHeroArmFrontMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_armFrontMaterialCache.has(heroId)) {
      return _armFrontMaterialCache.get(heroId);
    }
    const color = heroId === 'wizard' ? 0x581c87 : (heroId === 'ranger' ? 0x166534 : (heroId === 'paladin' ? 0x71717a : (heroId === 'adventurer' ? 0x0369a1 : 0x5a3a18)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId };
    _armFrontMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_armFrontMaterialCache.has(heroId)) {
    return _armFrontMaterialCache.get(heroId);
  }

  const texture = createHeroArmFrontTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _armFrontMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral exterior del brazo del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para brazo derecho (cara +X, flipX=false), 'L' para brazo izquierdo (cara -X, flipX=true).
 * @param {number} size
 */
export function createHeroArmSideTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_armSideTextureCache.has(key)) {
    return _armSideTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawArmSideToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawArmSideToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _armSideTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral exterior para el brazo 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side
 */
export function createHeroArmSideMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_armSideMaterialCache.has(cacheKey)) {
      return _armSideMaterialCache.get(cacheKey);
    }
    const color = heroId === 'wizard' ? 0x6b21a8 : (heroId === 'ranger' ? 0x14532d : (heroId === 'paladin' ? 0x52525b : (heroId === 'adventurer' ? 0x0c4a6e : 0x78350f)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId, side: normSide };
    _armSideMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_armSideMaterialCache.has(cacheKey)) {
    return _armSideMaterialCache.get(cacheKey);
  }

  const texture = createHeroArmSideTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _armSideMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral interior del brazo del héroe (orientada hacia el torso).
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para brazo derecho (cara -X, flipX=false), 'L' para brazo izquierdo (cara +X, flipX=true).
 * @param {number} size
 */
export function createHeroArmInnerTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_armInnerTextureCache.has(key)) {
    return _armInnerTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawArmInnerToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawArmInnerToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _armInnerTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral interior para el brazo 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side
 */
export function createHeroArmInnerMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_armInnerMaterialCache.has(cacheKey)) {
      return _armInnerMaterialCache.get(cacheKey);
    }
    const color = heroId === 'wizard' ? 0x2e1065 : (heroId === 'ranger' ? 0x052e16 : (heroId === 'paladin' ? 0x27272a : (heroId === 'adventurer' ? 0x082f49 : 0x292524)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId, side: normSide };
    _armInnerMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_armInnerMaterialCache.has(cacheKey)) {
    return _armInnerMaterialCache.get(cacheKey);
  }

  const texture = createHeroArmInnerTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _armInnerMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura trasera (-Z, índice 5) del brazo del héroe (tríceps y codo).
 */
export function createHeroArmBackTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_armBackTextureCache.has(key)) {
    return _armBackTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawArmBackToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawArmBackToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _armBackTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material trasero (-Z, índice 5) para el brazo 3D del héroe.
 */
export function createHeroArmBackMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_armBackMaterialCache.has(heroId)) {
      return _armBackMaterialCache.get(heroId);
    }
    const color = heroId === 'wizard' ? 0x4c1d95 : (heroId === 'ranger' ? 0x166534 : (heroId === 'paladin' ? 0x52525b : (heroId === 'adventurer' ? 0x0369a1 : 0x5a3a18)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId };
    _armBackMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_armBackMaterialCache.has(heroId)) {
    return _armBackMaterialCache.get(heroId);
  }

  const texture = createHeroArmBackTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _armBackMaterialCache.set(heroId, mat);
  return mat;
}

/** Libera todas las texturas y materiales cacheados de la region "arm". */
export function disposeArmPortraitTextures() {
  for (const mat of _armFrontMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _armFrontMaterialCache.clear();
  for (const mat of _armSideMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _armSideMaterialCache.clear();
  for (const mat of _armInnerMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _armInnerMaterialCache.clear();
  for (const mat of _armBackMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _armBackMaterialCache.clear();
  for (const tex of _armFrontTextureCache.values()) {
    tex.dispose?.();
  }
  _armFrontTextureCache.clear();
  for (const tex of _armSideTextureCache.values()) {
    tex.dispose?.();
  }
  _armSideTextureCache.clear();
  for (const tex of _armInnerTextureCache.values()) {
    tex.dispose?.();
  }
  _armInnerTextureCache.clear();
  for (const tex of _armBackTextureCache.values()) {
    tex.dispose?.();
  }
  _armBackTextureCache.clear();
}
