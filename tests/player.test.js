import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/entities/Player.js';

test('vidas iniciales e invulnerabilidad post-respawn', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  assert.equal(p.lives, 3);
  assert.equal(p.isInvulnerable, false);
  p.respawn();
  assert.ok(p.invulnTicks > 0);
});

test('orientación inicial a 180 grados (Math.PI) para mirar al frente de la mazmorra', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  assert.equal(p.yaw, Math.PI);
});

test('loseLife decrementa y detecta game over', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  assert.deepEqual(p.loseLife(), { lives: 2, gameOver: false, ignored: false });
  p.loseLife();
  const last = p.loseLife();
  assert.equal(last.lives, 0);
  assert.equal(last.gameOver, true);
});

test('loseLife se ignora durante invulnerabilidad', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  p.respawn();
  const res = p.loseLife();
  assert.equal(res.ignored, true);
  assert.equal(p.lives, 3);
});

test('recoverHeart restaura un corazón de vida hasta el máximo', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  p.loseLife(); // Quedan 2 vidas
  assert.equal(p.lives, 2);

  const heal1 = p.recoverHeart(1);
  assert.equal(heal1.recovered, 1);
  assert.equal(heal1.lives, 3);
  assert.equal(p.lives, 3);

  // Intentar curar cuando ya está lleno
  const healMax = p.recoverHeart(1);
  assert.equal(healMax.recovered, 0);
  assert.equal(healMax.lives, 3);
  assert.equal(p.lives, 3);

  // Perder 2 vidas y recuperar 1
  p.loseLife();
  p.loseLife();
  assert.equal(p.lives, 1);
  p.recoverHeart(1);
  assert.equal(p.lives, 2);
});

test('fullResetToSpawn restaura vidas y checkpoint', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  p.lives = 0;
  p.fullResetToSpawn({ x: 1, y: 1.2, z: 2 });
  assert.equal(p.lives, p.maxLives);
  assert.equal(p.pos.x, 1);
  assert.equal(p.checkpoint.x, 1);
});

test('llaves: otorgar una vez, consultar y limpiar', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  assert.equal(p.hasKey('llave_santuario'), false);
  assert.equal(p.addKey('llave_santuario'), true);
  assert.equal(p.addKey('llave_santuario'), false); // duplicada
  assert.equal(p.hasKey('llave_santuario'), true);
  p.clearKeys();
  assert.equal(p.hasKey('llave_santuario'), false);
});

test('llaves: remover/consumir llave', () => {
  const p = new Player(0, 12, 1.2, 4.5);
  p.addKey('llave_aprendiz');
  p.addKey('llave_santuario');
  assert.equal(p.removeKey('llave_desconocida'), false);
  assert.equal(p.removeKey('llave_aprendiz'), true);
  assert.equal(p.hasKey('llave_aprendiz'), false);
  assert.equal(p.hasKey('llave_santuario'), true);
  assert.equal(p.removeKey('llave_santuario'), true);
  assert.equal(p.hasKey('llave_santuario'), false);
  assert.equal(p.removeKey('llave_santuario'), false);
});

test('snapshot incluye vidas', () => {
  const p = new Player(0, 1, 2, 3);
  p.lives = 1;
  const snap = p.toSnapshot();
  assert.equal(snap.lives, 1);
  assert.equal(snap.x, 1);
});
