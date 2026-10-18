// src/heroes/portraits/texturesLeg.js
// Factorias de textura y material de las partes "leg" de los heroes Sumi-e.
// Cada parte cachea su CanvasTexture/MeshLambertMaterial para reutilizacion global.
// Extraido de src/heroes/heroPortraits.js (Fase 6). Sin cambios de comportamiento.

import * as THREE from 'three';
import { HERO_PORTRAITS } from './registry.js';

const _legFrontTextureCache = new Map();

const _legSideTextureCache = new Map();

const _legInnerTextureCache = new Map();

const _legBackTextureCache = new Map();

const _legFrontMaterialCache = new Map();

const _legSideMaterialCache = new Map();

const _legInnerMaterialCache = new Map();

const _legBackMaterialCache = new Map();

/**
 * Genera o recupera del caché la textura frontal (+Z, índice 4) de la pierna del héroe.
 */
export function createHeroLegFrontTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_legFrontTextureCache.has(key)) {
    return _legFrontTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawLegFrontToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawLegFrontToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _legFrontTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material frontal (+Z, índice 4) para la pierna 3D del héroe.
 */
export function createHeroLegFrontMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_legFrontMaterialCache.has(heroId)) {
      return _legFrontMaterialCache.get(heroId);
    }
    const color = heroId === 'wizard' ? 0x1e1b4b : (heroId === 'ranger' ? 0x14532d : (heroId === 'paladin' ? 0x3f3f46 : (heroId === 'adventurer' ? 0x1e293b : 0x1c1917)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId };
    _legFrontMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_legFrontMaterialCache.has(heroId)) {
    return _legFrontMaterialCache.get(heroId);
  }

  const texture = createHeroLegFrontTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _legFrontMaterialCache.set(heroId, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral exterior (+X o -X) de la pierna del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para exterior derecho, 'L' para exterior izquierdo.
 * @param {number} size
 */
export function createHeroLegSideTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_legSideTextureCache.has(key)) {
    return _legSideTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawLegSideToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawLegSideToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _legSideTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral exterior para la pierna 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side
 */
export function createHeroLegSideMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_legSideMaterialCache.has(cacheKey)) {
      return _legSideMaterialCache.get(cacheKey);
    }
    const color = heroId === 'wizard' ? 0x1e1b4b : (heroId === 'ranger' ? 0x14532d : (heroId === 'paladin' ? 0x3f3f46 : (heroId === 'adventurer' ? 0x1e293b : 0x1c1917)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId, side: normSide };
    _legSideMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_legSideMaterialCache.has(cacheKey)) {
    return _legSideMaterialCache.get(cacheKey);
  }

  const texture = createHeroLegSideTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _legSideMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura lateral interior para la pierna 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side - 'R' para pierna derecha (lado interior -X), 'L' para pierna izquierda (lado interior +X).
 * @param {number} size
 */
export function createHeroLegInnerTexture(heroId, side = 'R', size = 64) {
  if (typeof document === 'undefined') return null;

  const normSide = side === 'L' ? 'L' : 'R';
  const key = `${heroId}_${normSide}_${size}`;
  if (_legInnerTextureCache.has(key)) {
    return _legInnerTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawLegInnerToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawLegInnerToCanvas(ctx, size, normSide === 'L');

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _legInnerTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material lateral interior para la pierna 3D del héroe.
 * @param {string} heroId
 * @param {'R'|'L'} side
 */
export function createHeroLegInnerMaterial(heroId, side = 'R') {
  const normSide = side === 'L' ? 'L' : 'R';
  const cacheKey = `${heroId}_${normSide}`;

  if (typeof document === 'undefined') {
    if (_legInnerMaterialCache.has(cacheKey)) {
      return _legInnerMaterialCache.get(cacheKey);
    }
    const color = heroId === 'wizard' ? 0x0f172a : (heroId === 'ranger' ? 0x052e16 : (heroId === 'paladin' ? 0x27272a : (heroId === 'adventurer' ? 0x0f172a : 0x1c1917)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId, side: normSide };
    _legInnerMaterialCache.set(cacheKey, mat);
    return mat;
  }

  if (_legInnerMaterialCache.has(cacheKey)) {
    return _legInnerMaterialCache.get(cacheKey);
  }

  const texture = createHeroLegInnerTexture(heroId, normSide, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId, side: normSide };
  _legInnerMaterialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Genera o recupera del caché la textura trasera (-Z, índice 5) de la pierna del héroe.
 */
export function createHeroLegBackTexture(heroId, size = 64) {
  if (typeof document === 'undefined') return null;

  const key = `${heroId}_${size}`;
  if (_legBackTextureCache.has(key)) {
    return _legBackTextureCache.get(key);
  }

  const def = HERO_PORTRAITS[heroId];
  if (!def || !def.drawLegBackToCanvas) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  def.drawLegBackToCanvas(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  _legBackTextureCache.set(key, texture);
  return texture;
}

/**
 * Crea o recupera del caché el material trasero (-Z, índice 5) para la pierna 3D del héroe.
 */
export function createHeroLegBackMaterial(heroId) {
  if (typeof document === 'undefined') {
    if (_legBackMaterialCache.has(heroId)) {
      return _legBackMaterialCache.get(heroId);
    }
    const color = heroId === 'wizard' ? 0x1e1b4b : (heroId === 'ranger' ? 0x14532d : (heroId === 'paladin' ? 0x3f3f46 : (heroId === 'adventurer' ? 0x1e293b : 0x1c1917)));
    const mat = new THREE.MeshLambertMaterial({ color });
    mat.userData = { isShared: true, heroId };
    _legBackMaterialCache.set(heroId, mat);
    return mat;
  }

  if (_legBackMaterialCache.has(heroId)) {
    return _legBackMaterialCache.get(heroId);
  }

  const texture = createHeroLegBackTexture(heroId, 64);
  if (!texture) {
    return null;
  }

  const mat = new THREE.MeshLambertMaterial({
    map: texture,
    color: 0xffffff,
  });
  mat.userData = { isShared: true, heroId };
  _legBackMaterialCache.set(heroId, mat);
  return mat;
}

/** Libera todas las texturas y materiales cacheados de la region "leg". */
export function disposeLegPortraitTextures() {
  for (const mat of _legFrontMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _legFrontMaterialCache.clear();
  for (const mat of _legSideMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _legSideMaterialCache.clear();
  for (const mat of _legInnerMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _legInnerMaterialCache.clear();
  for (const mat of _legBackMaterialCache.values()) {
    mat.map?.dispose?.();
    mat.dispose?.();
  }
  _legBackMaterialCache.clear();
  for (const tex of _legFrontTextureCache.values()) {
    tex.dispose?.();
  }
  _legFrontTextureCache.clear();
  for (const tex of _legSideTextureCache.values()) {
    tex.dispose?.();
  }
  _legSideTextureCache.clear();
  for (const tex of _legInnerTextureCache.values()) {
    tex.dispose?.();
  }
  _legInnerTextureCache.clear();
  for (const tex of _legBackTextureCache.values()) {
    tex.dispose?.();
  }
  _legBackTextureCache.clear();
}
