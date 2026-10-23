// src/render/DummyRenderer.js
import * as THREE from 'three';

/**
 * Genera el Sprite 3D flotante con el nombre del maniquí y sus estadísticas de combate (DPS, daño y distancia).
 */
export function createDummyBadgeSprite(dummy) {
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 0.58, 1);
    sprite.position.set(0, 2.45, 0);
    sprite.userData = { canvas: null, ctx: null, texture: null };
    return sprite;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 88;
  const ctx = canvas.getContext('2d');

  updateDummyCanvas(canvas, ctx, dummy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.0, 0.58, 1);
  sprite.position.set(0, 2.45, 0);
  sprite.userData = { canvas, ctx, texture };
  return sprite;
}

export function createFloatingDamageSprite() {
  if (typeof document === 'undefined') {
    const mat = new THREE.SpriteMaterial({ depthTest: false, transparent: true, opacity: 0 });
    const sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    sprite.scale.set(1.1, 0.35, 1);
    sprite.position.set(0, 2.05, 0);
    sprite.userData = { canvas: null, ctx: null, texture: null };
    return sprite;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 56;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true, opacity: 0 });
  const sprite = new THREE.Sprite(mat);
  sprite.visible = false;
  sprite.scale.set(1.1, 0.35, 1);
  sprite.position.set(0, 2.05, 0);
  sprite.userData = { canvas, ctx, texture };
  return sprite;
}

export function updateFloatingDamageCanvas(canvas, ctx, dummy) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dmg = dummy.lastDamage || 1;
  const dist = typeof dummy.lastDistance === 'number' ? dummy.lastDistance.toFixed(1) : '0.0';
  const isBonus = !!dummy.lastIsBonus;

  ctx.textAlign = 'center';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isBonus ? '#facc15' : '#f8fafc';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText(isBonus ? `-${dmg}! ★` : `-${dmg}`, 90, 26);

  ctx.font = 'bold 13px monospace, monospace';
  ctx.fillStyle = isBonus ? '#fef08a' : '#cbd5e1';
  ctx.fillText(`(${dist}m)`, 90, 46);
  ctx.shadowBlur = 0;
}

function updateDummyCanvas(canvas, ctx, dummy) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const isBonus = !!dummy.lastIsBonus;

  // Fondo Sumi-e traslúcido
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  if (ctx.roundRect) ctx.roundRect(6, 6, w - 12, h - 12, 12);
  else ctx.rect(6, 6, w - 12, h - 12);
  ctx.fill();

  // Borde temático: resaltado en oro si el último impacto tuvo bonificación de distancia
  ctx.lineWidth = isBonus ? 3.0 : 2.2;
  ctx.strokeStyle = isBonus ? '#fbbf24' : (dummy.color || '#38bdf8');
  if (ctx.roundRect) ctx.roundRect(6, 6, w - 12, h - 12, 12);
  else ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.stroke();

  // 1. Título / Nombre
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(dummy.name, w / 2, 26);

  // 2. Telemetría de distancia y último impacto
  ctx.font = 'bold 12px monospace, monospace';
  if (dummy.hitCount > 0) {
    const distStr = typeof dummy.lastDistance === 'number' ? dummy.lastDistance.toFixed(1) + 'm' : '0.0m';
    const labelStr = dummy.lastDistanceLabel ? ` • ${dummy.lastDistanceLabel}` : '';
    if (isBonus) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`Último: ${dummy.lastDamage} DMG (${distStr}${labelStr}) ★`, w / 2, 48);
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Último: ${dummy.lastDamage} DMG (${distStr}${labelStr})`, w / 2, 48);
    }
  } else {
    ctx.fillStyle = '#64748b';
    ctx.fillText('Sin impactos registrados', w / 2, 48);
  }

  // 3. Telemetría de DPS y daño acumulado
  ctx.font = 'bold 12px monospace, monospace';
  const dpsStr = (dummy.dps || 0).toFixed(1);
  const dmgStr = dummy.totalDamage || 0;
  ctx.fillStyle = dummy.totalDamage > 0 ? '#38bdf8' : '#94a3b8';
  ctx.fillText(`DPS: ${dpsStr}  •  Total: ${dmgStr}`, w / 2, 70);
}

export class DummyRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'TrainingDummiesGroup';
    this.scene.add(this.group);

    this.dummiesMap = new Map(); // id -> { group, dummy, meshes, flashMat, origMats, sprite }
    this.time = 0;
  }

  loadDummies(dummies = []) {
    this.clear();
    for (const dummy of dummies) {
      this._buildDummyEntity(dummy);
    }
  }

  _buildDummyEntity(dummy) {
    const entityGroup = new THREE.Group();
    entityGroup.position.set(dummy.x, dummy.y, dummy.z);

    const meshes = [];
    const origMats = [];

    // Material de flash bermellón para impactos y dorado para bonus por distancia
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const bonusFlashMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // 1. Poste vertical de madera
    const poleGeo = new THREE.BoxGeometry(0.2, 1.8, 0.2);
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const poleMesh = new THREE.Mesh(poleGeo, woodMat);
    poleMesh.position.set(0, 0.9, 0);
    entityGroup.add(poleMesh);
    meshes.push(poleMesh);
    origMats.push(woodMat);

    // 2. Travesaño horizontal (brazos)
    const armGeo = new THREE.BoxGeometry(0.9, 0.16, 0.16);
    const armMesh = new THREE.Mesh(armGeo, woodMat);
    armMesh.position.set(0, 1.25, 0);
    entityGroup.add(armMesh);
    meshes.push(armMesh);
    origMats.push(woodMat);

    // 3. Torso específico según tipo
    let bodyMat;
    let headMat;

    if (dummy.type === 'heavy') {
      bodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 });
      headMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
    } else if (dummy.type === 'elemental') {
      bodyMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.4, emissive: 0x2e1065, emissiveIntensity: 0.5 });
      headMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.2, emissive: 0x7c3aed, emissiveIntensity: 0.8 });
    } else {
      // Light / Paja
      bodyMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
      headMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    }

    const bodyGeo = new THREE.BoxGeometry(0.55, 0.75, 0.45);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 1.05, 0);
    entityGroup.add(bodyMesh);
    meshes.push(bodyMesh);
    origMats.push(bodyMat);

    // 4. Cabeza
    const headGeo = new THREE.BoxGeometry(0.35, 0.38, 0.35);
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 1.62, 0);
    entityGroup.add(headMesh);
    meshes.push(headMesh);
    origMats.push(headMat);

    // 5. Sprite 3D de telemetría flotante
    const badgeSprite = createDummyBadgeSprite(dummy);
    entityGroup.add(badgeSprite);

    // 6. Sprite 3D de número flotante de daño
    const floatingSprite = createFloatingDamageSprite();
    entityGroup.add(floatingSprite);

    this.group.add(entityGroup);
    this.dummiesMap.set(dummy.id, {
      group: entityGroup,
      dummy,
      meshes,
      origMats,
      flashMat,
      bonusFlashMat,
      sprite: badgeSprite,
      floatingSprite,
      floatingTimer: 0,
      lastRenderedDps: -1,
      lastRenderedDamage: -1,
      lastRenderedHitCount: dummy.hitCount,
    });
  }

  update(dt, dummies = []) {
    this.time += dt;

    for (const dummy of dummies) {
      const entry = this.dummiesMap.get(dummy.id);
      if (!entry) continue;

      // 1. Hit flash: alternar material según si fue impacto normal o con bonus
      const isFlashing = dummy.flashTimer > 0;
      const activeFlash = dummy.lastIsBonus ? entry.bonusFlashMat : entry.flashMat;
      for (let i = 0; i < entry.meshes.length; i++) {
        entry.meshes[i].material = isFlashing ? activeFlash : entry.origMats[i];
      }

      // 2. Sacudida física ante impacto
      if (dummy.shakeTimer > 0) {
        const intensity = dummy.shakeIntensity || 0.08;
        const decay = dummy.shakeTimer / 0.20;
        entry.group.rotation.z = Math.sin(this.time * 40) * intensity * decay;
        entry.group.rotation.x = Math.cos(this.time * 30) * (intensity * 0.5) * decay;
      } else {
        entry.group.rotation.z = 0;
        entry.group.rotation.x = 0;
      }

      // 3. Animación de número flotante emergente al recibir impacto
      if (entry.lastRenderedHitCount !== dummy.hitCount && dummy.hitCount > 0) {
        entry.lastRenderedHitCount = dummy.hitCount;
        entry.floatingTimer = 0.85;
        entry.floatingSprite.visible = true;
        entry.floatingSprite.position.set(0, 2.05, 0);
        if (entry.floatingSprite.material) entry.floatingSprite.material.opacity = 1.0;
        if (entry.floatingSprite.userData?.ctx) {
          updateFloatingDamageCanvas(entry.floatingSprite.userData.canvas, entry.floatingSprite.userData.ctx, dummy);
          if (entry.floatingSprite.userData.texture) {
            entry.floatingSprite.userData.texture.needsUpdate = true;
          }
        }
      }

      if (entry.floatingTimer > 0) {
        entry.floatingTimer -= dt;
        const progress = Math.max(0, 1 - entry.floatingTimer / 0.85);
        entry.floatingSprite.position.y = 2.05 + progress * 0.40;
        if (entry.floatingSprite.material) {
          entry.floatingSprite.material.opacity = Math.max(0, entry.floatingTimer / 0.85);
        }
        if (entry.floatingTimer <= 0) {
          entry.floatingSprite.visible = false;
        }
      }

      // 4. Actualizar Canvas del badge flotante si cambió el daño, DPS o el conteo de impactos
      if (
        entry.sprite?.userData?.ctx &&
        (entry.lastRenderedDps !== dummy.dps ||
          entry.lastRenderedDamage !== dummy.totalDamage ||
          entry.lastRenderedHitCount !== dummy.hitCount)
      ) {
        entry.lastRenderedDps = dummy.dps;
        entry.lastRenderedDamage = dummy.totalDamage;
        updateDummyCanvas(entry.sprite.userData.canvas, entry.sprite.userData.ctx, dummy);
        if (entry.sprite.userData.texture) {
          entry.sprite.userData.texture.needsUpdate = true;
        }
      }
    }
  }

  clear() {
    for (const entry of this.dummiesMap.values()) {
      entry.flashMat.dispose();
      entry.bonusFlashMat.dispose();
      for (const m of entry.origMats) {
        m.dispose();
      }
      for (const mesh of entry.meshes) {
        mesh.geometry?.dispose();
      }
      if (entry.sprite?.userData?.texture) {
        entry.sprite.userData.texture.dispose();
      }
      if (entry.floatingSprite?.userData?.texture) {
        entry.floatingSprite.userData.texture.dispose();
      }
      if (entry.floatingSprite?.material) {
        entry.floatingSprite.material.dispose();
      }
      this.group.remove(entry.group);
    }
    this.dummiesMap.clear();
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}
