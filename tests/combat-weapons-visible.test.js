import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Mocks globales mínimos para Node.js
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  navigator: { userAgent: 'node', maxTouchPoints: 0 },
};
globalThis.document = {
  createElement: () => ({
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      fill: () => {},
      stroke: () => {},
      beginPath: () => {},
      roundRect: () => {},
    }),
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: () => null,
  body: { appendChild: () => {} },
};

import {
  buildAdventurerSwordMesh,
  buildPaladinGreatswordMesh,
  buildRangerBowMesh,
  buildWizardStaffMesh,
  buildGuardianHammerMesh,
  buildHeroWeaponMesh,
} from '../src/render/models/heroes/heroWeapons.js';
import { FirstPersonWeaponRenderer } from '../src/render/FirstPersonWeaponRenderer.js';
import { buildAdventurerGear } from '../src/render/models/heroes/adventurerGear.js';
import { buildPaladinGear } from '../src/render/models/heroes/paladinGear.js';
import { buildRangerGear } from '../src/render/models/heroes/rangerGear.js';
import { buildWizardGear } from '../src/render/models/heroes/wizardGear.js';
import { buildGuardianGear } from '../src/render/models/heroes/guardianGear.js';

test('heroWeapons: Construcción individual de las 5 armas canónicas', () => {
  const sword = buildAdventurerSwordMesh();
  assert.ok(sword instanceof THREE.Group);
  assert.ok(sword.children.length >= 4, 'La espada de explorador debe tener al menos 4 piezas (hoja, guarda, empuñadura, pomo)');

  const greatsword = buildPaladinGreatswordMesh();
  assert.ok(greatsword instanceof THREE.Group);
  assert.ok(greatsword.children.length >= 5, 'El mandoble de la luz debe tener al menos 5 piezas');

  const bow = buildRangerBowMesh();
  assert.ok(bow instanceof THREE.Group);
  assert.ok(bow.children.length >= 6, 'El arco rúnico del viento debe tener al menos 6 piezas (empuñadura, palas, puntas, cuerda)');

  const staff = buildWizardStaffMesh();
  assert.ok(staff instanceof THREE.Group);
  assert.ok(staff.children.length >= 3, 'El báculo de rayo arcano debe tener al menos 3 piezas (asta, aro, cristal)');

  const hammer = buildGuardianHammerMesh();
  assert.ok(hammer instanceof THREE.Group);
  assert.ok(hammer.children.length >= 4, 'El mazo sísmico de basalto debe tener al menos 4 piezas (mango, cabeza, runas, púa)');
});

test('heroWeapons: Factory buildHeroWeaponMesh por id o índice', () => {
  const byIdAdv = buildHeroWeaponMesh('adventurer');
  const byIdxAdv = buildHeroWeaponMesh(0);
  assert.ok(byIdAdv instanceof THREE.Group);
  assert.ok(byIdxAdv instanceof THREE.Group);

  const byIdPal = buildHeroWeaponMesh('paladin');
  const byIdxPal = buildHeroWeaponMesh(1);
  assert.ok(byIdPal instanceof THREE.Group);
  assert.ok(byIdxPal instanceof THREE.Group);

  const byIdRan = buildHeroWeaponMesh('ranger');
  const byIdxRan = buildHeroWeaponMesh(2);
  assert.ok(byIdRan instanceof THREE.Group);
  assert.ok(byIdxRan instanceof THREE.Group);

  const byIdWiz = buildHeroWeaponMesh('wizard');
  const byIdxWiz = buildHeroWeaponMesh(3);
  assert.ok(byIdWiz instanceof THREE.Group);
  assert.ok(byIdxWiz instanceof THREE.Group);

  const byIdGua = buildHeroWeaponMesh('guardian');
  const byIdxGua = buildHeroWeaponMesh(4);
  assert.ok(byIdGua instanceof THREE.Group);
  assert.ok(byIdxGua instanceof THREE.Group);

  // Fallback con id no reconocido
  const fallback = buildHeroWeaponMesh('unknown_class');
  assert.ok(fallback instanceof THREE.Group);
});

test('FirstPersonWeaponRenderer: Ciclo de vida, anclaje a la cámara y visibilidad en escena', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  scene.add(camera);

  const renderer = new FirstPersonWeaponRenderer(camera);

  // 1. Debe estar emparentado a la cámara e inicialmente oculto
  assert.ok(camera.children.includes(renderer.group));
  assert.equal(renderer.group.visible, false);

  // 2. Selección de héroe paladín
  renderer.setHero('paladin');
  assert.equal(renderer.currentHeroId, 'paladin');
  assert.ok(renderer.currentWeaponMesh);
  assert.ok(renderer.group.children.includes(renderer.currentWeaponMesh));
  assert.equal(renderer.currentWeaponMesh.renderOrder, 9999);

  // 3. setHero con el mismo héroe no recrea la malla (Zero-GC)
  const currentMeshRef = renderer.currentWeaponMesh;
  renderer.setHero('paladin');
  assert.equal(renderer.currentWeaponMesh, currentMeshRef);

  // 4. Visibilidad y recorrido del grafo de escena
  renderer.setVisible(true);
  assert.equal(renderer.group.visible, true);

  let viewmodelFoundInScene = false;
  scene.traverse((obj) => {
    if (obj.name === 'FirstPersonWeaponViewmodel') viewmodelFoundInScene = true;
    if (obj.isMesh && obj.parent?.name?.startsWith('Weapon_')) {
      assert.equal(obj.frustumCulled, false, 'La malla del viewmodel no debe ser descartada por frustum');
      assert.equal(obj.renderOrder, 9999, 'El viewmodel debe renderizar por encima de la escena');
    }
  });
  assert.ok(viewmodelFoundInScene, 'La escena debe contener el viewmodel al estar la cámara añadida a la escena');

  renderer.setVisible(false);
  assert.equal(renderer.group.visible, false);

  // 5. Cambio a cazador
  renderer.setHero('ranger');
  assert.equal(renderer.currentHeroId, 'ranger');
  assert.notEqual(renderer.currentWeaponMesh, currentMeshRef);

  // 6. Dispose
  renderer.dispose();
  assert.equal(camera.children.includes(renderer.group), false);
  assert.equal(renderer.currentWeaponMesh, null);
});

test('Avatar 3D: Todas las clases equipan su arma canónica en armLPivot (Mano Derecha en 3ª persona)', () => {
  function createMockAvatar() {
    const gear = new THREE.Group();
    const armRPivot = new THREE.Group();
    const armLPivot = new THREE.Group();
    const legRPivot = new THREE.Group();
    const legLPivot = new THREE.Group();
    const a = {
      gear,
      parts: {
        armRPivot,
        armLPivot,
        legRPivot,
        legLPivot,
      },
    };
    const add = (child, parent) => {
      (parent || a.gear).add(child);
    };
    return { a, add };
  }

  // 1. Aventurero: espada en mano derecha (armLPivot)
  const adv = createMockAvatar();
  buildAdventurerGear(adv.a, {}, adv.add);
  assert.ok(adv.a.parts.armLPivot.children.length > 0, 'El aventurero debe tener la espada en armLPivot (mano derecha)');

  // 2. Paladín: mandoble en mano derecha (armLPivot) y escudo en mano izquierda (armRPivot)
  const pal = createMockAvatar();
  buildPaladinGear(pal.a, {}, pal.add);
  assert.ok(pal.a.parts.armLPivot.children.length > 0, 'El paladín debe tener el mandoble en armLPivot (mano derecha)');
  assert.ok(pal.a.parts.armRPivot.children.length > 0, 'El paladín debe tener el escudo en armRPivot (mano izquierda)');

  // 3. Cazador: arco en mano derecha (armLPivot)
  const ran = createMockAvatar();
  buildRangerGear(ran.a, {}, ran.add);
  assert.ok(ran.a.parts.armLPivot.children.length > 0, 'El explorador debe tener el arco en armLPivot (mano derecha)');

  // 4. Mago: báculo en mano derecha (armLPivot)
  const wiz = createMockAvatar();
  buildWizardGear(wiz.a, {}, wiz.add);
  assert.ok(wiz.a.parts.armLPivot.children.length > 0, 'El mago debe tener el báculo en armLPivot (mano derecha)');

  // 5. Guardián: mazo en mano derecha (armLPivot)
  const gua = createMockAvatar();
  buildGuardianGear(gua.a, {}, gua.add);
  assert.ok(gua.a.parts.armLPivot.children.length > 0, 'El guardián debe tener el mazo en armLPivot (mano derecha)');
});
