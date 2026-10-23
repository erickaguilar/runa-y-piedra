// src/render/EnemyRenderer.js
import * as THREE from 'three';

let _serpentPixelTex = null;

/**
 * Genera la textura procedural pixel-art de escamas con NearestFilter para la serpiente.
 */
export function getSerpentPixelTexture() {
  if (_serpentPixelTex) return _serpentPixelTex;
  if (typeof document === 'undefined' || !document.createElement) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#065f46';
  ctx.fillRect(0, 0, 32, 16);

  const scales = ['#059669', '#047857', '#10b981', '#064e3b'];
  for (let y = 0; y < 11; y += 2) {
    for (let x = 0; x < 32; x += 2) {
      ctx.fillStyle = scales[(x * 5 + y * 11) % scales.length];
      ctx.fillRect(x, y, 2, 2);
      if ((x + y) % 6 === 0) {
        ctx.fillStyle = '#34d399';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  ctx.fillStyle = '#1e293b';
  for (const [ax, ay] of [[2, 4], [8, 8], [14, 2], [20, 6], [26, 4]]) ctx.fillRect(ax, ay, 2, 1);

  ctx.fillStyle = '#a7f3d0';
  ctx.fillRect(0, 11, 32, 5);
  ctx.fillStyle = '#6ee7b7';
  for (let x = 0; x < 32; x += 4) ctx.fillRect(x, 11, 2, 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  _serpentPixelTex = tex;
  return tex;
}

/**
 * Genera el Sprite 3D flotante con el nombre y corazones de vida del enemigo.
 */
export function createEnemyBadgeSprite(enemy) {
  const badgeY = enemy?.type === 'cave_serpent' ? 0.85 : 2.3;
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.9, 0.52, 1);
    sprite.position.set(0, badgeY, 0);
    sprite.userData = { canvas: null, ctx: null, texture: null };
    return sprite;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 75;
  const ctx = canvas.getContext('2d');

  updateEnemyCanvas(canvas, ctx, enemy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.9, 0.48, 1);
  sprite.position.set(0, badgeY, 0);
  sprite.userData = { canvas, ctx, texture };
  return sprite;
}

function updateEnemyCanvas(canvas, ctx, enemy) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo traslúcido Sumi-e
  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  if (ctx.roundRect) ctx.roundRect(6, 6, 288, 63, 12);
  else ctx.rect(6, 6, 288, 63);
  ctx.fill();

  // Borde bermellón de amenaza hostil
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = enemy.state === 'telegraph' ? '#fbbf24' : '#ef4444';
  if (ctx.roundRect) ctx.roundRect(6, 6, 288, 63, 12);
  else ctx.strokeRect(6, 6, 288, 63);
  ctx.stroke();

  // Nombre del enemigo
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(enemy.name || 'Enemigo', 150, 26);

  // Barra / indicador de vida (corazones o pips)
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  const maxHp = enemy.maxHp || 3;
  const curHp = enemy.hp ?? maxHp;
  let hpIcons = '';
  for (let i = 0; i < maxHp; i++) {
    hpIcons += (i < curHp) ? '❤️ ' : '🖤 ';
  }
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(hpIcons.trim(), 150, 52);
}

export class EnemyRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'EnemiesGroup';
    this.scene.add(this.group);

    this.enemiesMap = new Map();
    this.time = 0;
  }

  loadEnemies(enemies = []) {
    this.clear();
    for (const enemy of enemies) {
      this._buildEnemyEntity(enemy);
    }
  }

  _buildEnemyEntity(enemy) {
    const root = new THREE.Group();
    root.position.set(enemy.x, enemy.y, enemy.z);

    const meshes = [];
    const origMats = [];
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    if (enemy.type === 'cave_serpent') {
      const serpentTex = getSerpentPixelTexture();
      const serpentMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        map: serpentTex || null,
        roughness: 0.75,
        metalness: 0.1,
      });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const tongueMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

      // Cabeza de la serpiente (Cráneo cúbico principal)
      const headGeo = new THREE.BoxGeometry(0.24, 0.16, 0.30);
      const headMesh = new THREE.Mesh(headGeo, serpentMat);
      headMesh.position.set(0, 0.20, -0.28);
      root.add(headMesh);
      meshes.push(headMesh);
      origMats.push(serpentMat);

      // Hocico / mandíbula voxel
      const snoutGeo = new THREE.BoxGeometry(0.18, 0.08, 0.10);
      const snoutMesh = new THREE.Mesh(snoutGeo, serpentMat);
      snoutMesh.position.set(0, -0.04, -0.16);
      headMesh.add(snoutMesh);
      meshes.push(snoutMesh);
      origMats.push(serpentMat);

      // Ojos de píxel (bloques rubí con pupila negra vertical)
      const eyeGeo = new THREE.BoxGeometry(0.045, 0.045, 0.05);
      const pupilGeo = new THREE.BoxGeometry(0.02, 0.045, 0.052);
      for (const x of [-0.08, 0.08]) {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(x, 0.03, -0.11);
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        eye.add(pupil);
        headMesh.add(eye);
        meshes.push(eye, pupil);
        origMats.push(eyeMat, pupilMat);
      }

      // Lengua bífida pixel-art
      const tongueGroup = new THREE.Group();
      tongueGroup.position.set(0, -0.04, -0.21);
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.08), tongueMat);
      stem.position.set(0, 0, -0.04);
      tongueGroup.add(stem);
      meshes.push(stem);
      origMats.push(tongueMat);
      const forkGeo = new THREE.BoxGeometry(0.012, 0.012, 0.04);
      for (const [fx, ry] of [[-0.02, 0.3], [0.02, -0.3]]) {
        const fork = new THREE.Mesh(forkGeo, tongueMat);
        fork.position.set(fx, 0, -0.09);
        fork.rotation.y = ry;
        tongueGroup.add(fork);
        meshes.push(fork);
        origMats.push(tongueMat);
      }
      headMesh.add(tongueGroup);

      // Segmentos del cuerpo reptante en escala decreciente
      const segSizes = [
        [0.20, 0.15, 0.26, -0.06, 0.12],
        [0.18, 0.14, 0.26, 0.18, 0.10],
        [0.15, 0.12, 0.24, 0.40, 0.08],
        [0.11, 0.10, 0.22, 0.60, 0.06],
        [0.07, 0.07, 0.18, 0.78, 0.04],
      ];
      const segments = [];
      for (const [w, h, d, z, y] of segSizes) {
        const segGeo = new THREE.BoxGeometry(w, h, d);
        const segMesh = new THREE.Mesh(segGeo, serpentMat);
        segMesh.position.set(0, y, z);
        root.add(segMesh);
        meshes.push(segMesh);
        origMats.push(serpentMat);
        segments.push(segMesh);
      }

      const badgeSprite = createEnemyBadgeSprite(enemy);
      root.add(badgeSprite);

      this.group.add(root);
      this.enemiesMap.set(enemy.id, {
        root,
        enemy,
        isSerpent: true,
        meshes,
        origMats,
        flashMat,
        eyeMat,
        pupilMat,
        tongueMat,
        headMesh,
        tongueGroup,
        segments,
        badgeSprite,
        walkPhase: 0,
        lastRenderedHp: -1,
        lastRenderedState: '',
      });
      return;
    }

    // Materiales del Esqueleto de Basalto
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.1,
    });
    const darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
    });

    // 1. Torso de basalto
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.35);
    const torsoMesh = new THREE.Mesh(torsoGeo, stoneMat);
    torsoMesh.position.set(0, 1.05, 0);
    root.add(torsoMesh);
    meshes.push(torsoMesh);
    origMats.push(stoneMat);

    // 2. Cabeza / Cráneo
    const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const headMesh = new THREE.Mesh(headGeo, darkStoneMat);
    headMesh.position.set(0, 1.55, 0);
    root.add(headMesh);
    meshes.push(headMesh);
    origMats.push(darkStoneMat);

    // Ojos rúnicos brillantes
    const eyeLeftGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
    const eyeLeft = new THREE.Mesh(eyeLeftGeo, eyeMat);
    eyeLeft.position.set(-0.09, 1.58, -0.17);
    root.add(eyeLeft);

    const eyeRightGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
    const eyeRight = new THREE.Mesh(eyeRightGeo, eyeMat);
    eyeRight.position.set(0.09, 1.58, -0.17);
    root.add(eyeRight);

    // 3. Brazos articulados
    const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
    const armLeft = new THREE.Mesh(armGeo, stoneMat);
    armLeft.position.set(-0.35, 1.05, 0);
    root.add(armLeft);
    meshes.push(armLeft);
    origMats.push(stoneMat);

    const armRight = new THREE.Mesh(armGeo, stoneMat);
    armRight.position.set(0.35, 1.05, 0);
    root.add(armRight);
    meshes.push(armRight);
    origMats.push(stoneMat);

    // 4. Piernas articuladas
    const legGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);
    const legLeft = new THREE.Mesh(legGeo, darkStoneMat);
    legLeft.position.set(-0.16, 0.35, 0);
    root.add(legLeft);
    meshes.push(legLeft);
    origMats.push(darkStoneMat);

    const legRight = new THREE.Mesh(legGeo, darkStoneMat);
    legRight.position.set(0.16, 0.35, 0);
    root.add(legRight);
    meshes.push(legRight);
    origMats.push(darkStoneMat);

    // 5. Badge flotante de vida y estado
    const badgeSprite = createEnemyBadgeSprite(enemy);
    root.add(badgeSprite);

    this.group.add(root);
    this.enemiesMap.set(enemy.id, {
      root,
      enemy,
      meshes,
      origMats,
      flashMat,
      eyeMat,
      armLeft,
      armRight,
      legLeft,
      legRight,
      badgeSprite,
      walkPhase: 0,
      lastRenderedHp: -1,
      lastRenderedState: '',
    });
  }

  update(dt, enemies = []) {
    this.time += dt;

    for (const enemy of enemies) {
      let entry = this.enemiesMap.get(enemy.id);
      if (!entry) {
        this._buildEnemyEntity(enemy);
        entry = this.enemiesMap.get(enemy.id);
      }
      if (!entry) continue;

      // Si el enemigo está muerto, ocultar
      if (enemy.isDead) {
        entry.root.visible = false;
        continue;
      }
      entry.root.visible = true;

      // 1. Sincronizar posición y rotación
      entry.root.position.set(enemy.x, enemy.y, enemy.z);
      entry.root.rotation.y = enemy.yaw;

      // 2. Hit flash (bermellón)
      const isFlashing = enemy.flashTimer > 0;
      for (let i = 0; i < entry.meshes.length; i++) {
        entry.meshes[i].material = isFlashing ? entry.flashMat : entry.origMats[i];
      }

      // 3. Animación de marcha o telegrafiado
      if (entry.isSerpent) {
        if (enemy.state === 'chase') {
          entry.walkPhase += dt * enemy.speed * 5.0;
          // Cuantización a 12 FPS para sensación de sprite retro / pixel art
          const stepPhase = Math.floor(entry.walkPhase * 12) / 12;
          for (let i = 0; i < entry.segments.length; i++) {
            const phase = stepPhase - (i + 1) * 0.85;
            entry.segments[i].position.x = Math.sin(phase) * 0.12;
            entry.segments[i].rotation.y = Math.cos(phase) * 0.22;
          }
          entry.headMesh.position.x = Math.sin(stepPhase) * 0.06;
          entry.headMesh.position.y = 0.20;
          entry.headMesh.rotation.x = 0;
          if (entry.tongueGroup) {
            const flick = Math.sin(stepPhase * 3) > 0.25;
            entry.tongueGroup.visible = flick;
            entry.tongueGroup.position.z = flick ? -0.24 : -0.21;
          }
        } else if (enemy.state === 'telegraph') {
          // Telegrafiado cuantizado a 16 FPS con siseo y vibración rápida
          const stepTime = Math.floor(this.time * 16) / 16;
          entry.headMesh.position.y = 0.35 + Math.sin(stepTime * 25) * 0.04;
          entry.headMesh.rotation.x = -0.35;
          if (entry.tongueGroup) {
            entry.tongueGroup.visible = true;
            entry.tongueGroup.position.z = -0.24 + Math.sin(stepTime * 40) * 0.03;
          }
        } else {
          // Idle cuantizado a 8 FPS con ondulación suave
          const stepTime = Math.floor(this.time * 8) / 8;
          entry.headMesh.position.y = 0.20 + Math.sin(stepTime * 2.5) * 0.02;
          entry.headMesh.position.x = 0;
          entry.headMesh.rotation.x = 0;
          for (let i = 0; i < entry.segments.length; i++) {
            entry.segments[i].position.x = Math.sin(stepTime * 1.5 + i) * 0.04;
            entry.segments[i].rotation.y = 0;
          }
          if (entry.tongueGroup) {
            entry.tongueGroup.visible = Math.sin(stepTime * 3) > 0.6;
            entry.tongueGroup.position.z = -0.21;
          }
        }
      } else if (enemy.state === 'chase') {
        entry.walkPhase += dt * enemy.speed * 4.5;
        const swing = Math.sin(entry.walkPhase) * 0.45;
        entry.legLeft.rotation.x = swing;
        entry.legRight.rotation.x = -swing;
        entry.armLeft.rotation.x = -swing;
        entry.armRight.rotation.x = swing;
      } else if (enemy.state === 'telegraph') {
        // Brazos alzados en postura de ataque con vibración
        entry.armLeft.rotation.x = -1.2 + Math.sin(this.time * 30) * 0.15;
        entry.armRight.rotation.x = -1.2 + Math.sin(this.time * 30) * 0.15;
        entry.legLeft.rotation.x = 0;
        entry.legRight.rotation.x = 0;
      } else {
        // Idle
        entry.legLeft.rotation.x = 0;
        entry.legRight.rotation.x = 0;
        entry.armLeft.rotation.x = Math.sin(this.time * 2.0) * 0.08;
        entry.armRight.rotation.x = -Math.sin(this.time * 2.0) * 0.08;
      }

      // 4. Sacudida física ante impacto
      if (enemy.shakeTimer > 0) {
        entry.root.rotation.z = Math.sin(this.time * 40) * 0.08;
      } else {
        entry.root.rotation.z = 0;
      }

      // 5. Actualizar badge flotante si cambió vida o estado
      if (
        entry.badgeSprite?.userData?.ctx &&
        (entry.lastRenderedHp !== enemy.hp || entry.lastRenderedState !== enemy.state)
      ) {
        entry.lastRenderedHp = enemy.hp;
        entry.lastRenderedState = enemy.state;
        updateEnemyCanvas(
          entry.badgeSprite.userData.canvas,
          entry.badgeSprite.userData.ctx,
          enemy
        );
        if (entry.badgeSprite.userData.texture) {
          entry.badgeSprite.userData.texture.needsUpdate = true;
        }
      }
    }
  }

  clear() {
    for (const entry of this.enemiesMap.values()) {
      entry.flashMat.dispose();
      entry.eyeMat.dispose();
      entry.pupilMat?.dispose();
      entry.tongueMat?.dispose();
      const uniqueMats = new Set(entry.origMats);
      for (const m of uniqueMats) m.dispose();
      for (const mesh of entry.meshes) mesh.geometry?.dispose();
      if (entry.badgeSprite?.userData?.texture) {
        entry.badgeSprite.userData.texture.dispose();
      }
      this.group.remove(entry.root);
    }
    this.enemiesMap.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
