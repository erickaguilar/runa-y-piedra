import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createCartographyMaterials,
  createCartographyGeometries,
  buildCartographyTableMesh,
  CARTO_LIGHT_INTENSITY,
  CARTO_PARTICLE_COUNT,
} from '../src/render/models/props/cartographyModel.js';
import { PedestalRenderer } from '../src/render/PedestalRenderer.js';

describe('Cartography Table & Astrolabe 3D Model', () => {
  it('crea los materiales temáticos de la mesa cartográfica', () => {
    const mats = createCartographyMaterials();
    assert.ok(mats.stoneBase);
    assert.ok(mats.stonePillars);
    assert.ok(mats.bronzeTrim);
    assert.ok(mats.hologramMap);
    assert.ok(mats.celestialCore);
    assert.ok(mats.stardust);

    assert.equal(mats.hologramMap.color.getHex(), 0x38bdf8);
    assert.equal(mats.hologramMap.transparent, true);
    assert.equal(mats.celestialCore.emissive.getHex(), 0x0284c7);
    for (const m of Object.values(mats)) {
      m.dispose?.();
    }
  });

  it('genera las geometrías de soporte, losa, aros armilares y núcleo', () => {
    const geos = createCartographyGeometries();
    assert.ok(geos.stoneBase instanceof THREE.BufferGeometry);
    assert.ok(geos.stonePillars instanceof THREE.BufferGeometry);
    assert.ok(geos.tableSlab instanceof THREE.BufferGeometry);
    assert.ok(geos.bronzeTrim instanceof THREE.BufferGeometry);
    assert.ok(geos.mapDisc instanceof THREE.BufferGeometry);
    assert.ok(geos.mapRing instanceof THREE.BufferGeometry);
    assert.ok(geos.outerArmillary instanceof THREE.BufferGeometry);
    assert.ok(geos.innerArmillary instanceof THREE.BufferGeometry);
    assert.ok(geos.celestialCore instanceof THREE.BufferGeometry);

    for (const g of Object.values(geos)) {
      g.dispose?.();
    }
  });

  it('ensambla el modelo 3D con luz celestial y polvo estelar', () => {
    const mats = createCartographyMaterials();
    const geos = createCartographyGeometries();
    const model = buildCartographyTableMesh(geos, mats);

    assert.ok(model.root instanceof THREE.Group);
    assert.equal(model.root.name, 'CartographyTable');
    assert.equal(model.isCartography, true);
    assert.ok(model.outerRingMesh);
    assert.ok(model.innerRingMesh);
    assert.ok(model.coreMesh);
    assert.ok(model.light instanceof THREE.PointLight);
    assert.equal(model.light.intensity, CARTO_LIGHT_INTENSITY);
    assert.ok(model.stardustPoints instanceof THREE.Points);
    assert.equal(model.stardustSpeed.length, CARTO_PARTICLE_COUNT);

    for (const g of Object.values(geos)) g.dispose?.();
    for (const m of Object.values(mats)) m.dispose?.();
  });

  it('PedestalRenderer integra y anima la Mesa Cartográfica de forma resiliente', () => {
    const scene = new THREE.Scene();
    const renderer = new PedestalRenderer(scene);

    const monoliths = [
      { id: 'cartography', type: 'cartography', name: 'Monolito de Cartografía', x: 17.5, y: 1.0, z: 8.5 }
    ];

    renderer.loadPedestals([], { monoliths });
    assert.equal(renderer.pedestals.size, 1);

    const p = renderer.pedestals.get('cartography');
    assert.ok(p);
    assert.equal(p.isCartography, true);
    assert.equal(p.root.position.x, 17.5);
    assert.equal(p.root.position.z, 8.5);

    // Animación sin excepciones ni fugas
    const initOuterRot = p.outerRingMesh.rotation.y;
    renderer.update(0.016, 1.0);
    assert.notEqual(p.outerRingMesh.rotation.y, initOuterRot);

    // Activación y pulso celestial
    const activated = renderer.activate('cartography');
    assert.equal(activated, true);

    renderer.dispose();
    assert.equal(renderer.pedestals.size, 0);
  });
});
