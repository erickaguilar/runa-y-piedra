import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import { World } from '../src/core/World.js';
import { LevelLoader } from '../src/levels/LevelLoader.js';
import devShowroom from '../src/levels/data/dev_showroom.json' with { type: 'json' };
import {
  createPressurePlateMaterials,
  createPressurePlateGeometries,
  buildPressurePlateMesh,
  PLATE_PRESS_DEPTH,
} from '../src/render/models/props/pressurePlateModel.js';
import { PressurePlateRenderer } from '../src/render/PressurePlateRenderer.js';
import { DoorRenderer } from '../src/render/DoorRenderer.js';
import { SimulationEngine } from '../src/simulation/SimulationEngine.js';
import { Player } from '../src/entities/Player.js';
import { InteractionController } from '../src/controllers/InteractionController.js';
import { BlockRaycaster } from '../src/interaction/BlockRaycaster.js';

test('dev_showroom.json define la nueva losa de presión en la Sala Showroom vinculada a Puerta 1', () => {
  assert.ok(Array.isArray(devShowroom.pressurePlates), 'pressurePlates debe ser un array');
  assert.equal(devShowroom.pressurePlates.length >= 1, true, 'debe tener al menos una losa');

  const plate = devShowroom.pressurePlates.find(p => p.targetDoorId === 1 || p.id === 'losa_showroom_puerta1');
  assert.ok(plate, 'Debe existir una losa dirigida a la Puerta 1');
  assert.equal(plate.x, 12.0);
  assert.equal(plate.z, 10.0);
  assert.equal(plate.targetDoorId, 1);
  assert.equal(plate.action, 'open_door');
});

test('LevelLoader inicializa world.pressurePlates desde el nivel', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  assert.ok(Array.isArray(world.pressurePlates), 'world.pressurePlates debe ser un array');
  assert.equal(world.pressurePlates.length >= 1, true);

  const plate = world.pressurePlates[0];
  assert.equal(plate.id, 'losa_showroom_puerta1');
  assert.equal(plate.isPressed, false);
  assert.equal(plate.targetDoorId, 1);
});

test('Modelo 3D y PressurePlateRenderer construyen la jerarquía y animan el resorte al activarse', () => {
  const scene = new THREE.Scene();
  const renderer = new PressurePlateRenderer(scene);

  const configs = [
    {
      id: 'test_plate_1',
      x: 12,
      y: 1,
      z: 10,
      targetDoorId: 1,
      action: 'open_door',
    },
  ];

  renderer.loadPressurePlates(configs);
  assert.equal(renderer.isPressed('test_plate_1'), false);

  const plateData = renderer.plates.get('test_plate_1');
  assert.ok(plateData, 'La losa debe estar registrada en el Map');
  assert.ok(plateData.root instanceof THREE.Group);
  assert.ok(plateData.platePivot instanceof THREE.Object3D);
  assert.ok(plateData.light instanceof THREE.PointLight);

  // Activación con press()
  const pressed = renderer.press('test_plate_1');
  assert.equal(pressed, true);
  assert.equal(renderer.isPressed('test_plate_1'), true);

  // Segunda pulsación es idempotente
  assert.equal(renderer.press('test_plate_1'), false);

  // Simular paso de física y actualización del resorte
  renderer.update(0.05);
  assert.ok(plateData.platePivot.position.y < 0, 'La losa debe haberse hundido hacia abajo con el resorte');

  // Limpieza de recursos
  renderer.dispose();
  assert.equal(renderer.plates.size, 0);
  assert.equal(scene.children.length, 0);
});

test('SimulationEngine detecta cuando el jugador pisa sobre la losa e invoca onPressurePlateStep', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  let steppedPlate = null;
  let steppedPlayer = null;

  const sim = new SimulationEngine(world, {
    onPressurePlateStep: (player, plate) => {
      steppedPlayer = player;
      steppedPlate = plate;
    },
  });

  const player = new Player(1);
  // Colocar jugador directamente encima de la losa (x=12, z=10, y=1.0)
  player.pos.x = 12.0;
  player.pos.y = 1.0;
  player.pos.z = 10.0;
  player.onGround = true;

  sim.integratePlayer(player, 0.016);

  assert.ok(steppedPlate, 'Debe haber disparado onPressurePlateStep');
  assert.equal(steppedPlate.id, 'losa_showroom_puerta1');
  assert.equal(steppedPlayer, player);

  // Si el jugador se aleja, no debe activarse nuevamente
  steppedPlate = null;
  player.pos.x = 5.0;
  player.pos.y = 1.0;
  player.pos.z = 5.0;
  sim.integratePlayer(player, 0.016);
  assert.equal(steppedPlate, null);
});

test('InteractionController.pressPressurePlate abre la puerta y activa la losa con retroalimentación', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  let narrativeMsg = null;
  let playedSound = null;

  const mockGame = {
    world,
    mode: 'host',
    voxelMap: { openDoor: (id) => {} },
    doorRenderer: { openDoor: (id) => {} },
    pressurePlateRenderer: { press: (id) => true },
    playerManager: { localPlayer: new Player(0) },
    soundManager: {
      playPressurePlate: () => { playedSound = 'pressurePlate'; },
      playDoorOpen: () => {},
    },
    ui: {
      showNarrativeMessage: (msg) => { narrativeMsg = msg; },
    },
    network: {
      broadcast: (buf) => {},
    },
  };

  const controller = new InteractionController(mockGame);

  assert.equal(world.isDoor1Open, false, 'Puerta 1 debe comenzar cerrada');
  const plate = world.pressurePlates[0];
  assert.equal(plate.isPressed, false, 'Losa debe comenzar sin presionar');

  const result = controller.pressPressurePlate(plate.id);
  assert.equal(result, true, 'pressPressurePlate debe retornar true');
  assert.equal(plate.isPressed, true, 'La losa debe quedar marcada como presionada');
  assert.equal(world.isDoor1Open, true, 'La Puerta 1 debe haberse abierto');
  assert.equal(playedSound, 'pressurePlate', 'Debe haber reproducido el sonido de la losa');
  assert.ok(narrativeMsg && narrativeMsg.includes('Puerta 1'), 'Debe emitir feedback mencionando la Puerta');
});

test('El bloque pad losa se activa únicamente estando encima y NO muestra botón de interacción en BlockRaycaster', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const mockCamera = new THREE.PerspectiveCamera();
  const mockVoxelMap = { mesh: new THREE.Mesh(), instToBlock: new Int32Array(10) };
  const raycaster = new BlockRaycaster(mockCamera, mockVoxelMap, world);

  // 1. Verificar que BlockRaycaster NO activa ni muestra botón de interacción contextual para el pad losa
  const target = raycaster.getProximityTarget({ x: 12.0, y: 1.0, z: 10.2 });
  assert.notEqual(target?.type, 'pressure_plate', 'El pad losa NO debe mostrarse como botón en raycaster');
  world.openDoor(1);
  const targetWithDoorOpen = raycaster.getProximityTarget({ x: 12.0, y: 1.0, z: 10.2 });
  assert.equal(targetWithDoorOpen, null, 'No debe haber ningún botón de interacción sobre el pad');

  // 2. Verificar que se activa exclusivamente en SimulationEngine al pisar encima del pad
  let steppedPlate = null;
  const sim = new SimulationEngine(world, {
    onPressurePlateStep: (player, plate) => {
      steppedPlate = plate;
    },
  });

  const plate = world.pressurePlates.find(p => p.id === 'losa_showroom_puerta1');
  const dummyPlayer = new Player(0);

  // Fuera del pad (a 1.2 metros al lado): NO debe activarse
  dummyPlayer.pos.x = plate.x + 1.2;
  dummyPlayer.pos.y = plate.y;
  dummyPlayer.pos.z = plate.z;
  sim.integratePlayer(dummyPlayer, 0.016, 0);
  assert.equal(steppedPlate, null, 'No debe activarse si está fuera del pad');

  // Directamente encima del bloque pad: DEBE activarse
  dummyPlayer.pos.x = plate.x;
  dummyPlayer.pos.y = plate.y;
  dummyPlayer.pos.z = plate.z;
  sim.integratePlayer(dummyPlayer, 0.016, 0);
  assert.ok(steppedPlate, 'Debe activarse al situarse encima del bloque pad losa');
  assert.equal(steppedPlate.id, plate.id);
});

test('Pruebas unitarias de abrir y cerrar Puerta 3 con losas de presión en la nueva sala derecha', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  // Verificar que la Puerta 3 existe en el nivel
  const door3 = world.doors.find(d => d.id === 3);
  assert.ok(door3, 'Puerta 3 debe existir en devShowroom');
  assert.equal(door3.z, 7);

  // Verificar losas de abrir y cerrar
  const plateOpen = world.pressurePlates.find(p => p.id === 'losa_pruebas_abrir');
  const plateClose = world.pressurePlates.find(p => p.id === 'losa_pruebas_cerrar');
  assert.ok(plateOpen, 'Losa de apertura debe existir');
  assert.ok(plateClose, 'Losa de cierre debe existir');
  assert.equal(plateOpen.targetDoorId, 3);
  assert.equal(plateOpen.action, 'open_door');
  assert.equal(plateClose.targetDoorId, 3);
  assert.equal(plateClose.action, 'close_door');

  const scene = new THREE.Scene();
  const doorRenderer = new DoorRenderer(scene);
  doorRenderer.loadDoors(world.doors);

  const plateRenderer = new PressurePlateRenderer(scene);
  plateRenderer.loadPressurePlates(world.pressurePlates);

  let soundsPlayed = [];
  const mockGame = {
    world,
    mode: 'host',
    voxelMap: { openDoor: (id) => {}, closeDoor: (id) => {} },
    doorRenderer,
    pressurePlateRenderer: plateRenderer,
    playerManager: { localPlayer: new Player(0) },
    soundManager: {
      playPressurePlate: () => { soundsPlayed.push('pressurePlate'); },
      playDoorOpen: () => { soundsPlayed.push('doorOpen'); },
      playDoorClose: () => { soundsPlayed.push('doorClose'); },
    },
    ui: {
      showNarrativeMessage: () => {},
    },
    network: {
      broadcast: () => {},
    },
  };

  const controller = new InteractionController(mockGame);

  // --- 1. Estado inicial: puerta 3 cerrada ---
  assert.equal(world.isDoorOpenId(3), false, 'Puerta 3 debe iniciar cerrada');
  assert.equal(doorRenderer.isDoorOpen(3), false);

  // --- 2. Activar losa de abrir -> Puerta 3 se abre ---
  const resOpen1 = controller.pressPressurePlate(plateOpen.id);
  assert.equal(resOpen1, true, 'Losa de apertura debe activarse con éxito');
  assert.equal(world.isDoorOpenId(3), true, 'Puerta 3 debe quedar abierta en World');
  assert.equal(doorRenderer.isDoorOpen(3), true, 'Puerta 3 debe quedar abierta en DoorRenderer');
  assert.equal(plateRenderer.isPressed(plateOpen.id), true, 'Losa de abrir debe figurar presionada');
  assert.ok(soundsPlayed.includes('doorOpen'), 'Debe reproducir sonido de apertura');

  // --- 3. Activar losa de cerrar -> Puerta 3 se cierra ---
  soundsPlayed = [];
  const resClose1 = controller.pressPressurePlate(plateClose.id);
  assert.equal(resClose1, true, 'Losa de cierre debe activarse con éxito');
  assert.equal(world.isDoorOpenId(3), false, 'Puerta 3 debe quedar cerrada en World');
  assert.equal(doorRenderer.isDoorOpen(3), false, 'Puerta 3 debe quedar cerrada en DoorRenderer');
  assert.equal(plateRenderer.isPressed(plateClose.id), true, 'Losa de cerrar debe figurar presionada');
  assert.equal(plateRenderer.isPressed(plateOpen.id), false, 'Losa de abrir debe haberse rearmado (unpress)');
  assert.ok(soundsPlayed.includes('doorClose'), 'Debe reproducir sonido de cierre');

  // --- 4. Segundo ciclo de reapertura con la losa rearmada ---
  soundsPlayed = [];
  const resOpen2 = controller.pressPressurePlate(plateOpen.id);
  assert.equal(resOpen2, true, 'Losa de apertura debe poder activarse de nuevo');
  assert.equal(world.isDoorOpenId(3), true, 'Puerta 3 debe quedar abierta de nuevo');
  assert.equal(doorRenderer.isDoorOpen(3), true);
  assert.equal(plateRenderer.isPressed(plateClose.id), false, 'Losa de cerrar debe haberse rearmado');

  // --- 5. Segundo ciclo de cierre ---
  const resClose2 = controller.pressPressurePlate(plateClose.id);
  assert.equal(resClose2, true, 'Losa de cierre debe poder activarse de nuevo');
  assert.equal(world.isDoorOpenId(3), false, 'Puerta 3 debe volver a quedar cerrada');

  // Limpieza de renderers
  doorRenderer.dispose();
  plateRenderer.dispose();
});

test('Física de colisión AABB: Puerta 3 bloquea el paso cuando está cerrada y lo permite al abrirse', async () => {
  const { tryMove } = await import('../src/core/PhysicsAABB.js');
  const world = new World();
  world.loadLevel(devShowroom);

  // La Puerta 3 está en z=7, vano en x=17..18, y=1..2
  // Estado 1: Puerta CERRADA -> El jugador no puede cruzar de z=6 a z=8 a través de x=17.5
  assert.equal(world.isDoorOpenId(3), false);
  const posBlocked = { x: 17.5, y: 1.0, z: 6.2 };
  const move1 = tryMove(world, posBlocked, 0, 0, 1.2); // Intenta avanzar hacia z=7.4
  assert.equal(move1.hitZ, true, 'Debe chocar contra la Puerta 3 cerrada');
  assert.ok(posBlocked.z < 7.0, 'No debe haber cruzado el umbral de la puerta cerrada');

  // Estado 2: Puerta ABIERTA -> El jugador cruza libremente
  world.openDoor(3);
  assert.equal(world.isDoorOpenId(3), true);
  const posOpen = { x: 17.5, y: 1.0, z: 6.2 };
  const move2 = tryMove(world, posOpen, 0, 0, 1.8);
  assert.equal(move2.hitZ, false, 'No debe chocar cuando la puerta está abierta');
  assert.ok(posOpen.z > 7.0, 'Debe haber cruzado al otro lado de la puerta abierta');

  // Estado 3: Puerta CERRADA de nuevo -> Vuelve a bloquear el paso en retroceso
  world.closeDoor(3);
  assert.equal(world.isDoorOpenId(3), false);
  const posReturn = { x: 17.5, y: 1.0, z: 7.8 };
  const move3 = tryMove(world, posReturn, 0, 0, -0.6); // Intenta avanzar hacia z=7.2
  assert.equal(move3.hitZ, true, 'Debe chocar nuevamente con la puerta re-cerrada');
  assert.ok(posReturn.z > 7.0, 'No debe poder cruzar de regreso mientras la puerta esté cerrada');
});

test('dev_showroom.json define la losa de presencia continua (Hold 3D) vinculada a Puerta 3', () => {
  const plateHold = devShowroom.pressurePlates.find(p => p.id === 'losa_showroom_hold');
  assert.ok(plateHold, 'Debe existir la losa losa_showroom_hold en dev_showroom');
  assert.equal(plateHold.mode, 'hold', 'Debe estar en modo hold');
  assert.equal(plateHold.targetDoorId, 3, 'Debe apuntar a la Puerta 3');
  assert.equal(plateHold.action, 'open_door');
  assert.equal(plateHold.x, 16.0);
  assert.equal(plateHold.z, 4.5);
});

test('LevelLoader inicializa losas con mode: hold y mensajes de liberación', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const plateHold = world.pressurePlates.find(p => p.id === 'losa_showroom_hold');
  assert.ok(plateHold);
  assert.equal(plateHold.mode, 'hold');
  assert.equal(plateHold.targetDoorId, 3);
  assert.ok(plateHold.releaseMessage && (plateHold.releaseMessage.includes('liberado') || plateHold.releaseMessage.includes('salido')));
});

test('PressurePlateRenderer aplica materiales y luces esmeralda en modo hold al presionar y soltar', () => {
  const scene = new THREE.Scene();
  const renderer = new PressurePlateRenderer(scene);

  renderer.loadPressurePlates([
    {
      id: 'plate_hold_test',
      x: 16,
      y: 1,
      z: 4.5,
      mode: 'hold',
      action: 'open_door',
      targetDoorId: 3,
    },
  ]);

  const pData = renderer.plates.get('plate_hold_test');
  assert.ok(pData);
  assert.equal(pData.mode, 'hold');
  assert.equal(pData.runeMesh.material, renderer.mats.runeHoldInactive);
  assert.equal(pData.light.color.getHex(), 0x10b981);

  // Al presionar: pasa a activo esmeralda
  renderer.press('plate_hold_test');
  assert.equal(pData.runeMesh.material, renderer.mats.runeHoldActive);
  assert.equal(pData.light.color.getHex(), 0x34d399);

  // Al soltar: regresa a inactivo esmeralda
  renderer.unpress('plate_hold_test');
  assert.equal(pData.runeMesh.material, renderer.mats.runeHoldInactive);
  assert.equal(pData.light.color.getHex(), 0x10b981);

  renderer.dispose();
});

test('SimulationEngine invoca onPressurePlateStep al pisar y onPressurePlateRelease al salir de losa hold', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const steps = [];
  const releases = [];

  const sim = new SimulationEngine(world, {
    onPressurePlateStep: (player, plate) => steps.push({ player, plateId: plate.id }),
    onPressurePlateRelease: (player, plate) => releases.push({ player, plateId: plate.id }),
  });

  const plate = world.pressurePlates.find(p => p.id === 'losa_showroom_hold');
  assert.ok(plate);
  assert.equal(plate.mode, 'hold');

  const player = new Player(1);
  // Fuera de la losa
  player.pos.x = 10.0;
  player.pos.y = 1.0;
  player.pos.z = 4.5;
  sim.integratePlayer(player, 0.016);
  assert.equal(steps.length, 0);
  assert.equal(releases.length, 0);

  // 1. Entrar físicamente encima de la losa (x=16.0, z=4.5)
  player.pos.x = 16.0;
  player.pos.z = 4.5;
  sim.integratePlayer(player, 0.016);
  assert.equal(steps.length, 1, 'Debe invocar onPressurePlateStep');
  assert.equal(steps[0].plateId, 'losa_showroom_hold');
  assert.equal(plate.isPressed, true, 'La losa debe figurar como presionada');

  // 2. Permanecer encima en siguientes ticks (no dispara steps duplicados)
  sim.integratePlayer(player, 0.016);
  assert.equal(steps.length, 1);
  assert.equal(releases.length, 0);
  assert.equal(plate.isPressed, true);

  // 3. Salir de la losa (desplazarse a x=14.0)
  player.pos.x = 14.0;
  sim.integratePlayer(player, 0.016);
  assert.equal(releases.length, 1, 'Debe invocar onPressurePlateRelease');
  assert.equal(releases[0].plateId, 'losa_showroom_hold');
  assert.equal(plate.isPressed, false, 'La losa debe desactivarse al salir');

  // 4. Volver a entrar: se re-activa exitosamente
  player.pos.x = 16.0;
  sim.integratePlayer(player, 0.016);
  assert.equal(steps.length, 2, 'Debe poder re-activarse en el segundo ciclo');
  assert.equal(plate.isPressed, true);
});

test('SimulationEngine mantiene la losa hold presionada si hay múltiples jugadores y libera cuando todos salen', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const steps = [];
  const releases = [];

  const sim = new SimulationEngine(world, {
    onPressurePlateStep: (player, plate) => steps.push({ player, plateId: plate.id }),
    onPressurePlateRelease: (player, plate) => releases.push({ player, plateId: plate.id }),
  });

  const plate = world.pressurePlates.find(p => p.id === 'losa_showroom_hold');
  const player1 = new Player(1);
  const player2 = new Player(2);

  // Jugador 1 se para en la losa
  player1.pos.x = 16.0;
  player1.pos.y = 1.0;
  player1.pos.z = 4.5;
  sim.integratePlayer(player1, 0.016);
  assert.equal(steps.length, 1);
  assert.equal(plate.isPressed, true);

  // Jugador 2 también se para en la misma losa
  player2.pos.x = 16.0;
  player2.pos.y = 1.0;
  player2.pos.z = 4.5;
  sim.integratePlayer(player2, 0.016);
  assert.equal(steps.length, 1, 'Losa ya estaba presionada, no duplica evento step');
  assert.equal(plate._occupants.size, 2, 'Debe registrar 2 ocupantes');

  // Jugador 1 se retira
  player1.pos.x = 12.0;
  sim.integratePlayer(player1, 0.016);
  assert.equal(releases.length, 0, 'No debe liberarse porque Jugador 2 sigue encima');
  assert.equal(plate.isPressed, true);
  assert.equal(plate._occupants.size, 1);

  // Jugador 2 también se retira
  player2.pos.x = 12.0;
  sim.integratePlayer(player2, 0.016);
  assert.equal(releases.length, 1, 'Ahora que todos salieron, debe liberarse');
  assert.equal(plate.isPressed, false);
  assert.equal(plate._occupants.size, 0);
});

test('Ciclo interactivo completo: losa hold abre Puerta 3 al estar encima y la cierra al salir', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const scene = new THREE.Scene();
  const doorRenderer = new DoorRenderer(scene);
  doorRenderer.loadDoors(world.doors);

  const plateRenderer = new PressurePlateRenderer(scene);
  plateRenderer.loadPressurePlates(world.pressurePlates);

  let narrativeMessages = [];
  let soundsPlayed = [];

  const mockGame = {
    world,
    mode: 'host',
    voxelMap: {
      openDoor: (id) => {},
      closeDoor: (id) => {},
    },
    doorRenderer,
    pressurePlateRenderer: plateRenderer,
    playerManager: { localPlayer: new Player(0) },
    soundManager: {
      playPressurePlate: () => soundsPlayed.push('pressurePlate'),
      playDoorOpen: () => soundsPlayed.push('doorOpen'),
      playDoorClose: () => soundsPlayed.push('doorClose'),
    },
    ui: {
      showNarrativeMessage: (msg) => narrativeMessages.push(msg),
    },
    network: {
      broadcast: (buf) => {},
    },
  };

  const controller = new InteractionController(mockGame);

  // Puerta 3 inicialmente cerrada
  assert.equal(world.isDoorOpenId(3), false);
  assert.equal(plateRenderer.isPressed('losa_showroom_hold'), false);

  // 1. Jugador pisa la losa
  const pressOk = controller.pressPressurePlate('losa_showroom_hold');
  assert.equal(pressOk, true);
  assert.equal(world.isDoorOpenId(3), true, 'Puerta 3 debe abrirse');
  assert.equal(plateRenderer.isPressed('losa_showroom_hold'), true, 'Renderer debe reflejar losa presionada');
  assert.ok(soundsPlayed.includes('pressurePlate'));
  assert.ok(soundsPlayed.includes('doorOpen'));

  // 2. Jugador sale de la losa
  soundsPlayed = [];
  const releaseOk = controller.releasePressurePlate('losa_showroom_hold');
  assert.equal(releaseOk, true);
  assert.equal(world.isDoorOpenId(3), false, 'Puerta 3 debe cerrarse automáticamente');
  assert.equal(plateRenderer.isPressed('losa_showroom_hold'), false, 'Renderer debe reflejar losa rearmada (unpress)');
  assert.ok(soundsPlayed.includes('pressurePlate'));
  assert.ok(soundsPlayed.includes('doorClose'));

  doorRenderer.dispose();
  plateRenderer.dispose();
});

test('Variantes 3D de placas de presión en estilo Sumi-e y exhibición completa en Showroom', () => {
  const scene = new THREE.Scene();
  const mats = createPressurePlateMaterials();
  const geos = createPressurePlateGeometries();

  assert.ok(mats.plateStone, 'plateStone debe existir');
  assert.ok(mats.ironTrim, 'ironTrim debe existir');
  assert.ok(mats.brassRivet, 'brassRivet debe existir');
  assert.ok(geos.rivetGeo, 'rivetGeo debe existir');

  // 1. Construir variante Trigger Apertura (Ámbar)
  const plateOpen = buildPressurePlateMesh(geos, mats, { mode: 'trigger', action: 'open_door' });
  assert.ok(plateOpen.root instanceof THREE.Group);
  assert.equal(plateOpen.runeMesh.material, mats.runeInactive);

  // 2. Construir variante Trigger Cierre (Rojo Carmesí)
  const plateClose = buildPressurePlateMesh(geos, mats, { mode: 'trigger', action: 'close_door' });
  assert.ok(plateClose.root instanceof THREE.Group);
  assert.equal(plateClose.runeMesh.material, mats.runeCloseInactive);

  // 3. Construir variante Hold Presencia Continua (Verde Esmeralda)
  const plateHold = buildPressurePlateMesh(geos, mats, { mode: 'hold', action: 'open_door' });
  assert.ok(plateHold.root instanceof THREE.Group);
  assert.equal(plateHold.runeMesh.material, mats.runeHoldInactive);

  // 4. Verificar presencia de las 3 variantes en dev_showroom.json (Sala 6 y Sala 1)
  const showcaseTrigger = devShowroom.propShowcases.find(p => p.id === 'showcase_plate_trigger');
  const showcaseHold = devShowroom.propShowcases.find(p => p.id === 'showcase_plate_hold');
  const showcaseClose = devShowroom.propShowcases.find(p => p.id === 'showcase_plate_close');

  assert.ok(showcaseTrigger, 'Debe existir showcase_plate_trigger');
  assert.ok(showcaseHold, 'Debe existir showcase_plate_hold');
  assert.ok(showcaseClose, 'Debe existir showcase_plate_close');
  assert.equal(showcaseClose.x, 18.0);
  assert.equal(showcaseClose.z, 86.0);
});


