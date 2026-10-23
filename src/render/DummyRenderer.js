// src/render/DummyRenderer.js
import * as THREE from 'three';

/**
 * Genera el Sprite 3D flotante con el nombre del maniquí y sus estadísticas de combate (DPS y daño total).
 */
export function createDummyBadgeSprite(dummy) {
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.9, 0.55, 1);
    sprite.position.set(0, 2.35, 0);
    sprite.userData = { canvas: null, ctx: null, texture: null };
    return sprite;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');

  updateDummyCanvas(canvas, ctx, dummy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.9, 0.52, 1);
  sprite.position.set(0, 2.35, 0);
  sprite.userData = { canvas, ctx, texture };
  return sprite;
}

function updateDummyCanvas(canvas, ctx, dummy) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo Sumi-e traslúcido
  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  if (ctx.roundRect) ctx.roundRect(6, 6, 288, 68, 12);
  else ctx.rect(6, 6, 288, 68);
  ctx.fill();

  // Borde temático del tipo de maniquí
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = dummy.color || '#38bdf8';
  if (ctx.roundRect) ctx.roundRect(6, 6, 288, 68, 12);
  else ctx.strokeRect(6, 6, 288, 68);
  ctx.stroke();

  // Título / Nombre
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(dummy.name, 150, 28);

  // Telemetría de DPS y daño acumulado
  ctx.font = 'bold 13px monospace, monospace';
  const dpsStr = (dummy.dps || 0).toFixed(1);
  const dmgStr = dummy.totalDamage || 0;
  ctx.fillStyle = dummy.totalDamage > 0 ? '#fbbf24' : '#94a3b8';
  ctx.fillText(`DPS: ${dpsStr}  •  Daño: ${dmgStr}`, 150, 54);
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

    // Material de flash bermellón para impactos
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

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

    this.group.add(entityGroup);
    this.dummiesMap.set(dummy.id, {
      group: entityGroup,
      dummy,
      meshes,
      origMats,
      flashMat,
      sprite: badgeSprite,
      lastRenderedDps: -1,
      lastRenderedDamage: -1,
    });
  }

  update(dt, dummies = []) {
    this.time += dt;

    for (const dummy of dummies) {
      const entry = this.dummiesMap.get(dummy.id);
      if (!entry) continue;

      // 1. Hit flash: alternar material al recibir impacto
      const isFlashing = dummy.flashTimer > 0;
      for (let i = 0; i < entry.meshes.length; i++) {
        entry.meshes[i].material = isFlashing ? entry.flashMat : entry.origMats[i];
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

      // 3. Actualizar Canvas del badge flotante si cambió el daño o el DPS
      if (
        entry.sprite?.userData?.ctx &&
        (entry.lastRenderedDps !== dummy.dps || entry.lastRenderedDamage !== dummy.totalDamage)
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
      for (const m of entry.origMats) {
        m.dispose();
      }
      for (const mesh of entry.meshes) {
        mesh.geometry?.dispose();
      }
      if (entry.sprite?.userData?.texture) {
        entry.sprite.userData.texture.dispose();
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
