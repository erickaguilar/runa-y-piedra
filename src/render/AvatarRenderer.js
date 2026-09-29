import * as THREE from 'three';
import { PLAYER_PALETTE, PHYSICS_CONFIG } from '../config/constants.js';

const AVATAR_H = PHYSICS_CONFIG.PLAYER_H;

// Equipo distintivo por id de héroe (ampliable: ranger, wizard...)
const GEAR_BUILDERS = {
  paladin: (a, G, add) => AvatarRenderer._buildPaladinGear(a, G, add),
  ranger: (a, G, add) => AvatarRenderer._buildRangerGear(a, G, add),
  wizard: (a, G, add) => AvatarRenderer._buildWizardGear(a, G, add),
};

export class AvatarRenderer {
  constructor(scene) {
    this.scene = scene;
    this.avatars = new Map();
    this._geoCache = AvatarRenderer._buildSharedGeometries();
    this._sharedMats = AvatarRenderer._buildSharedMaterials();
  }

  /** Geometrías compartidas del muñeco (1.8 m, encaja en la cápsula física). */
  static _buildSharedGeometries() {
    const head = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const torso = new THREE.BoxGeometry(0.55, 0.65, 0.32);
    // Cinto 20 mm por fuera del torso: evita caras casi-coplanares (z-fighting)
    const belt = new THREE.BoxGeometry(0.59, 0.12, 0.36);
    const arm = new THREE.BoxGeometry(0.18, 0.62, 0.2);
    arm.translate(0, -0.28, 0); // pivote en el hombro
    const leg = new THREE.BoxGeometry(0.22, 0.75, 0.24);
    leg.translate(0, -0.375, 0); // pivote en la cadera
    return { head, torso, belt, arm, leg };
  }

  /** Materiales compartidos: piel, cara, pantalón y cinto (el color del héroe es por avatar). */
  static _buildSharedMaterials() {    // Cara procedural 64x64: ojos y boca sobre tono piel
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8b98a';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(14, 26, 10, 12); // ojo izq
    ctx.fillRect(40, 26, 10, 12); // ojo der
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(24, 46, 16, 5);  // boca
    const faceTex = new THREE.CanvasTexture(canvas);
    faceTex.magFilter = THREE.NearestFilter;
    faceTex.colorSpace = THREE.SRGBColorSpace;
    return {
      skin: new THREE.MeshLambertMaterial({ color: 0xe8b98a }),
      face: new THREE.MeshLambertMaterial({ map: faceTex }),
      pants: new THREE.MeshLambertMaterial({ color: 0x334155 }),
      belt: new THREE.MeshLambertMaterial({ color: 0x27272a }),
    };
  }

  /**
   * Equipo distintivo por héroe. Recibe (a, G, add) donde add(obj, parent)
   * registra el nodo para poder retirarlo al cambiar de héroe.
   * Retorna los materiales propios creados (se disponen con el avatar).
   */
  static _buildPaladinGear(a, G, add) {
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
    const crestMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });

    // Yelmo plateado sobre la cabeza + cresta roja de crin
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 0.54), silverMat);
    helm.position.set(0, 1.82, 0);
    add(helm, a.gear);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.44), crestMat);
    crest.position.set(0, 2.0, -0.02);
    add(crest, a.gear);

    // Hombreras redondeadas
    const pauldronGeo = new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const pauldronL = new THREE.Mesh(pauldronGeo, silverMat);
    pauldronL.position.set(-0.34, 1.34, 0);
    add(pauldronL, a.gear);
    const pauldronR = new THREE.Mesh(pauldronGeo, silverMat);
    pauldronR.position.set(0.34, 1.34, 0);
    add(pauldronR, a.gear);

    // Escudo antebrazo izquierdo: tabla, cantos y umbo dorado (sigue el balanceo)
    const shield = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.52, 0.38), silverMat);
    shield.add(board);
    const rimV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.56, 0.06), goldMat);
    rimV.position.set(0, 0, 0.17);
    shield.add(rimV);
    const rimV2 = rimV.clone();
    rimV2.position.z = -0.17;
    shield.add(rimV2);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), goldMat);
    boss.position.set(-0.05, 0, 0);
    shield.add(boss);
    shield.position.set(-0.14, -0.32, 0.02);
    add(shield, a.parts.armLPivot);

    return [silverMat, goldMat, crestMat];
  }

  /**
   * Kit del Explorador (ranger): capucha verde, capa a la espalda y carcaj
   * con flechas sobre el hombro derecho.
   */
  static _buildRangerGear(a, G, add) {
    const hoodMat = new THREE.MeshLambertMaterial({ color: 0x065f46 });
    const cloakMat = new THREE.MeshLambertMaterial({ color: 0x064e3b });
    const leatherMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x92600f });
    const fletchMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

    // Capucha: corona sobre la cabeza + faldón trasero hasta la nuca
    const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), hoodMat);
    hoodTop.position.set(0, 1.86, 0);
    add(hoodTop, a.gear);
    const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.42, 0.12), hoodMat);
    hoodBack.position.set(0, 1.62, -0.24);
    add(hoodBack, a.gear);

    // Capa a la espalda con ligera caída
    const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.78, 0.06), cloakMat);
    cloak.position.set(0, 1.0, -0.24);
    cloak.rotation.x = 0.1;
    add(cloak, a.gear);

    // Carcaj de cuero en diagonal sobre el hombro derecho
    const quiver = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.44, 10), leatherMat);
    quiver.add(tube);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 10), woodMat);
    rim.position.y = 0.2;
    quiver.add(rim);
    for (let i = -1; i <= 1; i++) {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 6), woodMat);
      shaft.position.set(i * 0.035, 0.22, (i % 2) * 0.03);
      quiver.add(shaft);
      const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.02), fletchMat);
      fletch.position.set(i * 0.035, 0.42, (i % 2) * 0.03);
      quiver.add(fletch);
    }
    quiver.position.set(0.22, 1.32, -0.26);
    quiver.rotation.z = 0.28;
    quiver.rotation.x = -0.12;
    add(quiver, a.gear);

    return [hoodMat, cloakMat, leatherMat, woodMat, fletchMat];
  }

  /**
   * Kit del Hechicero (wizard): sombrero picudo con ala y báculo con cristal
   * arcano en la mano derecha (acompaña el balanceo del brazo).
   */
  static _buildWizardGear(a, G, add) {
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x6d28d9 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x573418 });
    const crystalMat = new THREE.MeshLambertMaterial({
      color: 0xc4b5fd, emissive: 0x7c3aed, emissiveIntensity: 1.0,
    });

    // Ala + cono picudo ligeramente ladeado + remate dorado
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 14), hatMat);
    brim.position.set(0, 1.88, 0);
    add(brim, a.gear);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 12), hatMat);
    cone.position.set(0, 2.18, 0);
    cone.rotation.z = 0.07;
    add(cone, a.gear);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldMat);
    tip.position.set(-0.02, 2.47, 0);
    add(tip, a.gear);

    // Báculo en la mano derecha: vara, collar y cristal arcano
    const staff = new THREE.Group();
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.2, 8), woodMat);
    staff.add(rod);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.07, 8), goldMat);
    collar.position.y = 0.52;
    staff.add(collar);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), crystalMat);
    crystal.position.y = 0.66;
    staff.add(crystal);
    staff.position.set(0.1, -0.32, 0.06);
    add(staff, a.parts.armRPivot);

    return [hatMat, goldMat, woodMat, crystalMat];
  }

  /** Retira el equipo anterior del avatar (nodos + materiales). */  _clearGear(a) {
    for (const { obj, parent } of a.gearNodes || []) {
      parent.remove(obj);
      obj.traverse((o) => { if (o.isMesh) o.geometry.dispose?.(); });
    }
    for (const m of a.gearMats || []) m.dispose?.();
    a.gearNodes = [];
    a.gearMats = [];
    if (a.gear) {
      a.mesh.remove(a.gear);
      a.gear = null;
    }
  }

  /** Cambia el equipo visual según el id del héroe ('paladin', etc.). */
  setHeroGear(a, heroId) {
    if (!a || a.heroId === (heroId || null)) return;
    this._clearGear(a);
    a.heroId = heroId || null;
    const build = (heroId && GEAR_BUILDERS[heroId]) || null;
    if (!build) return;
    const gear = new THREE.Group();
    a.mesh.add(gear);
    a.gear = gear;
    a.gearNodes = [];
    a.gearMats = [];
    const add = (obj, parent) => {
      parent.add(obj);
      a.gearNodes.push({ obj, parent });
    };
    a.gearMats = build(a, this._geoCache, add) || [];
  }

  static colorFor(id) {
    return PLAYER_PALETTE[id % PLAYER_PALETTE.length];
  }

  static createNameSprite(name, color = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Fondo oscuro redondeado
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    if (ctx.roundRect) {
      ctx.roundRect(8, 6, 240, 52, 14);
    } else {
      ctx.rect(8, 6, 240, 52);
    }
    ctx.fill();

    // Borde temático del héroe
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Emblema circular del color del aventurero
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(30, 32, 7, 0, Math.PI * 2);
    ctx.fill();

    // Texto con el apodo del jugador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayName = (name && name.trim()) ? name.trim().slice(0, 12) : 'Aventurero';
    ctx.fillText(displayName, 46, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.5, 0.38, 1);
    sprite.position.set(0, (AVATAR_H / 2) + 0.35, 0);
    sprite.renderOrder = 999;
    return sprite;
  }

  ensure(id, color = AvatarRenderer.colorFor(id)) {
    let a = this.avatars.get(id);
    if (a) return a;

    // Materiales con el color del héroe (túnica y pelo)
    const tunicMat = new THREE.MeshLambertMaterial({ color });
    const hairMat = new THREE.MeshLambertMaterial({ color });
    const G = this._geoCache;
    const M = this._sharedMats;

    const root = new THREE.Group();

    // Cabeza: piel por los lados, cara al frente (+z), pelo arriba y atrás.
    // Base 25 mm dentro del torso para que no haya caras casi-coplanares.
    const headMesh = new THREE.Mesh(G.head, [M.skin, M.skin, hairMat, M.skin, M.face, hairMat]);
    headMesh.position.set(0, 1.6, 0);
    root.add(headMesh);

    // Torso con túnica del héroe + cinto de forja
    const torsoMesh = new THREE.Mesh(G.torso, tunicMat);
    torsoMesh.position.set(0, 1.05, 0);
    root.add(torsoMesh);
    const beltMesh = new THREE.Mesh(G.belt, M.belt);
    beltMesh.position.set(0, 0.78, 0);
    root.add(beltMesh);

    // Brazos con pivote en el hombro (y=1.32), incrustados 25 mm en el torso
    const armLPivot = new THREE.Group();
    armLPivot.position.set(-0.34, 1.32, 0);
    const armL = new THREE.Mesh(G.arm, tunicMat);
    armLPivot.add(armL);
    root.add(armLPivot);
    const armRPivot = new THREE.Group();
    armRPivot.position.set(0.34, 1.32, 0);
    const armR = new THREE.Mesh(G.arm, tunicMat);
    armRPivot.add(armR);
    root.add(armRPivot);

    // Piernas con pivote en la cadera (y=0.75)
    const legLPivot = new THREE.Group();
    legLPivot.position.set(-0.14, 0.75, 0);
    const legL = new THREE.Mesh(G.leg, M.pants);
    legLPivot.add(legL);
    root.add(legLPivot);
    const legRPivot = new THREE.Group();
    legRPivot.position.set(0.14, 0.75, 0);
    const legR = new THREE.Mesh(G.leg, M.pants);
    legRPivot.add(legR);
    root.add(legRPivot);

    root.position.set(0, 1, 0);
    this.scene.add(root);
    a = {
      mesh: root,
      mats: [tunicMat, hairMat],
      gear: null,
      gearNodes: [],
      gearMats: [],
      heroId: null,
      parts: { armLPivot, armRPivot, legLPivot, legRPivot },
      sprite: null,
      name: 'Aventurero',
      target:  { x: 0, y: 1, z: 0, yaw: 0 },
      current: { x: 0, y: 1, z: 0, yaw: 0 },
      speed: 0,
      walkPhase: Math.random() * Math.PI * 2,
      isLocal: false,
    };
    this.avatars.set(id, a);
    return a;
  }

  setMetadata(id, name, color, heroId = null) {
    const a = this.ensure(id, color);
    if (color !== undefined) {
      for (const m of a.mats) m.color.set(color);
    }
    this.setHeroGear(a, heroId);
    if (name) {
      a.name = name;
      if (a.sprite) {
        a.mesh.remove(a.sprite);
        a.sprite.material.map.dispose();
        a.sprite.material.dispose();
      }
      const hexColor = typeof color === 'string'
        ? color
        : (color !== undefined ? '#' + Number(color).toString(16).padStart(6, '0') : '#38bdf8');
      a.sprite = AvatarRenderer.createNameSprite(name, hexColor);
      a.mesh.add(a.sprite);
    }
  }

  remove(id) {
    const a = this.avatars.get(id);
    if (!a) return;
    this._clearGear(a);
    if (a.sprite) {
      a.mesh.remove(a.sprite);
      a.sprite.material.map.dispose();
      a.sprite.material.dispose();
    }
    this.scene.remove(a.mesh);
    for (const m of a.mats || []) m.dispose();
    this.avatars.delete(id);
  }

  setTarget(id, x, y, z, yaw, color = AvatarRenderer.colorFor(id)) {
    const a = this.ensure(id, color);
    a.target.x = x;
    a.target.y = y;
    a.target.z = z;
    a.target.yaw = yaw;
    // Teletransporte si la diferencia es enorme (join inicial)
    if (Math.abs(a.current.x - x) > 8 || Math.abs(a.current.z - z) > 8) {
      a.current.x = x;
      a.current.y = y;
      a.current.z = z;
      a.current.yaw = yaw;
    }
  }

  setFrozen(id, isFrozen = false) {
    const a = this.avatars.get(id);
    if (!a) return;
    if (a.isFrozen !== isFrozen) {
      a.isFrozen = isFrozen;
      // Solo los materiales propios (túnica/pelo): los compartidos no se tocan
      for (const m of a.mats || []) {
        m.opacity = isFrozen ? 0.55 : 1.0;
        m.transparent = isFrozen;
      }
    }
  }

  /**
   * Avatar del jugador local (tercera persona): sin etiqueta de nombre y con
   * snap directo (sin interpolación) para cero latencia visual.
   */
  updateLocal(id, x, y, z, yaw, color, heroId = null) {
    const a = this.ensure(id, color);
    a.isLocal = true;
    if (color !== undefined) {
      for (const m of a.mats) m.color.set(color);
    }
    this.setHeroGear(a, heroId);
    const now = performance.now();
    const dt = a._lt ? Math.min(0.25, (now - a._lt) / 1000) : 0.016;
    a._lt = now;
    if (dt > 1e-4) {
      const inst = Math.hypot(x - a.current.x, z - a.current.z) / dt;
      a.speed += (Math.min(inst, 8) - a.speed) * 0.35;
    }
    a.mesh.visible = true;
    a.target.x = x;
    a.target.y = y;
    a.target.z = z;
    a.target.yaw = yaw;
    a.current.x = x;
    a.current.y = y;
    a.current.z = z;
    a.current.yaw = yaw;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.y = yaw + Math.PI;
  }

  setLocalVisible(id, visible) {
    const a = this.avatars.get(id);
    if (a) a.mesh.visible = visible;
  }

  /** dt en segundos; usa un factor independiente del framerate. */
  update(dt) {
    const t = 1 - Math.pow(0.0001, dt); // lerp rápido y estable
    for (const a of this.avatars.values()) {
      if (!a.isLocal) {
        const px = a.current.x;
        const pz = a.current.z;
        a.current.x += (a.target.x - a.current.x) * t;
        a.current.y += (a.target.y - a.current.y) * t;
        a.current.z += (a.target.z - a.current.z) * t;

        let dy = a.target.yaw - a.current.yaw;
        while (dy > Math.PI) dy -= Math.PI * 2;
        while (dy < -Math.PI) dy += Math.PI * 2;
        a.current.yaw += dy * t;

        // Velocidad horizontal para la animación de marcha
        const inst = Math.hypot(a.current.x - px, a.current.z - pz) / Math.max(dt, 1e-4);
        a.speed += (Math.min(inst, 8) - a.speed) * Math.min(1, dt * 6);

        // El grupo tiene origen en los pies (las piezas usan altura absoluta)
        a.mesh.position.set(a.current.x, a.current.y, a.current.z);
        a.mesh.rotation.y = a.current.yaw + Math.PI; // cara (+z) hacia el avance
      }

      // Marcha: brazos y piernas opuestos; balanceo sutil en reposo
      const amp = 0.06 + Math.min(0.65, a.speed * 0.14);
      a.walkPhase += dt * (2.5 + a.speed * 2.0);
      const s = Math.sin(a.walkPhase) * amp;
      a.parts.armLPivot.rotation.x = s;
      a.parts.armRPivot.rotation.x = -s;
      a.parts.legLPivot.rotation.x = -s;
      a.parts.legRPivot.rotation.x = s;
    }
  }
}
