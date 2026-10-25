import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Player } from '../src/entities/Player.js';
import { CombatManager } from '../src/combat/CombatManager.js';
import { EnemyManager } from '../src/combat/EnemyManager.js';
import { closestPointOnAabb, hasLineOfSight, traceSolidSegment } from '../src/combat/combatGeometry.js';
import { COMBAT_TUNING } from '../src/config/combat.js';

/**
 * Mundo voxel mínimo para pruebas: sólidos definidos por lista de coordenadas.
 * @param {Array<[number, number, number]>} solids
 */
function makeWorld(solids) {
  const set = new Set(solids.map(([x, y, z]) => `${x},${y},${z}`));
  return {
    sizeX: 32,
    sizeZ: 64,
    get(bx, by, bz) {
      return set.has(`${bx},${by},${bz}`) ? 1 : 0;
    },
  };
}

const DUMMY_LIGHT = { minX: 7.1, maxX: 7.9, minY: 1.0, maxY: 2.8, minZ: 14.6, maxZ: 15.4 };

// ---------------------------------------------------------------------------
// Geometría compartida
// ---------------------------------------------------------------------------

test('combatGeometry: closestPointOnAabb proyecta sobre la caja y reutiliza el objeto de salida', () => {
  const out = { x: 0, y: 0, z: 0 };
  const point = closestPointOnAabb(DUMMY_LIGHT, 7.5, 2.2, 12.0, out);

  assert.equal(point, out, 'Debe reutilizar el objeto de salida para no asignar memoria');
  assert.equal(point.x, 7.5);
  assert.equal(point.y, 2.2);
  assert.equal(point.z, 14.6);
});

test('combatGeometry: hasLineOfSight detecta muros intermedios y asume visión libre sin mundo', () => {
  assert.equal(hasLineOfSight(null, 7.5, 2.2, 13.7, 7.5, 2.2, 14.6), true);

  const air = makeWorld([]);
  assert.equal(hasLineOfSight(air, 7.5, 2.2, 13.7, 7.5, 2.2, 14.6), true);

  const wall = makeWorld([[7, 2, 14]]);
  assert.equal(hasLineOfSight(wall, 7.5, 2.2, 13.7, 7.5, 2.2, 14.6), false);
});

test('combatGeometry: traceSolidSegment devuelve el primer impacto y evita atravesar bloques', () => {
  const air = makeWorld([]);
  assert.equal(traceSolidSegment(air, 7.5, 2.2, 10.0, 7.5, 2.2, 18.0), null);

  const wall = makeWorld([[7, 2, 12]]);
  const hit = traceSolidSegment(wall, 7.5, 2.2, 10.0, 7.5, 2.2, 18.0);
  assert.ok(hit, 'Debe detectar el muro');
  assert.ok(hit.z >= 12.0 && hit.z < 12.25, `Impacto esperado junto al muro, recibido z=${hit.z}`);
});

// ---------------------------------------------------------------------------
// Línea de visión en ataques cuerpo a cuerpo y AoE
// ---------------------------------------------------------------------------

test('CombatManager: el melee no atraviesa un muro intermedio', () => {
  const player = new Player(0, 7.5, 1.0, 13.7, 'Aventurero', 0, Math.PI);
  const world = makeWorld([[7, 1, 14], [7, 2, 14]]);

  // Sin muro: el golpe conecta a 0.9 m del AABB del maniquí
  const openField = new CombatManager();
  const openResult = openField.executePlayerAttack(player, 1000, null);
  assert.equal(openResult.hits.length, 1, 'Sin oclusión el golpe debe conectar');
  assert.equal(openField.getDummy('dummy_light').totalDamage, 1);

  // Con muro: el mismo golpe queda bloqueado
  const blocked = new CombatManager();
  const blockedResult = blocked.executePlayerAttack(player, 2000, world);
  assert.equal(blockedResult.hits.length, 0, 'El muro debe bloquear el filo');
  assert.equal(blocked.getDummy('dummy_light').totalDamage, 0);
  assert.equal(blocked.getDummy('dummy_light').hitCount, 0);
});

test('CombatManager: la explosión arcana AoE no daña a través de un muro', () => {
  const player = new Player(0, 7.5, 1.0, 13.4, 'Hechicero', 3, Math.PI);

  // Sin muro: el orbe impacta el maniquí y explota en área
  const openField = new CombatManager();
  const shot = openField.executePlayerAttack(player, 1000, null);
  assert.equal(shot.isProjectile, true);
  openField.update(0.05, null, 1050);
  assert.ok(
    openField.getDummy('dummy_light').totalDamage > 0,
    'Sin oclusión la explosión debe dañar al maniquí'
  );

  // Con muro: el orbe se detiene y la explosión queda ocluida
  const wall = makeWorld([[7, 1, 14], [7, 2, 14]]);
  const blocked = new CombatManager();
  blocked.executePlayerAttack(player, 2000, wall);
  blocked.update(0.05, wall, 2050);

  assert.equal(blocked.getDummy('dummy_light').totalDamage, 0, 'La AoE no debe cruzar el muro');
  assert.equal(blocked.projectiles.some(p => p.active), false, 'El orbe debe detenerse en el muro');
});

test('EnemyManager: la AoE no daña enemigos a través de un muro', () => {
  const openEm = new EnemyManager();
  const openEnemy = openEm.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  openEm.resolveAoeImpact(10.5, 2.0, 25.0, 1.5, 2, { type: 'projectile_magic' }, null, 1000, 0, null);
  assert.equal(openEnemy.hp, 1, 'Sin oclusión la explosión debe dañar al enemigo');

  const wall = makeWorld([[11, 1, 25], [11, 2, 25]]);
  const blockedEm = new EnemyManager();
  const blockedEnemy = blockedEm.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  blockedEm.resolveAoeImpact(10.5, 2.0, 25.0, 1.5, 2, { type: 'projectile_magic' }, null, 1000, 0, wall);
  assert.equal(blockedEnemy.hp, 3, 'El muro debe ocluir la explosión');
});

// ---------------------------------------------------------------------------
// Barrido continuo de proyectiles
// ---------------------------------------------------------------------------

test('CombatManager: un frame largo no permite que la flecha atraviese un muro', () => {
  const player = new Player(0, 7.5, 1.0, 10.0, 'Explorador', 2, Math.PI);
  const world = makeWorld([[7, 1, 12], [7, 2, 12]]);

  const cm = new CombatManager();
  const shot = cm.executePlayerAttack(player, 1000, world);
  assert.equal(shot.isProjectile, true);

  // 0.3 s a 22 m/s = 6.6 m de avance en un solo tick: antes se teletransportaba al otro lado
  cm.update(0.3, world, 1300);

  assert.equal(cm.getDummy('dummy_light').totalDamage, 0, 'La flecha no debe cruzar el muro');
  assert.equal(cm.projectiles.some(p => p.active), false, 'La flecha debe detenerse en el muro');
});

// ---------------------------------------------------------------------------
// Altura: agro y ataque
// ---------------------------------------------------------------------------

test('BaseEnemy: no persigue ni golpea a un jugador fuera de su altura de alcance', () => {
  let hits = 0;
  const em = new EnemyManager({ onPlayerDamaged: () => { hits += 1; } });
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  const player = new Player(1, 12.0, 4.0, 27.0, 'Escalador');

  // 3 m por encima: fuera de verticalAggroTolerance (2.5 m)
  em.update(0.1, null, [player], 1000);
  assert.equal(enemy.state, 'idle', 'No debe entrar en persecución');
  em.update(5.0, null, [player], 6000);
  assert.equal(hits, 0, 'No debe golpear a través de la altura');

  // Al mismo nivel vuelve a ser un objetivo válido
  player.pos.y = 1.0;
  em.update(0.1, null, [player], 7000);
  assert.equal(enemy.state, 'telegraph', 'Debe telegrafiar el ataque al estar a su altura');
  em.update(0.45, null, [player], 7450);
  assert.equal(hits, 1, 'Debe conectar el golpe cuando el jugador está a su altura');
});

test('BaseEnemy: el mordisco no atraviesa muros (línea de visión)', () => {
  // Serpiente y jugador a rango de mordida (1.0 m) pero con un bloque de la arena
  // entre ambos (mismo escenario que detectó el smoke cooperativo en dev_combatroom).
  const wallWorld = makeWorld([[12, 1, 25]]);
  let hits = 0;
  const em = new EnemyManager({ onPlayerDamaged: () => { hits += 1; } });
  const enemy = em.spawnEnemy('cave_serpent', { x: 12.0, y: 1.0, z: 26.0 });
  const player = new Player(1, 12.0, 1.0, 24.8, 'Emparedado');

  em.update(0.1, wallWorld, [player], 1000);
  assert.equal(enemy.state, 'telegraph', 'A rango y altura debe telegrafiar aunque haya muro');
  em.update(0.45, wallWorld, [player], 7450);
  assert.equal(hits, 0, 'El mordisco no debe conectar a través del muro');

  // Sin el muro, el mismo ataque conecta
  let hitsOpen = 0;
  const emOpen = new EnemyManager({ onPlayerDamaged: () => { hitsOpen += 1; } });
  const enemyOpen = emOpen.spawnEnemy('cave_serpent', { x: 12.0, y: 1.0, z: 26.0 });
  const playerOpen = new Player(1, 12.0, 1.0, 24.8, 'Al descubierto');
  emOpen.update(0.1, makeWorld([]), [playerOpen], 1000);
  emOpen.update(0.45, makeWorld([]), [playerOpen], 7450);
  assert.equal(hitsOpen, 1, 'A rango, altura y sin muro el mordisco conecta');
  assert.ok(enemyOpen);
});

test('BaseEnemy: el aturdimiento tiene ventana de inmunidad y no permite bloqueo infinito', () => {
  const em = new EnemyManager();
  const enemy = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 26.0 });
  enemy.hp = 50;
  const player = new Player(0, 12.0, 1.0, 24.0, 'Testigo');
  const stunWeapon = { type: 'melee_wave', stunMs: 800 };

  em.applyDamage(enemy.id, 1, stunWeapon, player, 1000);
  assert.ok(enemy.stunTimer > 0, 'El primer golpe debe aturdir');
  assert.equal(enemy.stunImmunityTimer, COMBAT_TUNING.stunImmunityMs / 1000);

  // Segundo stun dentro de la ventana: no debe reiniciar el aturdimiento
  enemy.stunTimer = 0;
  em.applyDamage(enemy.id, 1, stunWeapon, player, 1100);
  assert.equal(enemy.stunTimer, 0, 'El segundo stun debe ser ignorado por inmunidad');

  // Transcurrida la inmunidad, el aturdimiento vuelve a funcionar
  em.update(COMBAT_TUNING.stunImmunityMs / 1000 + 0.1, null, [player], 4000);
  assert.equal(enemy.stunImmunityTimer, 0);
  em.applyDamage(enemy.id, 1, stunWeapon, player, 5000);
  assert.ok(enemy.stunTimer > 0, 'Tras la ventana de inmunidad el stun vuelve a aplicarse');
});

// ---------------------------------------------------------------------------
// Separación entre enemigos
// ---------------------------------------------------------------------------

test('BaseEnemy: _computeSeparation empuja enemigos solapados y omite a los muertos', () => {
  const em = new EnemyManager();
  const a = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 20.0 });
  const b = em.spawnEnemy('basalt_skitterer', { x: 12.2, y: 1.0, z: 20.0 });

  assert.equal(a._computeSeparation([a, b]), true);
  assert.ok(a._sepX < 0, 'El empuje debe alejar a "a" de "b" en X');
  assert.ok(Math.abs(a._sepZ) < 1e-9, 'Sin desfase en Z no debe haber empuje vertical');

  b.isDead = true;
  assert.equal(a._computeSeparation([a, b]), false, 'Un enemigo muerto no debe generar separación');
});

test('EnemyManager: la persecución mantiene separados a dos enemigos que convergen', () => {
  const em = new EnemyManager();
  const a = em.spawnEnemy('basalt_skitterer', { x: 12.0, y: 1.0, z: 20.0 });
  const b = em.spawnEnemy('basalt_skitterer', { x: 12.05, y: 1.0, z: 20.0 });
  const player = new Player(0, 12.0, 1.0, 26.0, 'Cebo');

  for (let step = 0; step < 60; step++) {
    em.update(0.05, null, [player]);
  }

  const gap = Math.hypot(a.x - b.x, a.z - b.z);
  assert.ok(gap > 0.5, `Los enemigos deben separarse (gap=${gap.toFixed(2)} m)`);
});
