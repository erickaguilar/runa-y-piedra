import { test } from 'node:test';
import assert from 'node:assert/strict';

// Configurar mocks globales antes del dynamic import de InputManager (nipplejs)
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  navigator: { userAgent: 'node', maxTouchPoints: 0 }
};
globalThis.document = {
  createElement: () => ({ style: {}, appendChild: () => {}, addEventListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: () => null,
  body: { appendChild: () => {} }
};

import { World } from '../src/core/World.js';
import { Player } from '../src/entities/Player.js';
import { SoundManager } from '../src/audio/SoundManager.js';
import { HudMixin } from '../src/ui/HudManager.js';

const { InputManager } = await import('../src/input/InputManager.js');

test('dev_combatroom está registrado en LevelRegistry y aislado de la campaña', () => {
  const world = new World();
  const registry = world.levelRegistry;

  const combatLvl = registry.getLevel('dev_combatroom');
  assert.ok(combatLvl, 'dev_combatroom debe existir en el registro');
  assert.equal(combatLvl.id, 'dev_combatroom');
  assert.equal(combatLvl.isDevOnly, true);
  assert.equal(combatLvl.hiddenFromCampaign, true);

  // La campaña regular no debe incluir dev_combatroom
  const campaignLevels = registry.getAllLevels(false);
  assert.equal(campaignLevels.some(l => l.id === 'dev_combatroom'), false);

  // getAllLevels(true) debe incluir dev_combatroom
  const allLevels = registry.getAllLevels(true);
  assert.equal(allLevels.some(l => l.id === 'dev_combatroom'), true);
});

test('dev_combatroom define los 3 sectores de prueba y cofres de suministros', () => {
  const world = new World();
  const combatLvl = world.levelRegistry.getLevel('dev_combatroom');

  assert.equal(combatLvl.dimensions.sizeX, 24);
  assert.equal(combatLvl.dimensions.sizeY, 16);
  assert.equal(combatLvl.dimensions.sizeZ, 36);

  // 3 Checkpoints correspondientes a los 3 sectores
  assert.equal(combatLvl.checkpoints.length, 3);
  assert.equal(combatLvl.checkpoints[0].id, 'sector_armeria');
  assert.equal(combatLvl.checkpoints[1].id, 'sector_dummys');
  assert.equal(combatLvl.checkpoints[2].id, 'sector_arena');

  // Cofres de poción y gemas
  assert.equal(combatLvl.chests.length, 2);
  const potionChest = combatLvl.chests.find(c => c.potion?.id === 'pocion_vida');
  assert.ok(potionChest, 'Debe haber un cofre de poción de vida');
});

test('Player gestiona cooldown y activación de ataque con triggerAttack()', () => {
  const player = new Player(1);
  assert.equal(typeof player.canAttack, 'function');
  assert.equal(typeof player.triggerAttack, 'function');

  const t0 = 1000;
  assert.equal(player.canAttack(t0), true);
  assert.equal(player.triggerAttack(t0), true);
  assert.equal(player.lastAttackTime, t0);

  // Intentar atacar antes del cooldown (400 ms)
  assert.equal(player.canAttack(t0 + 200), false);
  assert.equal(player.triggerAttack(t0 + 200), false);

  // Transcurrido el cooldown
  assert.equal(player.canAttack(t0 + 400), true);
  assert.equal(player.triggerAttack(t0 + 400), true);
  assert.equal(player.lastAttackTime, t0 + 400);
});

test('SoundManager dispone de playAttack para retroalimentación sonora', () => {
  const sound = new SoundManager();
  assert.equal(typeof sound.playAttack, 'function');
  // Invocación segura sin audio context inicializado
  assert.doesNotThrow(() => sound.playAttack());
});

test('InputManager dispara onAttack con KeyF, KeyJ y clic izquierdo', () => {
  let attackCount = 0;
  let interactCount = 0;

  const listeners = {};
  const mockWindow = {
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false }),
    navigator: { userAgent: 'node', maxTouchPoints: 0 }
  };
  const mockDoc = {
    addEventListener: (evt, fn) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener: () => {},
    getElementById: () => null
  };

  const origWindow = globalThis.window;
  const origDoc = globalThis.document;
  globalThis.window = mockWindow;
  globalThis.document = mockDoc;

  try {
    const input = new InputManager({
      canvas: { addEventListener: () => {} },
      onAttack: () => { attackCount++; },
      onInteract: () => { interactCount++; }
    });

    // Simular keydown KeyF
    const keydownListeners = listeners['keydown'] || [];
    for (const fn of keydownListeners) {
      fn({ code: 'KeyF', preventDefault: () => {} });
      fn({ code: 'KeyJ', preventDefault: () => {} });
      fn({ code: 'KeyE', preventDefault: () => {} });
    }

    assert.equal(attackCount, 2, 'KeyF y KeyJ deben disparar onAttack');
    assert.equal(interactCount, 1, 'KeyE debe disparar onInteract');

    // Simular mousedown botón 0 con pointer locked
    input.pointerLocked = true;
    const mousedownListeners = listeners['mousedown'] || [];
    for (const fn of mousedownListeners) {
      fn({ button: 0 });
    }
    assert.equal(attackCount, 3, 'Clic botón 0 debe disparar onAttack cuando pointerLocked');
  } finally {
    globalThis.window = origWindow;
    globalThis.document = origDoc;
  }
});

test('HudManager gestiona visibilidad de #btn-attack con setActionButtonsVisible', () => {
  const btnAttack = { style: { display: 'none' } };
  const btnJump = { style: { display: 'none' } };
  const btnInteract = { style: { display: 'none' } };

  const origDoc = globalThis.document;
  const origWin = globalThis.window;

  globalThis.window = {
    matchMedia: () => ({ matches: true }),
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'btn-attack') return btnAttack;
      if (id === 'btn-jump') return btnJump;
      if (id === 'btn-interact') return btnInteract;
      return null;
    }
  };

  try {
    const hud = Object.create(HudMixin);
    hud.setActionButtonsVisible(true);
    assert.equal(btnAttack.style.display, 'flex');
    assert.equal(btnJump.style.display, 'flex');

    hud.setActionButtonsVisible(false);
    assert.equal(btnAttack.style.display, 'none');
    assert.equal(btnJump.style.display, 'none');
  } finally {
    globalThis.document = origDoc;
    globalThis.window = origWin;
  }
});
