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

test('BlockRaycaster detecta la losa de presión en proximidad', () => {
  const world = new World();
  world.loadLevel(devShowroom);

  const mockCamera = new THREE.PerspectiveCamera();
  const mockVoxelMap = { mesh: new THREE.Mesh(), instToBlock: new Int32Array(10) };
  const raycaster = new BlockRaycaster(mockCamera, mockVoxelMap, world);

  // Jugador a escasa distancia de la losa (x=12.0, z=10.2)
  const target = raycaster.getProximityTarget({ x: 12.0, y: 1.0, z: 10.2 });
  assert.ok(target, 'Debe detectar un objetivo interactivo');
  assert.equal(target.type, 'pressure_plate');
  assert.equal(target.plateId, 'losa_showroom_puerta1');

  // Si la losa ya fue presionada (y la puerta abierta por su mecanismo), ya no debe detectarse pendiente
  world.pressurePlates[0].isPressed = true;
  world.openDoor(1);
  const targetAfter = raycaster.getProximityTarget({ x: 12.0, y: 1.0, z: 10.2 });
  assert.equal(targetAfter, null);
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
