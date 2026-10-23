import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Mocks globales para entorno Node.js
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
  getHeroWeapon,
  getDistanceDamageModifier,
  calculateDamage,
} from '../src/config/combat.js';
import { PLAYER_HEROES } from '../src/config/constants.js';
import { HeroMixin } from '../src/ui/HeroManager.js';
import { Player } from '../src/entities/Player.js';
import { CombatManager } from '../src/combat/CombatManager.js';
import { DummyRenderer, createDummyBadgeSprite, createFloatingDamageSprite } from '../src/render/DummyRenderer.js';

test('getDistanceDamageModifier: Aventurero (Espada Ligera - Punta de Hoja)', () => {
  const advWeapon = getHeroWeapon(0);
  assert.equal(advWeapon.id, 'adventurer_sword');

  // Contacto cercano (< 1.1m): sin bonificación
  const close = getDistanceDamageModifier(advWeapon, 0.6);
  assert.equal(close.bonusDamage, 0);
  assert.equal(close.label, 'Contacto');
  assert.equal(close.isBonus, false);

  // Punta de hoja (1.1m a 1.85m): +1 daño
  const sweet = getDistanceDamageModifier(advWeapon, 1.5);
  assert.equal(sweet.bonusDamage, 1);
  assert.equal(sweet.label, 'Punta de Hoja');
  assert.equal(sweet.isBonus, true);
});

test('getDistanceDamageModifier: Paladín (Mandoble - Inercia de Filo)', () => {
  const palWeapon = getHeroWeapon(1);
  assert.equal(palWeapon.id, 'paladin_greatsword');

  // Rango corto (< 1.4m): sin bono
  const close = getDistanceDamageModifier(palWeapon, 0.9);
  assert.equal(close.bonusDamage, 0);
  assert.equal(close.label, 'Cuerpo a cuerpo');
  assert.equal(close.isBonus, false);

  // Filo exterior (1.4m a 2.25m): +1 daño
  const sweet = getDistanceDamageModifier(palWeapon, 1.8);
  assert.equal(sweet.bonusDamage, 1);
  assert.equal(sweet.label, 'Inercia de Filo');
  assert.equal(sweet.isBonus, true);
});

test('getDistanceDamageModifier: Cazador (Arco Rúnico - Escala por distancia)', () => {
  const bow = getHeroWeapon(2);
  assert.equal(bow.id, 'ranger_bow');

  // Quemarropa (< 4m): daño base sin bono
  const pointBlank = getDistanceDamageModifier(bow, 2.5);
  assert.equal(pointBlank.bonusDamage, 0);
  assert.equal(pointBlank.label, 'Quemarropa');
  assert.equal(pointBlank.isBonus, false);

  // Tiro de precisión (4m a 8m): +1 daño
  const mid = getDistanceDamageModifier(bow, 6.0);
  assert.equal(mid.bonusDamage, 1);
  assert.equal(mid.label, 'Tiro de Precisión');
  assert.equal(mid.isBonus, true);

  // Tiro francotirador (>= 8m): +2 daño
  const far = getDistanceDamageModifier(bow, 12.0);
  assert.equal(far.bonusDamage, 2);
  assert.equal(far.label, 'Tiro Francotirador');
  assert.equal(far.isBonus, true);
});

test('getDistanceDamageModifier: Mago (Báculo Arcano - Resonancia y Sobrecarga)', () => {
  const staff = getHeroWeapon(3);
  assert.equal(staff.id, 'wizard_staff');

  // Descarga corta (< 3m): sin bono
  const shortDist = getDistanceDamageModifier(staff, 2.0);
  assert.equal(shortDist.bonusDamage, 0);
  assert.equal(shortDist.label, 'Descarga Corta');
  assert.equal(shortDist.isBonus, false);

  // Resonancia arcana (3m a 7m): +1 daño
  const mid = getDistanceDamageModifier(staff, 5.0);
  assert.equal(mid.bonusDamage, 1);
  assert.equal(mid.label, 'Resonancia Arcana');
  assert.equal(mid.isBonus, true);

  // Sobrecarga de plasma (>= 7m): +2 daño
  const far = getDistanceDamageModifier(staff, 9.0);
  assert.equal(far.bonusDamage, 2);
  assert.equal(far.label, 'Sobrecarga de Plasma');
  assert.equal(far.isBonus, true);
});

test('getDistanceDamageModifier: Guardián (Mazo Sísmico - Epicentro Telúrico)', () => {
  const hammer = getHeroWeapon(4);
  assert.equal(hammer.id, 'guardian_hammer');

  // Epicentro demoledor (<= 0.85m): +1 daño
  const epicenter = getDistanceDamageModifier(hammer, 0.5);
  assert.equal(epicenter.bonusDamage, 1);
  assert.equal(epicenter.label, 'Epicentro Telúrico');
  assert.equal(epicenter.isBonus, true);

  // Onda periférica (> 0.85m): daño base normal
  const wave = getDistanceDamageModifier(hammer, 1.6);
  assert.equal(wave.bonusDamage, 0);
  assert.equal(wave.label, 'Onda Dispersa');
  assert.equal(wave.isBonus, false);
});

test('calculateDamage con distancia: aplica bonificación y respeta armaduras', () => {
  const bow = getHeroWeapon(2);

  // Disparo a quemarropa contra sin armadura: 1 daño base
  assert.equal(calculateDamage(bow.damage, 0, null, bow.type, 2.0, bow), 1);

  // Disparo francotirador a 10m contra sin armadura: 1 base + 2 bono = 3 daño
  assert.equal(calculateDamage(bow.damage, 0, null, bow.type, 10.0, bow), 3);

  // Disparo francotirador a 10m contra maniquí acorazado (defensa 1): 3 - 1 = 2 daño
  assert.equal(calculateDamage(bow.damage, 1, null, bow.type, 10.0, bow), 2);
});

test('CombatManager: Maniquí de prueba registra y refleja distancia en ataque melee', () => {
  const cm = new CombatManager();
  const dummy = cm.getDummy('dummy_light'); // x=7.5, z=15.0

  // Paladín en x=7.5, z=16.8 (distancia ~1.8m -> Inercia de Filo)
  const paladin = new Player(1, 7.5, 1.0, 16.8, 'Paladin', 1, 0);
  paladin.attackCooldownMs = 0;

  const result = cm.executePlayerAttack(paladin, 1000);
  assert.ok(result);
  assert.equal(result.hits.length, 1);

  const hit = result.hits[0];
  assert.equal(hit.dummyId, 'dummy_light');
  assert.equal(hit.isDistanceBonus, true);
  assert.equal(hit.distanceLabel, 'Inercia de Filo');
  assert.equal(hit.effectiveDamage, 3); // 2 base + 1 inercia de filo

  // El estado del dummy refleja la distancia y bonificación
  assert.equal(dummy.lastDamage, 3);
  assert.ok(dummy.lastDistance > 1.3);
  assert.equal(dummy.lastDistanceLabel, 'Inercia de Filo');
  assert.equal(dummy.lastIsBonus, true);
  assert.ok(dummy.shakeIntensity > 0.1); // Sacudida aumentada ante bonus
});

test('CombatManager: Maniquí registra daño balístico por distancia recorrida de flecha', () => {
  const cm = new CombatManager();
  const dummy = cm.getDummy('dummy_light'); // x=7.5, z=15.0

  // Ranger colocado a 10m de distancia: x=7.5, z=25.0, mirando al norte (yaw=0, pitch=0)
  const ranger = new Player(2, 7.5, 1.0, 25.0, 'Ranger', 2, 0);
  ranger.attackCooldownMs = 0;

  const attackResult = cm.executePlayerAttack(ranger, 1000);
  assert.ok(attackResult.isProjectile);

  // Simular avance de proyectil (speed = 22 m/s) hasta impactar en z=15
  cm.update(0.2, null, 1200);
  cm.update(0.2, null, 1400);
  cm.update(0.1, null, 1500);

  assert.equal(dummy.hitCount, 1);
  assert.equal(dummy.lastIsBonus, true);
  assert.equal(dummy.lastDistanceLabel, 'Tiro Francotirador');
  assert.equal(dummy.lastDamage, 3); // 1 base + 2 francotirador
  assert.ok(dummy.lastDistance >= 8.0);
});

test('CombatManager: resetDummies reinicia la telemetría de distancia', () => {
  const cm = new CombatManager();
  const dummy = cm.getDummy('dummy_light');
  cm.applyDamageToDummy('dummy_light', 2, getHeroWeapon(0), null, 1000, 1.5);

  assert.equal(dummy.lastDistance, 1.5);
  assert.equal(dummy.lastIsBonus, true);

  cm.resetDummies();
  assert.equal(dummy.lastDistance, 0);
  assert.equal(dummy.lastDistanceLabel, '');
  assert.equal(dummy.lastIsBonus, false);
});

test('DummyRenderer: Soporta badges enriquecidos y sprites de daño flotante', () => {
  const scene = new THREE.Scene();
  const renderer = new DummyRenderer(scene);

  const cm = new CombatManager();
  renderer.loadDummies(cm.getAllDummies());

  // Aplicar daño con bonus de distancia
  const dummy = cm.getDummy('dummy_light');
  cm.applyDamageToDummy('dummy_light', 2, getHeroWeapon(1), null, 1000, 1.8);

  assert.doesNotThrow(() => {
    renderer.update(0.016, cm.getAllDummies());
  });

  const badge = createDummyBadgeSprite(dummy);
  assert.ok(badge);
  const floating = createFloatingDamageSprite();
  assert.ok(floating);

  assert.doesNotThrow(() => {
    renderer.dispose();
  });
});

test('HeroMixin: renderHeroTraitCard renderiza estadísticas de daño y arma para cada héroe', () => {
  const expectedStats = [
    { id: 'adventurer', dmg: 'Daño 1-2', weapon: 'Espada de Explorador' },
    { id: 'paladin', dmg: 'Daño 2-3', weapon: 'Mandoble de la Luz' },
    { id: 'ranger', dmg: 'Daño 1-3', weapon: 'Arco Rúnico del Viento' },
    { id: 'wizard', dmg: 'Daño 2-4', weapon: 'Báculo de Rayo Arcano' },
    { id: 'guardian', dmg: 'Daño 2-3', weapon: 'Mazo Sísmico Basalto' },
  ];

  for (const exp of expectedStats) {
    const hero = PLAYER_HEROES.find(h => h.id === exp.id);
    assert.ok(hero, `Héroe ${exp.id} debe existir en PLAYER_HEROES`);
    assert.equal(hero.stats.damage, exp.dmg.replace('Daño ', ''));
    assert.equal(hero.stats.weapon, exp.weapon);

    const html = HeroMixin.renderHeroTraitCard(hero);
    assert.ok(html.includes(exp.dmg), `Ficha de ${exp.id} debe incluir "${exp.dmg}"`);
    assert.ok(html.includes(exp.weapon), `Ficha de ${exp.id} debe incluir tooltip del arma "${exp.weapon}"`);
    assert.ok(html.includes('hero-stat-badges'), `Ficha de ${exp.id} debe incluir hero-stat-badges`);
  }
});
