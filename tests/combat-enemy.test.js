import { test } from 'node:test';
import assert from 'node:assert/strict';

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

import { CANONICAL_ENEMIES } from '../src/config/combat.js';
import { Player } from '../src/entities/Player.js';
import { CombatManager } from '../src/combat/CombatManager.js';
import { EnemyManager } from '../src/combat/EnemyManager.js';
import { BaseEnemy, CaveSerpentEnemy } from '../src/combat/BaseEnemy.js';
import { EnemyRenderer } from '../src/render/EnemyRenderer.js';
import * as THREE from 'three';

test('CANONICAL_ENEMIES: Define el Esqueleto de Basalto de Dificultad 1', () => {
  const skitterer = CANONICAL_ENEMIES.basalt_skitterer;
  assert.ok(skitterer);
  assert.equal(skitterer.id, 'basalt_skitterer');
  assert.equal(skitterer.name, 'Esqueleto de Basalto');
  assert.equal(skitterer.tier, 1);
  assert.equal(skitterer.maxHp, 3);
  assert.equal(skitterer.damage, 1);
  assert.equal(skitterer.speed, 1.8);
  assert.equal(skitterer.attackRange, 1.4);
  assert.equal(skitterer.aggroRange, 8.5);
  assert.equal(skitterer.telegraphMs, 400);
});

test('EnemyManager: Genera y gestiona entidad enemiga en coordenadas de spawn', () => {
  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 }, 'test_enemy_1');

  assert.equal(enemy.id, 'test_enemy_1');
  assert.equal(enemy.name, 'Esqueleto de Basalto');
  assert.equal(enemy.hp, 3);
  assert.equal(enemy.maxHp, 3);
  assert.equal(enemy.x, 12.0);
  assert.equal(enemy.y, 1.0);
  assert.equal(enemy.z, 26.0);
  assert.equal(enemy.state, 'idle');
  assert.equal(enemy.isDead, false);

  // AABB correcta
  assert.equal(enemy.aabb.minX, 12.0 - 0.4);
  assert.equal(enemy.aabb.maxX, 12.0 + 0.4);
  assert.equal(enemy.aabb.minZ, 26.0 - 0.4);
  assert.equal(enemy.aabb.maxZ, 26.0 + 0.4);
});

test('CombatManager + EnemyManager: Resolución Melee contra el enemigo', () => {
  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 }, 'skitterer_target');

  const cm = new CombatManager({ enemyManager: em });

  // Paladín situado en x=12.0, z=27.5 (a 1.5m del enemigo, en cono frontal 180°, yaw=0 hacia -Z)
  const paladin = new Player(1, 12.0, 1.0, 27.5, 'Paladin', 1, 0);
  paladin.attackCooldownMs = 0;

  const attackResult = cm.executePlayerAttack(paladin, 1000);
  assert.ok(attackResult);
  assert.equal(attackResult.hits.length, 1);
  assert.equal(attackResult.hits[0].enemyId, 'skitterer_target');
  assert.equal(attackResult.hits[0].effectiveDamage, 2);

  // Vida del enemigo reducida de 3 a 1
  assert.equal(enemy.hp, 1);
  assert.ok(enemy.flashTimer > 0);
  assert.ok(enemy.knockbackTimer > 0);

  // Retroceso del paladín desplaza al enemigo hacia el norte (-Z)
  assert.ok(enemy.knockbackVz < 0);
});

test('CombatManager + EnemyManager: Disparo de proyectil y daño recíproco a enemigo', () => {
  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });

  const cm = new CombatManager({ enemyManager: em });

  // Explorador (Ranger) a distancia (z=30.0, yaw=0 hacia -Z)
  const ranger = new Player(2, 12.0, 1.0, 30.0, 'Ranger', 2, 0);
  ranger.pitch = 0;
  ranger.attackCooldownMs = 0;

  const result = cm.executePlayerAttack(ranger, 1000);
  assert.ok(result.isProjectile);
  assert.equal(result.projectile.active, true);

  // Simular avance del proyectil hasta impactar al enemigo
  cm.update(0.1, null, 1100);
  cm.update(0.1, null, 1200);

  assert.equal(result.projectile.active, false);
  assert.equal(enemy.hp, 2); // 3 - 1 = 2
  assert.ok(enemy.flashTimer > 0);
});

test('EnemyManager: IA de persecución, telegrafiado y ataque al jugador', () => {
  let playerDamaged = false;
  let dmgReceived = 0;

  const em = new EnemyManager({
    onPlayerDamaged: (p, dmg) => {
      playerDamaged = true;
      dmgReceived = dmg;
      p.loseLife();
    },
  });

  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  // Jugador situado a 4 metros (dentro de su aggroRange = 8.5m)
  const player = new Player(1, 12.0, 1.0, 22.0, 'Target', 0, 0);

  // 1. Tick inicial: el enemigo detecta al jugador y entra en persecución
  em.update(0.1, null, [player], 1000);
  assert.equal(enemy.state, 'chase');
  // Avanza hacia el jugador (z disminuye de 26 hacia 22)
  assert.ok(enemy.z < 26.0);

  // 2. Colocar al enemigo directamente en rango de ataque (1.2m)
  enemy.z = 23.2;
  em.update(0.016, null, [player], 1100);

  // Entra en estado de telegrafiado
  assert.equal(enemy.state, 'telegraph');
  assert.ok(enemy.telegraphTimer > 0);

  // 3. Transcurre el tiempo de telegrafiado (400ms)
  em.update(0.45, null, [player], 1550);

  // El enemigo ejecuta el golpe
  assert.equal(playerDamaged, true);
  assert.equal(dmgReceived, 1);
  assert.equal(player.lives, 2); // 3 - 1 = 2
});

test('EnemyManager: Derrota del enemigo y reaparición tras temporizador', () => {
  let defeated = false;
  const em = new EnemyManager({
    onEnemyDefeated: () => {
      defeated = true;
    },
  });

  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  const player = new Player(1, 12.0, 1.0, 27.0, 'Tester', 1, 0);

  // Aplicar daño letal de 3 puntos
  em.applyDamage(enemy.id, 3, { type: 'melee_heavy' }, player, 1000);

  assert.equal(defeated, true);
  assert.equal(enemy.hp, 0);
  assert.equal(enemy.isDead, true);
  assert.equal(enemy.state, 'dead');
  assert.ok(enemy.respawnTimer > 0);

  // Simular transcurso de 4.1 segundos
  em.update(4.1, null, [player], 5100);

  // El enemigo ha reaparecido completamente restaurado
  assert.equal(enemy.isDead, false);
  assert.equal(enemy.hp, 3);
  assert.equal(enemy.state, 'idle');
  assert.equal(enemy.x, 12.0);
  assert.equal(enemy.z, 26.0);
});

test('EnemyRenderer: Instanciación 3D, animación de marcha y telegrafiado', () => {
  const scene = new THREE.Scene();
  const renderer = new EnemyRenderer(scene);

  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });

  assert.doesNotThrow(() => renderer.loadEnemies(em.getAllEnemies()));

  // Render en estado idle
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  // Render en persecución
  enemy.state = 'chase';
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  // Render en telegrafiado
  enemy.state = 'telegraph';
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  // Render cuando está muerto (se oculta)
  enemy.isDead = true;
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  assert.doesNotThrow(() => renderer.dispose());
});

test('CANONICAL_ENEMIES: Define la Serpiente de Ceniza (Dificultad 0, 1 HP, 0.5 daño)', () => {
  const serpent = CANONICAL_ENEMIES.cave_serpent;
  assert.ok(serpent);
  assert.equal(serpent.id, 'cave_serpent');
  assert.equal(serpent.name, 'Serpiente de Ceniza');
  assert.equal(serpent.maxHp, 1);
  assert.equal(serpent.damage, 0.5);
  assert.equal(serpent.speed, 2.2);
  assert.equal(serpent.attackRange, 1.2);
  assert.equal(serpent.aggroRange, 16.0);
  assert.equal(serpent.telegraphMs, 350);
});

test('EnemyManager + CombatManager: Serpiente de Ceniza es derrotada de 1 solo golpe', () => {
  let defeatedCount = 0;
  const em = new EnemyManager({
    onEnemyDefeated: () => { defeatedCount++; },
  });
  const snake = em.spawnEnemy('cave_serpent', { x: 10.0, y: 1.0, z: 25.0 }, 'snake_1');
  assert.equal(snake.hp, 1);
  assert.equal(snake.maxHp, 1);

  const cm = new CombatManager({ enemyManager: em });
  const adventurer = new Player(0, 10.0, 1.0, 26.2, 'Adventurer', 0, 0); // x=10, z=26.2 mirando a z=25 (-Z)
  adventurer.attackCooldownMs = 0;

  const result = cm.executePlayerAttack(adventurer, 1000);
  assert.ok(result);
  assert.equal(result.hits.length, 1);
  assert.equal(result.hits[0].enemyId, 'snake_1');
  assert.equal(result.hits[0].effectiveDamage, 1);
  assert.equal(snake.hp, 0);
  assert.equal(snake.isDead, true);
  assert.equal(defeatedCount, 1);
});

test('EnemyManager + Player: Daño fraccionario de 0.5 acumula antes de restar vida', () => {
  let damagedCalls = [];
  const em = new EnemyManager({
    onPlayerDamaged: (p, dmg, e) => {
      damagedCalls.push({ dmg, enemy: e.name });
      p.damageCounter = (p.damageCounter || 0) + dmg;
      if (p.damageCounter >= 1) {
        p.damageCounter -= 1;
        p.loseLife();
      }
    },
  });

  const snake = em.spawnEnemy('cave_serpent', { x: 10.0, y: 1.0, z: 25.0 });
  const player = new Player(0, 10.0, 1.0, 25.5, 'TestPlayer');
  assert.equal(player.lives, 3);
  assert.equal(player.damageCounter, 0);

  // 1er ataque (0.5 daño): no pierde vida completa, acumula 0.5
  snake.state = 'telegraph';
  snake.telegraphTimer = 0.01;
  em.update(0.02, null, [player]);

  assert.equal(damagedCalls.length, 1);
  assert.equal(damagedCalls[0].dmg, 0.5);
  assert.equal(player.damageCounter, 0.5);
  assert.equal(player.lives, 3, 'Con 0.5 de daño no debe perder un corazón completo aún');

  // 2do ataque (0.5 daño): suma 1.0 y pierde 1 corazón
  snake.state = 'telegraph';
  snake.telegraphTimer = 0.01;
  snake.lastAttackTime = 0; // reset cooldown para test
  em.update(0.02, null, [player]);

  assert.equal(damagedCalls.length, 2);
  assert.equal(player.damageCounter, 0);
  assert.equal(player.lives, 2, 'Al acumular 1.0 de daño debe restar exactamente 1 corazón');
});

test('EnemyRenderer: Renderizado y ondulación 3D de cave_serpent', () => {
  const scene = new THREE.Scene();
  const renderer = new EnemyRenderer(scene);

  const em = new EnemyManager();
  const snake = em.spawnEnemy('cave_serpent', { x: 8.5, y: 1.0, z: 25.0 });

  assert.doesNotThrow(() => renderer.loadEnemies(em.getAllEnemies()));
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  snake.state = 'chase';
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  snake.state = 'telegraph';
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  snake.isDead = true;
  assert.doesNotThrow(() => renderer.update(0.016, em.getAllEnemies()));

  assert.doesNotThrow(() => renderer.dispose());
});

test('BaseEnemy: Deslizamiento continuo por paredes (Wall Sliding) cuando un eje está bloqueado', () => {
  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 9.0, y: 1.0, z: 20.0 });
  const player = new Player(0, 11.0, 1.0, 24.0, 'Runner'); // Diagonal (+X, +Z)

  // Muro continuo en X = 10 que bloquea el avance en X
  const mockWorld = {
    sizeX: 32,
    sizeZ: 64,
    get(bx, _by, _bz) {
      if (bx === 10) return 1; // Muro sólido
      return 0; // Aire
    },
  };

  const initialZ = enemy.z;
  const initialX = enemy.x;

  // Actualizar varios pasos de tiempo
  for (let step = 0; step < 10; step++) {
    em.update(0.05, mockWorld, [player]);
  }

  // Debe deslizarse en Z hacia el jugador sin traspasar el muro en X
  assert.ok(enemy.z > initialZ, 'El enemigo debió avanzar en Z deslizándose a lo largo del muro');
  assert.ok(enemy.x <= 9.7, 'El enemigo no debe penetrar el bloque sólido en X=10');
  assert.notEqual(enemy.x, initialX, 'Pudo ajustar posición pero respetando el muro');
});

test('BaseEnemy: Evasión de columnas y esquinas mediante sensores Whiskers', () => {
  const em = new EnemyManager();
  // Enemigo alineado frontalmente con el jugador en X=10, pero con un pilar en medio
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 10.0, y: 1.0, z: 18.0 });
  const player = new Player(0, 10.0, 1.0, 22.0, 'Target');

  // Pilar de 1 bloque justo en X=10, Z=19
  const mockWorld = {
    sizeX: 32,
    sizeZ: 64,
    get(bx, _by, bz) {
      if (bx === 10 && bz === 19) return 1; // Pilar sólido
      return 0; // Aire
    },
  };

  // Simular movimiento hacia el pilar
  for (let step = 0; step < 15; step++) {
    em.update(0.05, mockWorld, [player]);
  }

  // Los bigotes (whiskers) debieron desviarlo en X para rodear el obstáculo
  assert.notEqual(enemy.x, 10.0, 'El sensor whisker debió desviar al enemigo lateralmente para evadir el pilar');
  assert.ok(enemy.z > 18.0, 'El enemigo debió continuar progresando en Z');
});

test('BaseEnemy: Subclase personalizada hereda navegación y sobreescribe ganchos', () => {
  // Clase personalizada de prueba que hereda de BaseEnemy
  class FlyingImpEnemy extends BaseEnemy {
    constructor(template, spawnPos, id) {
      super(template, spawnPos, id);
      this.customHookCalled = false;
    }

    customCanMove(nextX, nextY, nextZ, world) {
      this.customHookCalled = true;
      // Prohibir cruzar X > 15
      return nextX <= 15.0;
    }
  }

  const imp = new FlyingImpEnemy(
    CANONICAL_ENEMIES.basalt_skitterer,
    { x: 14.5, y: 1.0, z: 20.0 },
    'imp_1'
  );

  const player = new Player(0, 20.0, 1.0, 20.0, 'FarTarget');

  imp.update(0.1, null, [player]);

  assert.ok(imp.customHookCalled, 'El gancho customCanMove debió ser invocado');
  assert.ok(imp.x <= 15.0, 'La restricción personalizada del gancho fue respetada');
  assert.equal(imp.state, 'chase');
});
