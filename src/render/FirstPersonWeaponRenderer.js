// src/render/FirstPersonWeaponRenderer.js
import * as THREE from 'three';
import { buildHeroWeaponMesh } from './models/heroes/heroWeapons.js';
import { buildHeroArmMesh, setupOverlayMesh, FP_CONFIGS } from './models/heroes/heroArms.js';
import { evaluateHeroAttack, resetHeroAttackMeshes } from './firstPersonAttacks.js';

const HERO_NAMES = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];

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
    this.wizardCoreMesh = null;
    this.wizardOrbitalMesh = null;
    this.guardianRuneMesh = null;
    this.rangerGemMesh = null;
    this.rangerArrowMesh = null;
    this.rangerStringMesh = null;
    this.paladinCoreMesh = null;
    this.paladinFullerMesh = null;

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
    this.wizardCoreMesh = null;
    this.wizardOrbitalMesh = null;
    this.guardianRuneMesh = null;
    this.rangerGemMesh = null;
    this.rangerArrowMesh = null;
    this.rangerStringMesh = null;
    this.paladinCoreMesh = null;
    this.paladinFullerMesh = null;

    // 1. Malla del arma
    this.currentWeaponMesh = buildHeroWeaponMesh(heroIdOrIndex);
    this.currentWeaponMesh.renderOrder = 9999;
    this.currentWeaponMesh.traverse((child) => {
      if (child.isMesh) {
        setupOverlayMesh(child);
        if (heroKey === 'wizard') {
          if (child.name === 'WizardArcaneCrystal' || (!this.crystalMesh && child.geometry?.type === 'OctahedronGeometry')) {
            this.crystalMesh = child;
          }
          if (child.name === 'WizardArcaneCore') this.wizardCoreMesh = child;
          if (child.name === 'WizardOrbitalRing') this.wizardOrbitalMesh = child;
        }
        if (heroKey === 'guardian' && child.name === 'GuardianRunicCore') this.guardianRuneMesh = child;
        if (heroKey === 'paladin') {
          if (child.name === 'PaladinHolyCore') this.paladinCoreMesh = child;
          if (child.name === 'PaladinBladeFuller') this.paladinFullerMesh = child;
        }
        if (heroKey === 'ranger') {
          if (child.name === 'RangerWindGem') this.rangerGemMesh = child;
          if (child.name === 'RangerArrow' || child.parent?.name === 'RangerArrow') {
            if (!this.rangerArrowMesh) this.rangerArrowMesh = child.name === 'RangerArrow' ? child : child.parent;
          }
          if (child.name === 'RangerBowString') this.rangerStringMesh = child;
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
    if (this.rangerArrowMesh) this.rangerArrowMesh.visible = true;
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
      const res = evaluateHeroAttack(this.currentHeroKey || 'adventurer', p, this);
      atkX = res.atkX;
      atkY = res.atkY;
      atkZ = res.atkZ;
      atkRotX = res.atkRotX;
      atkRotY = res.atkRotY;
      atkRotZ = res.atkRotZ;

      if (p >= 1.0) {
        this.isAttacking = false;
        this.attackTimer = 0;
        resetHeroAttackMeshes(this);
      }
    }

    // 6. Animación secundaria del cristal amatista y aro orbital (Hechicero) y pulso telúrico (Guardián)
    if (this.crystalMesh) {
      const spinSpeed = this.isAttacking ? 7.5 : 1.8;
      this.crystalMesh.rotation.y += safeDt * spinSpeed;
      if (!this.isAttacking) {
        this.crystalMesh.position.y = 0.89 + Math.sin(this.idlePhase * 2.2) * 0.015;
        if (this.crystalMesh.material) {
          this.crystalMesh.material.emissiveIntensity = 0.8 + Math.sin(this.idlePhase * 2.0) * 0.20;
        }
      }
    }
    if (this.wizardCoreMesh) {
      this.wizardCoreMesh.rotation.y -= safeDt * (this.isAttacking ? 6.0 : 1.2);
      if (!this.isAttacking) {
        this.wizardCoreMesh.position.y = 0.89 + Math.sin(this.idlePhase * 2.2) * 0.015;
      }
    }
    if (this.wizardOrbitalMesh) {
      this.wizardOrbitalMesh.rotation.z += safeDt * (this.isAttacking ? 5.0 : 1.0);
      if (!this.isAttacking) {
        this.wizardOrbitalMesh.position.y = 0.89 + Math.sin(this.idlePhase * 2.2) * 0.015;
      }
    }
    if (!this.isAttacking && this.guardianRuneMesh?.material) {
      this.guardianRuneMesh.material.emissiveIntensity = 0.6 + Math.sin(this.idlePhase * 2.5) * 0.15;
    }
    if (!this.isAttacking && this.rangerGemMesh?.material) {
      this.rangerGemMesh.material.emissiveIntensity = 0.4 + Math.sin(this.idlePhase * 2.2) * 0.15;
    }
    if (!this.isAttacking && this.paladinCoreMesh?.material) {
      this.paladinCoreMesh.material.emissiveIntensity = 0.35 + Math.sin(this.idlePhase * 2.0) * 0.15;
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
    this.wizardCoreMesh = null;
    this.wizardOrbitalMesh = null;
    this.guardianRuneMesh = null;
    this.rangerGemMesh = null;
    this.rangerArrowMesh = null;
    this.rangerStringMesh = null;
    this.paladinCoreMesh = null;
    this.paladinFullerMesh = null;
    this.camera.remove(this.group);
  }
}
