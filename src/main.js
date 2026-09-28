import * as THREE from 'three';
import QRCode from 'qrcode';
import { SceneManager } from './render/SceneManager.js';
import { VoxelMap } from './render/VoxelMap.js';
import { AvatarRenderer } from './render/AvatarRenderer.js';
import { World, WORLD_X, WORLD_Z, BLOCK_DIRT } from './core/World.js';
import { NetworkManager } from './network/NetworkManager.js';
import * as Proto from './network/Protocol.js';
import { GameLoop } from './core/GameLoop.js';
import { TouchControls } from './ui/TouchControls.js';
import { tryMove } from './core/PhysicsAABB.js';

// ==== Constantes de gameplay ====
const SPEED = 5.2;
const JUMP_VELOCITY = 7.2;
const GRAVITY = -20;
const INPUT_HZ = 30;
const SNAPSHOT_HZ = 20;

// ==== Núcleo ====
const canvas = document.getElementById('canvas');
const uiEl = document.getElementById('ui');
const crosshair = document.getElementById('crosshair');

const sceneManager = new SceneManager(canvas);
const world = new World();
const voxelMap = new VoxelMap(sceneManager.scene, world);
const avatars = new AvatarRenderer(sceneManager.scene);
const network = new NetworkManager();

// Jugador local (host = 0, cliente recibe su id en el INIT)
const local = {
  id: 0,
  pos: { x: WORLD_X / 2 + 0.5, y: 4.1, z: WORLD_Z / 2 + 0.5 },
  vel: { x: 0, y: 0, z: 0 },
  yaw: 0,
  pitch: 0,
  onGround: false,
  inputForward: 0,
  inputRight: 0,
};

let mode = null;                       // 'host' | 'client'
const hostPlayers = new Map();         // host: id -> player
hostPlayers.set(0, local);
const connToPlayerId = new Map();      // host: conn -> playerId
let nextPlayerId = 1;

// ==== Input (teclado + táctil) ====
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup',   (e) => { keys[e.code] = false; });

let pendingJump = false;
const touch = new TouchControls(document.body, {
  onJump:    () => { pendingJump = true; },
  onPlace:   () => onPlace(),
  onDestroy: () => onDestroy(),
});

// Mouse-look con pointer lock (solo desktop)
let pointerLocked = false;
canvas.addEventListener('click', () => {
  if (mode && !matchMedia('(pointer: coarse)').matches) canvas.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
});
document.addEventListener('mousemove', (e) => {
  if (!pointerLocked) return;
  local.yaw   -= e.movementX * 0.0022;
  local.pitch -= e.movementY * 0.0022;
  local.pitch = Math.max(-1.55, Math.min(1.55, local.pitch));
});

// Touch-look (mitad derecha de la pantalla)
let lookId = null, lookX = 0, lookY = 0;
canvas.addEventListener('touchstart', (e) => {
  if (lookId !== null) return;
  for (const t of e.changedTouches) {
    if (t.clientX > window.innerWidth * 0.45) {
      lookId = t.identifier; lookX = t.clientX; lookY = t.clientY; break;
    }
  }
}, { passive: true });
canvas.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === lookId) {
      local.yaw   -= (t.clientX - lookX) * 0.006;
      local.pitch -= (t.clientY - lookY) * 0.006;
      local.pitch = Math.max(-1.55, Math.min(1.55, local.pitch));
      lookX = t.clientX; lookY = t.clientY;
    }
  }
}, { passive: true });
canvas.addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) if (t.identifier === lookId) lookId = null;
}, { passive: true });

// ==== Interacción con bloques ====
const _ray = new THREE.Raycaster();
const _center = new THREE.Vector2(0, 0);

function raycastTargetBlock() {
  _ray.setFromCamera(_center, sceneManager.camera);
  const hits = _ray.intersectObject(voxelMap.mesh, false);
  if (!hits.length) return null;
  const hit = hits[0];
  const bIdx = voxelMap.instToBlock[hit.instanceId];
  if (bIdx === -1) return null;
  const { x, y, z } = VoxelMap.blockIndexToXYZ(bIdx);
  return { x, y, z, normal: hit.face.normal };
}

function onDestroy() {
  if (!mode) return;
  const t = raycastTargetBlock();
  if (!t) return;
  applyBlockEdit(0, t.x, t.y, t.z);
}

function onPlace() {
  if (!mode) return;
  const t = raycastTargetBlock();
  if (!t) return;
  const x = t.x + t.normal.x;
  const y = t.y + t.normal.y;
  const z = t.z + t.normal.z;
  if (!world.inBounds(x, y, z)) return;
  applyBlockEdit(1, x, y, z);
}

function applyBlockEdit(action, x, y, z) {
  if (mode === 'host') {
    _applyBlockEditLocal(action, x, y, z);
    network.broadcast(Proto.serializeBlock(action, x, y, z));
  } else {
    network.sendToHost(Proto.serializeBlock(action, x, y, z));
  }
}

function _applyBlockEditLocal(action, x, y, z) {
  // Evitar romper los muros perimetrales que delimitan el escenario
  if (action === 0 && world.isBorder(x, z) && y >= 4) {
    return;
  }

  if (action === 0) {
    if (world.get(x, y, z) !== 0) {
      world.set(x, y, z, 0);
      voxelMap.removeBlock(x, y, z);
    }
  } else {
    if (world.get(x, y, z) === 0) {
      world.set(x, y, z, BLOCK_DIRT);
      voxelMap.addBlock(x, y, z, BLOCK_DIRT);
    }
  }
}

// ==== Handlers de red ====
network.addEventListener('peer-joined', (e) => {
  const conn = e.detail.conn;
  const pid = nextPlayerId++;
  connToPlayerId.set(conn, pid);
  hostPlayers.set(pid, {
    id: pid,
    pos: { x: WORLD_X / 2 + 0.5, y: 4.1, z: WORLD_Z / 2 + 3.5 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: Math.PI,
    onGround: false,
    inputForward: 0, inputRight: 0,
  });
  // Enviamos INIT con el mundo + id asignado
  network.sendTo(conn, Proto.serializeInit(world.blocks, pid));
  avatars.setTarget(pid, WORLD_X / 2 + 0.5, 4.1, WORLD_Z / 2 + 3.5, Math.PI, colorFor(pid));
});

network.addEventListener('peer-left', (e) => {
  const pid = connToPlayerId.get(e.detail.conn);
  if (pid === undefined) return;
  hostPlayers.delete(pid);
  avatars.remove(pid);
  connToPlayerId.delete(e.detail.conn);
});

network.addEventListener('input', (e) => {
  if (mode !== 'host') return;
  const pid = connToPlayerId.get(e.detail.conn);
  const p = hostPlayers.get(pid);
  if (!p) return;
  p.inputForward = e.detail.dz;
  p.inputRight   = e.detail.dx;
  p.yaw          = e.detail.yaw;
});

network.addEventListener('block-edit', (e) => {
  if (mode !== 'host') return;
  const { action, x, y, z } = e.detail;
  _applyBlockEditLocal(action, x, y, z);
  network.broadcast(Proto.serializeBlock(action, x, y, z));
});

network.addEventListener('snapshot', (e) => {
  if (mode !== 'client') return;
  for (const p of e.detail) {
    if (p.id === local.id) continue;
    avatars.setTarget(p.id, p.x, p.y, p.z, p.yaw, colorFor(p.id));
  }
});

network.addEventListener('init', (e) => {
  world.setFromArray(e.detail.blocks);
  voxelMap.rebuildFromWorld();
  local.id = e.detail.playerId;
});

function colorFor(id) {
  const palette = [0xff5252, 0x4fc3f7, 0xffb74d, 0xab47bc, 0x66bb6a, 0xfff176];
  return palette[id % palette.length];
}

// ==== Simulación ====
function _integratePlayer(p, dt) {
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
  const rx =  Math.cos(p.yaw), rz = -Math.sin(p.yaw);
  p.vel.x = (fx * p.inputForward + rx * p.inputRight) * SPEED;
  p.vel.z = (fz * p.inputForward + rz * p.inputRight) * SPEED;

  p.vel.y += GRAVITY * dt;
  if (p.vel.y < -40) p.vel.y = -40;

  const r = tryMove(world, p.pos, p.vel.x * dt, p.vel.y * dt, p.vel.z * dt);
  if (r.onGround) {
    p.onGround = true;
    if (p.vel.y < 0) p.vel.y = 0;
  } else p.onGround = false;

  // Rescate de seguridad: si cae al vacío por algún motivo, reaparece en la arena
  if (p.pos.y < -5) {
    p.pos.x = WORLD_X / 2 + 0.5;
    p.pos.y = 4.1;
    p.pos.z = WORLD_Z / 2 + 0.5;
    p.vel.x = 0;
    p.vel.y = 0;
    p.vel.z = 0;
  }
}

function hostSimulation(dt) {
  const kf = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
  const kr = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
  const joy = touch.getMovement();
  let f = kf + joy.y;
  let r = kr + joy.x;
  const mag = Math.hypot(f, r);
  if (mag > 1) { f /= mag; r /= mag; }
  local.inputForward = f;
  local.inputRight = r;

  if ((pendingJump || keys['Space']) && local.onGround) {
    local.vel.y = JUMP_VELOCITY;
    local.onGround = false;
  }
  pendingJump = false;

  for (const p of hostPlayers.values()) _integratePlayer(p, dt);
}

function clientSimulation(dt) {
  const kf = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
  const kr = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
  const joy = touch.getMovement();
  let f = kf + joy.y;
  let r = kr + joy.x;
  const mag = Math.hypot(f, r);
  if (mag > 1) { f /= mag; r /= mag; }
  local.inputForward = f;
  local.inputRight = r;

  if ((pendingJump || keys['Space']) && local.onGround) {
    local.vel.y = JUMP_VELOCITY;
    local.onGround = false;
  }
  pendingJump = false;

  _integratePlayer(local, dt);
}

// ==== Cámara ====
const _lookAt = new THREE.Vector3();
function updateCamera() {
  const cam = sceneManager.camera;
  cam.position.set(local.pos.x, local.pos.y + 1.6, local.pos.z);
  const cp = Math.cos(local.pitch);
  _lookAt.set(
    cam.position.x - Math.sin(local.yaw) * cp,
    cam.position.y + Math.sin(local.pitch),
    cam.position.z - Math.cos(local.yaw) * cp
  );
  cam.lookAt(_lookAt);
}

// ==== Loop principal ====
const loop = new GameLoop({
  tickHz: 30,
  onTick: (dt) => {
    if (mode === 'host') hostSimulation(dt);
    else if (mode === 'client') clientSimulation(dt);
  },
  onRender: (dt) => {
    if (mode) {
      updateCamera();
      avatars.update(dt);
    }
    sceneManager.render();
  },
});

// ==== Bucle de envío de inputs (cliente → host) ====
setInterval(() => {
  if (mode !== 'client') return;
  network.sendToHost(Proto.serializeInput(
    local.inputRight,
    local.inputForward,
    local.yaw
  ));
}, 1000 / INPUT_HZ);

// ==== Bucle de broadcast de snapshots (host → clientes) ====
setInterval(() => {
  if (mode !== 'host') return;
  const list = [];
  for (const p of hostPlayers.values()) {
    list.push({ id: p.id, x: p.pos.x, y: p.pos.y, z: p.pos.z, yaw: p.yaw });
  }
  network.broadcast(Proto.serializeSnapshot(list));

  for (const p of hostPlayers.values()) {
    if (p.id === 0) continue;
    avatars.setTarget(p.id, p.pos.x, p.pos.y, p.pos.z, p.yaw, colorFor(p.id));
  }
}, 1000 / SNAPSHOT_HZ);

// ==== UI de arranque ====
function showMenu() {
  uiEl.innerHTML = `
    <div class="menu">
      <h1>VOXEL SANDBOX · P2P</h1>
      <button id="btn-host">Crear Sala</button>
      <div style="margin-top:16px">
        <input id="pin-input" placeholder="0000" maxlength="4" inputmode="numeric" />
        <button id="btn-join" style="background:#3b82f6">Unirse</button>
      </div>
      <div class="status" id="status"></div>
    </div>`;
  document.getElementById('btn-host').onclick = onHost;
  document.getElementById('btn-join').onclick = onJoin;
  document.getElementById('pin-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onJoin();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const joinParam = urlParams.get('join');
  if (joinParam) {
    document.getElementById('pin-input').value = joinParam;
    setTimeout(() => onJoin(), 300);
  }
}

async function onHost() {
  const s = document.getElementById('status');
  s.textContent = 'Creando sala...';
  try {
    const pin = await network.host();
    mode = 'host';
    crosshair.style.display = 'block';

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const hostAddr = isLocal ? '192.168.100.28:5173' : window.location.host;
    const joinUrl = `${window.location.protocol}//${hostAddr}/?join=${pin}`;

    uiEl.innerHTML = `
      <div class="menu">
        <h1>PIN DE SALA</h1>
        <div style="font-size:38px;letter-spacing:8px;font-weight:700;margin:10px 0">${pin}</div>
        <canvas id="qr-canvas"></canvas>
        <div style="font-size:12px;color:#aaa">Escanea o comparte el PIN</div>
        <button id="btn-close-menu" style="margin-top:12px;background:#3b82f6;font-size:13px;padding:8px 16px;">Jugar</button>
      </div>`;

    const qrCanvas = document.getElementById('qr-canvas');
    if (qrCanvas) {
      QRCode.toCanvas(qrCanvas, joinUrl, { width: 140, margin: 1 });
    }

    document.getElementById('btn-close-menu')?.addEventListener('click', () => {
      uiEl.innerHTML = '';
    });
    setTimeout(() => { if (mode === 'host' && uiEl.innerHTML.includes('PIN DE SALA')) uiEl.innerHTML = ''; }, 12000);
  } catch (e) {
    s.textContent = 'Error: ' + (e?.message || e);
  }
}

async function onJoin() {
  const pin = document.getElementById('pin-input').value.trim();
  const s = document.getElementById('status');
  if (!/^\d{4}$/.test(pin)) { s.textContent = 'PIN inválido (4 dígitos)'; return; }
  s.textContent = 'Conectando...';
  try {
    await network.join(pin);
    mode = 'client';
    crosshair.style.display = 'block';
    uiEl.innerHTML = '';
  } catch (e) {
    s.textContent = 'Error: ' + (e?.message || e);
  }
}

showMenu();
loop.start();
