import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/core/World.js';
import { Player } from '../src/entities/Player.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { DescentManager } from '../src/controllers/DescentManager.js';
import { InteractionController } from '../src/controllers/InteractionController.js';

function setup() {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const events = [];
  const sim = new SimulationEngine(world, {
    onPlayerRespawn: (p, cp, info) => events.push(info),
  });
  return { world, sim, events };
}

test('tocar lava quita 1 vida y reaparece en checkpoint', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.vel.y = 0;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events.length, 1);
  assert.equal(events[0].cause, 'lava');
  assert.equal(p.pos.x, 12);
  assert.ok(p.isInvulnerable);
});

test('muerte ignorada durante invulnerabilidad', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  // Seguir en lava pero invulnerable: sin más muertes
  p.pos.x = 5; p.pos.y = 0.0; p.pos.z = 15;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events.length, 1);
});

test('caer al vacío quita 1 vida', () => {
  const { sim, events } = setup();
  const p = new Player(0, 12, 1.2, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.pos.y = -9;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.lives, 2);
  assert.equal(events[0].cause, 'void');
});

test('tercera muerte = game over con vidas restauradas', () => {
  const { sim, events } = setup();
  const p = new Player(0, 5, 0.0, 15);
  p.setCheckpoint(12, 1.2, 4.5, 'Sala 1');
  p.lives = 1;
  p.invulnTicks = 0;
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(events[events.length - 1].gameOver, true);
  assert.equal(p.lives, p.maxLives);
});

test('sensor de escalinata notifica sin quitar vidas', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  // Abrir fosa mínima a mano para el test
  world.stairwells = [{ x1: 11, x2: 12, z1: 31, z2: 33, triggerY: 0.75, open: true }];
  const touched = [];
  const sim = new SimulationEngine(world, { onStairTouch: (p, w) => touched.push(w) });
  const p = new Player(0, 11.5, 0.5, 32);
  p.invulnTicks = 60; // invulnerable: ni la lava/abismo lo tocan, el sensor sí
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(touched.length, 1);
  assert.equal(p.lives, 3);
});

test('isTransitioning congela física, evita muertes y caídas al vacío durante transiciones', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  let inTrans = true;
  const events = [];
  const sim = new SimulationEngine(world, {
    isTransitioning: () => inTrans,
    onPlayerRespawn: (p, cp, info) => events.push(info),
  });
  const p = new Player(1, 12, -9.0, 32);
  p.vel.y = -20;
  p.inputForward = 1;

  // Con transición activa, no debe caer, no debe morir y velocidades se anulan
  sim.integratePlayer(p, 1 / 30, 0);
  assert.equal(p.vel.y, 0, 'vel.y debe anularse');
  assert.equal(p.pos.y, -9.0, 'pos no debe alterarse por gravedad ni void');
  assert.equal(events.length, 0, 'no debe disparar muerte');
  assert.equal(p.lives, 3, 'no debe perder vidas');
});

test('killPlayer descarta checkpoints de niveles anteriores y usa el spawn del nivel actual', () => {
  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('dungeon_classic'));
  const events = [];
  const sim = new SimulationEngine(world, {
    onPlayerRespawn: (p, cp, info) => events.push(info),
  });
  const p = new Player(1, 12, 1.2, 19.5);
  // Checkpoint obsoleto traído del tutorial
  p.setCheckpoint(12.0, 1.2, 19.5, 'Sala B (Descenso)', 'lobby_tutorial');
  p.invulnTicks = 0;

  // Forzar muerte en dungeon_classic
  sim.killPlayer(p, 'lava');
  assert.equal(events.length, 1);
  // Debe haber reaparecido en el spawn de dungeon_classic (x=12, z=4.5), NO en 19.5
  assert.equal(p.pos.x, 12.0);
  assert.equal(p.pos.z, 4.5, 'Debe reaparecer en spawn del nivel actual, nunca en z=19.5 del tutorial');
  assert.equal(p.checkpoint.levelId, 'dungeon_classic');
});

test('DescentManager orquesta descenso sincronizado a 5 segundos con notificación unificada', () => {
  const countdowns = [];
  let narrativeCleared = false;
  const narrativeMessages = [];
  const broadcasts = [];
  const mockPlayer = new Player(0, 11.5, 0.5, 32);
  mockPlayer.name = 'Guerrero';

  const mockGame = {
    mode: 'host',
    playerManager: {
      getAllPlayers: () => [mockPlayer],
    },
    world: {
      stairsOpen: true,
      levelRegistry: {
        getAllLevels: () => [
          { id: 'lobby_tutorial', name: 'Lobby' },
          { id: 'dungeon_classic', name: 'Mazmorra Clásica' },
        ],
        getCurrentLevel: () => ({ id: 'lobby_tutorial' }),
      },
    },
    interaction: {
      isTransitioning: () => false,
    },
    network: {
      broadcast: (buf) => broadcasts.push(buf),
    },
    ui: {
      hideNarrativeMessage: () => { narrativeCleared = true; },
      showDescentCountdown: (cfg) => { countdowns.push(cfg); },
      showNarrativeMessage: (msg) => { narrativeMessages.push(msg); },
      hideDescent: () => {},
      showLevelTransition: () => {},
    },
    soundManager: {
      playDescentEcho: () => {},
    },
    switchLevel: () => {},
  };

  const descent = new DescentManager(mockGame);
  assert.equal(descent.active, false);

  descent.startCountdown(mockPlayer);
  assert.equal(descent.active, true);
  assert.equal(narrativeCleared, true);
  // Unificado: NO emite tarjetas narrativas redundantes
  assert.equal(narrativeMessages.length, 0);
  assert.equal(countdowns.length, 1);
  assert.equal(countdowns[0].byName, 'Guerrero');
  // Cuenta atrás configurada a exactamente 5000ms
  const diff = countdowns[0].endsAtMs - Date.now();
  assert.ok(diff >= 4700 && diff <= 5100, `Debe durar ~5000ms (obtenido ${diff}ms)`);

  descent.reset();
  assert.equal(descent.active, false);
});

test('openStairsCeremony abre la escalinata sin congelar al jugador (isTransitioning es false)', () => {
  let narrativeMsg = '';
  let stairsOpened = false;

  const world = new World();
  world.loadLevel(world.levelRegistry.getLevel('lobby_tutorial'));
  world.stairsOpen = false;

  const mockGame = {
    mode: 'host',
    world,
    voxelMap: {
      removeBlock: () => {},
      addBlock: () => {},
      setColor: () => {},
      setTint: () => {},
    },
    stairsRenderer: {
      open: () => { stairsOpened = true; },
    },
    soundManager: {
      playSlabGrind: () => {},
    },
    ui: {
      showNarrativeMessage: (msg) => { narrativeMsg = msg; },
    },
  };

  const ctrl = new InteractionController(mockGame);
  assert.equal(ctrl.isTransitioning(), false);

  ctrl.openStairsCeremony();

  // La losa y fosa quedan abiertas
  assert.equal(mockGame.world.stairsOpen, true);
  assert.equal(mockGame.world.stairwells[0].open, true);
  assert.equal(stairsOpened, true);
  assert.ok(narrativeMsg.includes('losa cede'));

  // CRÍTICO: el jugador NO se congela (isTransitioning permanece false para movimiento libre)
  assert.equal(ctrl.isTransitioning(), false);
});

