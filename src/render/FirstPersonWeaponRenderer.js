// src/render/FirstPersonWeaponRenderer.js
import * as THREE from 'three';
import { buildHeroWeaponMesh } from './models/heroes/heroWeapons.js';

const HERO_NAMES = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];

const FP_CONFIGS = {
  adventurer: { pos: [0.26, -0.22, -0.46], rot: [-0.65, -0.20, 0.10], scale: 0.65 },
  paladin:    { pos: [0.28, -0.24, -0.50], rot: [-0.60, -0.22, 0.08], scale: 0.58 },
  ranger:     { pos: [0.24, -0.20, -0.44], rot: [-0.15, Math.PI - 0.20, 0.15], scale: 0.62 },
  wizard:     { pos: [0.28, -0.26, -0.48], rot: [-0.55, -0.18, 0.06], scale: 0.55 },
  guardian:   { pos: [0.26, -0.22, -0.46], rot: [-0.60, -0.22, 0.10], scale: 0.60 },
};

const HERO_COLORS = {
  adventurer: 0x38bdf8,
  paladin: 0xf43f5e,
  ranger: 0x10b981,
  wizard: 0xa855f7,
  guardian: 0xfbbf24,
};

const GRIP_OFFSETS = {
  adventurer: { gripY: -0.09, armRotX: -0.55, armRotZ: 0.25 },
  paladin:    { gripY: -0.15, armRotX: -0.55, armRotZ: 0.22 },
  ranger:     { gripY:  0.00, armRotX: -0.40, armRotZ: 0.20 },
  wizard:     { gripY:  0.20, armRotX: -0.50, armRotZ: 0.18 },
  guardian:   { gripY:  0.12, armRotX: -0.55, armRotZ: 0.22 },
};

let _sharedArmGeo = null;
function getArmGeometries() {
  if (!_sharedArmGeo) {
    const forearm = new THREE.BoxGeometry(0.08, 0.30, 0.08);
    const hand = new THREE.BoxGeometry(0.09, 0.08, 0.09);
    forearm.userData = { isShared: true };
    hand.userData = { isShared: true };
    _sharedArmGeo = { forearm, hand };
  }
  return _sharedArmGeo;
}

const _armMatCache = new Map();
function getArmMaterials(heroKey) {
  if (_armMatCache.has(heroKey)) return _armMatCache.get(heroKey);
  const colorHex = HERO_COLORS[heroKey] || HERO_COLORS.adventurer;
  const sleeveMat = new THREE.MeshLambertMaterial({ color: colorHex });
  const handColor = (heroKey === 'paladin' || heroKey === 'guardian') ? 0x64748b : 0xd9b48a;
  const handMat = new THREE.MeshLambertMaterial({ color: handColor });
  sleeveMat.userData = { isShared: true };
  handMat.userData = { isShared: true };
  const mats = { sleeveMat, handMat };
  _armMatCache.set(heroKey, mats);
  return mats;
}

function buildHeroArmMesh(heroKey) {
  const G = getArmGeometries();
  const M = getArmMaterials(heroKey);
  const armGroup = new THREE.Group();
  armGroup.name = `Arm_${heroKey}`;

  const grip = GRIP_OFFSETS[heroKey] || GRIP_OFFSETS.adventurer;

  // Mano sujetando la empuñadura
  const handMesh = new THREE.Mesh(G.hand, M.handMat);
  handMesh.position.set(0, grip.gripY, 0);
  handMesh.frustumCulled = false;
  handMesh.renderOrder = 9999;
  handMesh.onBeforeRender = (renderer) => {
    renderer.clearDepth?.();
  };
  armGroup.add(handMesh);

  // Antebrazo extendiéndose hacia la esquina inferior derecha
  const forearmMesh = new THREE.Mesh(G.forearm, M.sleeveMat);
  forearmMesh.position.set(0.06, grip.gripY - 0.18, 0.14);
  forearmMesh.rotation.set(grip.armRotX, 0, grip.armRotZ);
  forearmMesh.frustumCulled = false;
  forearmMesh.renderOrder = 9999;
  forearmMesh.onBeforeRender = (renderer) => {
    renderer.clearDepth?.();
  };
  armGroup.add(forearmMesh);

  return armGroup;
}

/**
 * Renderizador de arma y extremidad en primera persona (Viewmodel cinemático).
 * Mantiene el arma de clase y brazo visibles en la esquina inferior derecha de la pantalla
 * con cinemática procedural continua: respiración idle, balanceo de paso (bobbing),
 * inercia de giro de cámara (look sway), física de salto/aterrizaje y animaciones de ataque canónicas.
 */
export class FirstPersonWeaponRenderer {
  /**
   * @param {THREE.Camera} camera
   */
  constructor(camera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'FirstPersonWeaponViewmodel';

    this.currentHeroId = null;
    this.currentHeroKey = 'adventurer';
    this.currentWeaponMesh = null;
    this.currentArmMesh = null;
    this.crystalMesh = null;

    // Configuración base fija
    this.basePos = new THREE.Vector3();
    this.baseRot = new THREE.Euler(0, 0, 0, 'YXZ');
    this.baseScale = new THREE.Vector3(1, 1, 1);

    // Estado cinemático procedural (Zero-GC)
    this.swayPos = new THREE.Vector3();
    this.swayRot = new THREE.Euler(0, 0, 0, 'YXZ');
    this.idlePhase = 0;
    this.walkPhase = 0;
    this.lastYaw = 0;
    this.lastPitch = 0;
    this.jumpOffset = 0;
    this.landingImpact = 0;
    this.wasOnGround = true;

    // Estado de ataque canónico
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.35;
    this.lastProcessedAttackTime = 0;

    this.camera.add(this.group);
    this.group.visible = false;
  }

  /**
   * Actualiza el arma y brazo visibles según el héroe seleccionado con pose ergonómica propia.
   * @param {string|number} heroIdOrIndex
   */
  setHero(heroIdOrIndex) {
    if (this.currentHeroId === heroIdOrIndex && this.currentWeaponMesh) return;
    this.currentHeroId = heroIdOrIndex;

    const heroKey = typeof heroIdOrIndex === 'number'
      ? HERO_NAMES[heroIdOrIndex] || 'adventurer'
      : (heroIdOrIndex || 'adventurer');
    this.currentHeroKey = heroKey;

    const cfg = FP_CONFIGS[heroKey] || FP_CONFIGS.adventurer;
    this.basePos.set(...cfg.pos);
    this.baseRot.set(...cfg.rot);
    this.baseScale.set(cfg.scale, cfg.scale, cfg.scale);

    this.group.position.copy(this.basePos);
    this.group.rotation.copy(this.baseRot);
    this.group.scale.copy(this.baseScale);

    if (this.currentWeaponMesh) {
      this.group.remove(this.currentWeaponMesh);
      this.currentWeaponMesh = null;
    }
    if (this.currentArmMesh) {
      this.group.remove(this.currentArmMesh);
      this.currentArmMesh = null;
    }
    this.crystalMesh = null;

    // 1. Malla del arma
    this.currentWeaponMesh = buildHeroWeaponMesh(heroIdOrIndex);
    this.currentWeaponMesh.renderOrder = 9999;
    this.currentWeaponMesh.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        child.renderOrder = 9999;
        child.onBeforeRender = (renderer) => {
          renderer.clearDepth?.();
        };
        if (heroKey === 'wizard' && child.geometry?.type === 'OctahedronGeometry') {
          this.crystalMesh = child;
        }
      }
    });
    this.group.add(this.currentWeaponMesh);

    // 2. Malla del brazo/antebrazo del héroe
    this.currentArmMesh = buildHeroArmMesh(heroKey);
    this.group.add(this.currentArmMesh);
  }

  /**
   * Controla la visibilidad del arma en pantalla.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.group.visible = !!visible;
  }

  /**
   * Inicia la animación procedimental de ataque con cadencia del arma.
   * @param {Object} [weapon]
   */
  triggerAttack(weapon = null) {
    this.isAttacking = true;
    this.attackTimer = 0;
    const cooldownMs = weapon?.cooldownMs || 350;
    // La duración visual cubre el 85% del cooldown para estar lista para el siguiente golpe
    this.attackDuration = Math.max(0.20, (cooldownMs / 1000) * 0.85);
  }

  /**
   * Actualiza las capas de animación procedural en cada frame (Zero-GC).
   * @param {number} dt Delta time en segundos
   * @param {Object} player Instancia del jugador local
   */
  update(dt, player) {
    if (!this.group.visible || !player) return;

    const safeDt = Math.min(Math.max(dt, 1e-4), 0.05);

    // Sincronizar disparo de ataque si no se invocó triggerAttack directamente
    if (player.lastAttackTime && player.lastAttackTime > this.lastProcessedAttackTime) {
      this.lastProcessedAttackTime = player.lastAttackTime;
      this.triggerAttack(player.weapon);
    }

    // 1. Inercia de giro (Look Sway)
    let dYaw = player.yaw - this.lastYaw;
    while (dYaw > Math.PI) dYaw -= Math.PI * 2;
    while (dYaw < -Math.PI) dYaw += Math.PI * 2;
    const curPitch = player.pitch || 0;
    const dPitch = curPitch - this.lastPitch;
    this.lastYaw = player.yaw;
    this.lastPitch = curPitch;

    const maxSway = 0.25;
    const targetSwayX = Math.max(-maxSway, Math.min(maxSway, -dYaw)) * 0.05;
    const targetSwayY = Math.max(-maxSway, Math.min(maxSway, -dPitch)) * 0.04;
    const targetSwayRotZ = Math.max(-maxSway, Math.min(maxSway, dYaw)) * 0.12;
    const targetSwayRotX = Math.max(-maxSway, Math.min(maxSway, -dPitch)) * 0.08;

    const swayLerp = Math.min(1.0, safeDt * 14.0);
    this.swayPos.x += (targetSwayX - this.swayPos.x) * swayLerp;
    this.swayPos.y += (targetSwayY - this.swayPos.y) * swayLerp;
    this.swayRot.z += (targetSwayRotZ - this.swayRot.z) * swayLerp;
    this.swayRot.x += (targetSwayRotX - this.swayRot.x) * swayLerp;

    // 2. Respiración en reposo (Idle Breathing)
    this.idlePhase += safeDt * 1.8;
    const idleY = Math.sin(this.idlePhase) * 0.003;
    const idleX = Math.cos(this.idlePhase * 0.9) * 0.0015;
    const idleRotZ = Math.cos(this.idlePhase * 0.9) * 0.005;
    const idleRotX = Math.sin(this.idlePhase) * 0.004;

    // 3. Balanceo de paso (Walk Bobbing)
    let bobX = 0;
    let bobY = 0;
    let bobRotX = 0;
    let bobRotZ = 0;

    const speed = player.vel ? Math.hypot(player.vel.x, player.vel.z) : 0;
    const onGround = player.onGround !== undefined ? player.onGround : true;

    if (speed > 0.15 && onGround) {
      this.walkPhase += safeDt * (speed * 2.6 + 1.8);
      bobX = Math.sin(this.walkPhase * 0.5) * Math.min(0.016, speed * 0.003);
      bobY = -Math.abs(Math.sin(this.walkPhase * 0.5)) * Math.min(0.014, speed * 0.0026);
      bobRotZ = Math.sin(this.walkPhase * 0.5) * Math.min(0.03, speed * 0.005);
      bobRotX = Math.cos(this.walkPhase) * Math.min(0.018, speed * 0.0035);
    }

    // 4. Inercia de salto y caída
    const vy = player.vel?.y || 0;
    if (!onGround) {
      const targetJump = Math.max(-0.035, Math.min(0.025, -vy * 0.003));
      this.jumpOffset += (targetJump - this.jumpOffset) * Math.min(1.0, safeDt * 8.0);
    } else {
      this.jumpOffset += (0 - this.jumpOffset) * Math.min(1.0, safeDt * 10.0);
      if (!this.wasOnGround) {
        this.landingImpact = -0.032; // Rebote elástico al aterrizar
      }
    }
    this.landingImpact += (0 - this.landingImpact) * Math.min(1.0, safeDt * 12.0);
    this.wasOnGround = onGround;

    // 5. Animación canónica de ataque por héroe
    let atkX = 0;
    let atkY = 0;
    let atkZ = 0;
    let atkRotX = 0;
    let atkRotY = 0;
    let atkRotZ = 0;

    if (this.isAttacking) {
      this.attackTimer += safeDt;
      const p = Math.min(1.0, this.attackTimer / this.attackDuration);
      const heroKey = this.currentHeroKey || 'adventurer';

      if (heroKey === 'adventurer') {
        // Estocada ágil y corte frontal
        if (p < 0.20) {
          const t = p / 0.20;
          atkZ = t * 0.03;
          atkRotX = -t * 0.12;
        } else if (p < 0.55) {
          const t = (p - 0.20) / 0.35;
          atkZ = 0.03 - t * 0.20;
          atkX = -t * 0.06;
          atkY = t * 0.02;
          atkRotX = -0.12 + t * 0.45;
          atkRotY = -t * 0.22;
        } else {
          const t = (p - 0.55) / 0.45;
          const ease = 1 - t * t;
          atkZ = -0.17 * ease;
          atkX = -0.06 * ease;
          atkY = 0.02 * ease;
          atkRotX = 0.33 * ease;
          atkRotY = -0.22 * ease;
        }
      } else if (heroKey === 'paladin') {
        // Gran tajo horizontal con mandoble sagrado
        if (p < 0.22) {
          const t = p / 0.22;
          atkY = t * 0.08;
          atkZ = t * 0.05;
          atkRotX = t * 0.32;
          atkRotZ = -t * 0.25;
        } else if (p < 0.62) {
          const t = (p - 0.22) / 0.40;
          atkX = -t * 0.26;
          atkY = 0.08 - t * 0.14;
          atkRotY = -t * 1.35;
          atkRotZ = -0.25 + t * 0.80;
          atkRotX = 0.32 - t * 0.65;
        } else {
          const t = (p - 0.62) / 0.38;
          const ease = 1 - t * t;
          atkX = -0.26 * ease;
          atkY = -0.06 * ease;
          atkRotY = -1.35 * ease;
          atkRotZ = 0.55 * ease;
          atkRotX = -0.33 * ease;
        }
      } else if (heroKey === 'ranger') {
        // Arco rúnico: retroceso del arco y latigazo
        if (p < 0.30) {
          const t = p / 0.30;
          atkZ = t * 0.07;
          atkX = -t * 0.03;
          atkRotZ = t * 0.16;
        } else if (p < 0.50) {
          const t = (p - 0.30) / 0.20;
          atkZ = 0.07 - t * 0.14;
          atkRotX = -Math.sin(t * Math.PI) * 0.16;
          atkRotZ = 0.16 - t * 0.22;
        } else {
          const t = (p - 0.50) / 0.50;
          const ease = 1 - t;
          const vibe = Math.sin(t * Math.PI * 4) * ease * 0.008;
          atkZ = -0.07 * ease + vibe;
          atkRotZ = -0.06 * ease;
        }
      } else if (heroKey === 'wizard') {
        // Canalización y descarga de rayo arcano
        if (p < 0.25) {
          const t = p / 0.25;
          atkY = t * 0.07;
          atkZ = t * 0.04;
          atkRotX = t * 0.22;
        } else if (p < 0.58) {
          const t = (p - 0.25) / 0.33;
          atkZ = 0.04 - t * 0.18;
          atkY = 0.07 - t * 0.05;
          atkRotX = 0.22 - t * 0.40;
        } else {
          const t = (p - 0.58) / 0.42;
          const ease = 1 - t * t;
          atkZ = -0.14 * ease;
          atkY = 0.02 * ease;
          atkRotX = -0.18 * ease;
        }
      } else if (heroKey === 'guardian') {
        // Mazo sísmico: alzada y golpe descendente violento
        if (p < 0.30) {
          const t = p / 0.30;
          atkY = t * 0.12;
          atkZ = t * 0.05;
          atkRotX = t * 0.45;
        } else if (p < 0.58) {
          const t = (p - 0.30) / 0.28;
          atkY = 0.12 - t * 0.24;
          atkZ = 0.05 - t * 0.12;
          atkRotX = 0.45 - t * 1.05;
        } else {
          const t = (p - 0.58) / 0.42;
          const ease = 1 - t;
          const tremor = Math.sin(t * Math.PI * 6) * ease * 0.007;
          atkY = -0.12 * ease + tremor;
          atkZ = -0.07 * ease;
          atkRotX = -0.60 * ease;
        }
      }

      if (p >= 1.0) {
        this.isAttacking = false;
        this.attackTimer = 0;
      }
    }

    // 6. Animación secundaria del cristal amatista (Hechicero)
    if (this.crystalMesh) {
      const spinSpeed = this.isAttacking ? 6.0 : 1.5;
      this.crystalMesh.rotation.y += safeDt * spinSpeed;
    }

    // 7. Composición directa sobre la transformación de grupo (Zero-GC)
    this.group.position.x = this.basePos.x + idleX + bobX + this.swayPos.x + atkX;
    this.group.position.y = this.basePos.y + idleY + bobY + this.jumpOffset + this.landingImpact + this.swayPos.y + atkY;
    this.group.position.z = this.basePos.z + this.swayPos.z + atkZ;

    this.group.rotation.x = this.baseRot.x + idleRotX + bobRotX + this.swayRot.x + atkRotX;
    this.group.rotation.y = this.baseRot.y + this.swayRot.y + atkRotY;
    this.group.rotation.z = this.baseRot.z + idleRotZ + bobRotZ + this.swayRot.z + atkRotZ;
  }

  dispose() {
    if (this.currentWeaponMesh) {
      this.group.remove(this.currentWeaponMesh);
      this.currentWeaponMesh = null;
    }
    if (this.currentArmMesh) {
      this.group.remove(this.currentArmMesh);
      this.currentArmMesh = null;
    }
    this.crystalMesh = null;
    this.camera.remove(this.group);
  }
}
