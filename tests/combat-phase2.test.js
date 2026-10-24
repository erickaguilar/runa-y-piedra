import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mocks globales de navegador para ejecución limpia en Node.js
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
  HERO_WEAPONS,
  WEAPON_TYPES,
  TRAINING_DUMMIES,
  getHeroWeapon,
  calculateDamage,
  calculateDps,
} from '../src/config/combat.js';
import { Player } from '../src/entities/Player.js';
import { CombatManager } from '../src/combat/CombatManager.js';
import { World } from '../src/core/World.js';
import { SoundManager } from '../src/audio/SoundManager.js';
import { DummyRenderer } from '../src/render/DummyRenderer.js';
import { ProjectileRenderer } from '../src/render/ProjectileRenderer.js';
import * as THREE from 'three';

test('Configuración de Armas: Define las 5 armas canónicas de clase', () => {
  assert.equal(HERO_WEAPONS.length, 5);

  const advWeapon = getHeroWeapon(0);
  assert.equal(advWeapon.id, 'adventurer_sword');
  assert.equal(advWeapon.type, WEAPON_TYPES.MELEE_LIGHT);
  assert.equal(advWeapon.range, 1.8);
  assert.equal(advWeapon.arcDeg, 60);
  assert.equal(advWeapon.cooldownMs, 350);
  assert.equal(advWeapon.damage, 1);

  const palWeapon = getHeroWeapon('paladin');
  assert.equal(palWeapon.id, 'paladin_greatsword');
  assert.equal(palWeapon.type, WEAPON_TYPES.MELEE_HEAVY);
  assert.equal(palWeapon.range, 2.2);
  assert.equal(palWeapon.arcDeg, 180);
  assert.equal(palWeapon.cooldownMs, 650);
  assert.equal(palWeapon.damage, 2);
  assert.equal(palWeapon.knockback, 2.5);

  const ranWeapon = getHeroWeapon(2);
  assert.equal(ranWeapon.id, 'ranger_bow');
  assert.equal(ranWeapon.type, WEAPON_TYPES.PROJECTILE_ARROW);
  assert.equal(ranWeapon.range, 16.0);
  assert.equal(ranWeapon.speed, 22.0);
  assert.equal(ranWeapon.cooldownMs, 400);

  const wizWeapon = getHeroWeapon(3);
  assert.equal(wizWeapon.id, 'wizard_staff');
  assert.equal(wizWeapon.type, WEAPON_TYPES.PROJECTILE_MAGIC);
  assert.equal(wizWeapon.range, 12.0);
  assert.equal(wizWeapon.speed, 14.0);
  assert.equal(wizWeapon.cooldownMs, 550);
  assert.equal(wizWeapon.aoeRadius, 1.2);

  const guaWeapon = getHeroWeapon(4);
  assert.equal(guaWeapon.id, 'guardian_hammer');
  assert.equal(guaWeapon.type, WEAPON_TYPES.MELEE_WAVE);
  assert.equal(guaWeapon.range, 2.0);
  assert.equal(guaWeapon.arcDeg, 360);
  assert.equal(guaWeapon.cooldownMs, 750);
  assert.equal(guaWeapon.stunMs, 800);
});

test('Player actualiza su arma canónica y cadencia según el héroe asignado', () => {
  const p = new Player(1, 0, 0, 0, 'Tester', 0);
  assert.equal(p.weapon.id, 'adventurer_sword');
  assert.equal(p.attackCooldownMs, 350);

  p.setColorIndex(1); // Paladín
  assert.equal(p.weapon.id, 'paladin_greatsword');
  assert.equal(p.attackCooldownMs, 650);

  p.setColorIndex(2); // Ranger
  assert.equal(p.weapon.id, 'ranger_bow');
  assert.equal(p.attackCooldownMs, 400);

  p.setColorIndex(3); // Mago
  assert.equal(p.weapon.id, 'wizard_staff');
  assert.equal(p.attackCooldownMs, 550);

  p.setColorIndex(4); // Guardián
  assert.equal(p.weapon.id, 'guardian_hammer');
  assert.equal(p.attackCooldownMs, 750);
});

test('calculateDamage: cálculo de daño efectivo con defensas y debilidades', () => {
  // Ataque directo sin defensa
  assert.equal(calculateDamage(2, 0, null, WEAPON_TYPES.MELEE_LIGHT), 2);

  // Blanco acorazado con 1 de defensa
  assert.equal(calculateDamage(2, 1, null, WEAPON_TYPES.MELEE_HEAVY), 1);
  // Golpe débil contra armadura alta nunca baja de 1
  assert.equal(calculateDamage(1, 5, null, WEAPON_TYPES.MELEE_LIGHT), 1);

  // Vulnerabilidad a magia
  assert.equal(calculateDamage(2, 0, 'magic', WEAPON_TYPES.PROJECTILE_MAGIC), 3);
  // Ataque físico contra vulnerable a magia no recibe bono
  assert.equal(calculateDamage(2, 0, 'magic', WEAPON_TYPES.MELEE_LIGHT), 2);
});

test('calculateDps: cálculo en ventana móvil de 3 segundos', () => {
  const now = 5000;
  assert.equal(calculateDps([], now), 0.0);

  // Un solo golpe de 2 de daño hace 1 segundo
  const hits1 = [{ damage: 2, timestamp: 4000 }];
  const dps1 = calculateDps(hits1, now, 3000);
  assert.equal(dps1, 2.0); // 2 daño / 1.0 seg = 2.0

  // 3 golpes de 2 daño en los últimos 2 segundos
  const hits2 = [
    { damage: 2, timestamp: 3000 },
    { damage: 2, timestamp: 4000 },
    { damage: 2, timestamp: 5000 },
  ];
  const dps2 = calculateDps(hits2, now, 3000);
  assert.equal(dps2, 3.0); // 6 daño / 2.0 seg = 3.0

  // Impactos anteriores a 3 segundos son descartados
  const hitsWithOld = [
    { damage: 10, timestamp: 1000 }, // Descartado (> 3s)
    { damage: 2, timestamp: 4500 },
  ];
  const dps3 = calculateDps(hitsWithOld, now, 3000);
  assert.equal(dps3, 4.0); // 2 daño / 0.5 seg (mínimo) = 4.0
});

test('CombatManager: inicializa y gestiona los 3 maniquíes del Sector 2', () => {
  const cm = new CombatManager();
  const dummies = cm.getAllDummies();
  assert.equal(dummies.length, 3);

  const light = cm.getDummy('dummy_light');
  assert.ok(light);
  assert.equal(light.x, 7.5);
  assert.equal(light.y, 1.0);
  assert.equal(light.z, 15.0);
  assert.equal(light.type, 'light');
  assert.equal(light.defense, 0);

  const heavy = cm.getDummy('dummy_heavy');
  assert.equal(heavy.x, 11.5);
  assert.equal(heavy.type, 'heavy');
  assert.equal(heavy.defense, 1);

  const elemental = cm.getDummy('dummy_elemental');
  assert.equal(elemental.x, 15.5);
  assert.equal(elemental.type, 'elemental');
  assert.equal(elemental.weakness, 'magic');

  // Aplicar daño directo
  const res = cm.applyDamageToDummy('dummy_light', 2, { type: WEAPON_TYPES.MELEE_LIGHT }, null, 1000);
  assert.equal(res.effectiveDamage, 2);
  assert.equal(light.totalDamage, 2);
  assert.equal(light.hitCount, 1);
  assert.ok(light.flashTimer > 0);
  assert.ok(light.shakeTimer > 0);

  // Reset
  cm.resetDummies();
  assert.equal(light.totalDamage, 0);
  assert.equal(light.hitCount, 0);
  assert.equal(light.dps, 0.0);
});

test('CombatManager: resolución de barrido Melee por cono, ángulo y rango', () => {
  let hitLog = [];
  const cm = new CombatManager({
    onHit: (h) => hitLog.push(h),
  });

  // Maniquí de paja está en x=7.5, z=15.0
  // Paladín (180° sweep, 2.2m alcance):
  // Colocamos al jugador en x=7.5, z=16.5 mirando al norte (hacia -Z, yaw = 0)
  // fx = -sin(0) = 0, fz = -cos(0) = -1. Blanco está en z=15.0 (dz = -1.5, en frente)
  const paladin = new Player(1, 7.5, 1.0, 16.5, 'Paladin', 1, 0);
  paladin.attackCooldownMs = 0; // cooldown listo

  const res1 = cm.executePlayerAttack(paladin, 1000);
  assert.ok(res1);
  assert.equal(res1.hits.length, 1);
  assert.equal(res1.hits[0].dummyId, 'dummy_light');

  // Si el paladín mira hacia el sur (yaw = Math.PI, fz = +1), el blanco queda a su espalda (fuera del barrido 180°)
  paladin.yaw = Math.PI;
  paladin.lastAttackTime = 0;
  const res2 = cm.executePlayerAttack(paladin, 2000);
  assert.ok(res2);
  assert.equal(res2.hits.length, 0);

  // Aventurero (60° arco, 1.8m alcance):
  // Colocamos al jugador en x=7.5, z=16.5 mirando al norte (en rango, ángulo 0°): IMPACTA
  const adv = new Player(2, 7.5, 1.0, 16.5, 'Adv', 0, 0);
  adv.attackCooldownMs = 0;
  const resAdv = cm.executePlayerAttack(adv, 3000);
  assert.equal(resAdv.hits.length, 1);

  // Si el aventurero está demasiado lejos (z = 17.5, dist = 2.5m > 1.8m): FALLA
  adv.pos.z = 17.5;
  adv.lastAttackTime = 0;
  const resAdvFar = cm.executePlayerAttack(adv, 4000);
  assert.equal(resAdvFar.hits.length, 0);

  // Guardián (360° radial wave):
  // Colocamos al guardián en x=7.5, z=14.0 mirando al norte (blanco está a su espalda a 1.0m): IMPACTA por 360°
  const guardian = new Player(3, 7.5, 1.0, 14.0, 'Guardian', 4, 0);
  guardian.attackCooldownMs = 0;
  const resGua = cm.executePlayerAttack(guardian, 5000);
  assert.equal(resGua.hits.length, 1);
});

test('CombatManager: disparo de proyectiles balísticos y colisión AABB', () => {
  const cm = new CombatManager();
  // Explorador (Ranger) dispara flecha hacia dummy_heavy (x=11.5, z=15.0)
  // Jugador situado en x=11.5, z=18.0, mirando al norte (yaw=0, pitch=0)
  const ranger = new Player(1, 11.5, 1.0, 18.0, 'Ranger', 2, 0);
  ranger.pitch = 0;
  ranger.attackCooldownMs = 0;

  const attackResult = cm.executePlayerAttack(ranger, 1000);
  assert.ok(attackResult.isProjectile);
  assert.ok(attackResult.projectile);
  assert.equal(attackResult.projectile.active, true);
  assert.equal(attackResult.projectile.speed, 22.0);

  const heavyDummy = cm.getDummy('dummy_heavy');
  const initialHits = heavyDummy.hitCount;

  // Simular avance de proyectil con dt = 0.1s (~2.2m por tick)
  // De z=17.6 a z=15.4 (en rango AABB del dummy en z=15.0 ± 0.4)
  cm.update(0.1, null, 1100);
  cm.update(0.1, null, 1200);

  // El proyectil debió haber impactado y desactivarse
  assert.equal(attackResult.projectile.active, false);
  assert.equal(heavyDummy.hitCount, initialHits + 1);
});

test('SoundManager y Renderers de Combate: Instanciación segura y ejecución sin excepciones', () => {
  const sound = new SoundManager();
  assert.doesNotThrow(() => sound.playHit('wood'));
  assert.doesNotThrow(() => sound.playHit('iron'));
  assert.doesNotThrow(() => sound.playHit('magic'));
  assert.doesNotThrow(() => sound.playHit('generic'));

  const scene = new THREE.Scene();
  const dummyRenderer = new DummyRenderer(scene);
  const projRenderer = new ProjectileRenderer(scene, 8);

  const cm = new CombatManager();
  assert.doesNotThrow(() => dummyRenderer.loadDummies(cm.getAllDummies()));
  assert.doesNotThrow(() => dummyRenderer.update(0.016, cm.getAllDummies()));
  assert.doesNotThrow(() => projRenderer.update(0.016, cm.projectiles));

  assert.doesNotThrow(() => dummyRenderer.dispose());
  assert.doesNotThrow(() => projRenderer.dispose());
});
