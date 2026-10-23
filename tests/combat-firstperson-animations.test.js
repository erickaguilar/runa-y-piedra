import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Mocks globales de navegador para entorno Node.js
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  navigator: { userAgent: 'node', maxTouchPoints: 0 },
};
globalThis.document = {
  createElement: () => ({
    style: {},
    appendChild: () => {},
    addEventListener: () => {},
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      fill: () => {},
      stroke: () => {},
      beginPath: () => {},
      roundRect: () => {},
    }),
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: () => null,
  body: { appendChild: () => {} },
};

import { FirstPersonWeaponRenderer } from '../src/render/FirstPersonWeaponRenderer.js';
import { HERO_WEAPONS } from '../src/config/combat.js';

test('FirstPersonWeaponRenderer: Integra brazo y mano del héroe con colores canónicos y renderOrder 9999', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);

  const heroClasses = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];

  for (const hero of heroClasses) {
    renderer.setHero(hero);
    assert.equal(renderer.currentHeroKey, hero);
    assert.ok(renderer.currentWeaponMesh, `Debe instanciar arma para ${hero}`);
    assert.ok(renderer.currentArmMesh, `Debe instanciar brazo para ${hero}`);
    assert.equal(renderer.currentArmMesh.name, `Arm_${hero}`);

    // Verificar que los meshes del brazo tengan renderOrder 9999 y no sean descartados por frustum
    let meshCount = 0;
    renderer.currentArmMesh.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        assert.equal(child.renderOrder, 9999, 'Las piezas del brazo deben renderizarse con prioridad 9999');
        assert.equal(child.frustumCulled, false, 'Las piezas del brazo no deben ser descartadas por frustum');
      }
    });
    assert.ok(meshCount >= 2, `El brazo de ${hero} debe contener al menos mano y antebrazo`);
  }

  renderer.dispose();
});

test('FirstPersonWeaponRenderer: Cinemática de respiración (Idle Breathing) y balanceo de marcha (Walk Bobbing)', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);
  renderer.setHero('adventurer');
  renderer.setVisible(true);

  const mockPlayerIdle = {
    pos: { x: 0, y: 1, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    pitch: 0,
    onGround: true,
  };

  const initialPosX = renderer.group.position.x;
  const initialPosY = renderer.group.position.y;

  // Actualizar varios frames en reposo
  for (let i = 0; i < 30; i++) {
    renderer.update(0.016, mockPlayerIdle);
  }

  // La respiración debe haber alterado levemente la posición vertical y horizontal
  assert.notEqual(renderer.group.position.y, initialPosY, 'La respiración idle debe modular Y');

  // Ahora simular desplazamiento rápido (caminando / corriendo)
  const mockPlayerWalking = {
    pos: { x: 0, y: 1, z: 0 },
    vel: { x: 3.5, y: 0, z: 0 },
    yaw: 0,
    pitch: 0,
    onGround: true,
  };

  const preWalkX = renderer.group.position.x;
  renderer.update(0.1, mockPlayerWalking);
  assert.notEqual(renderer.group.position.x, preWalkX, 'La marcha debe generar oscilación bobbing horizontal');

  renderer.dispose();
});

test('FirstPersonWeaponRenderer: Inercia de salto, caída y rebote de aterrizaje', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);
  renderer.setHero('paladin');
  renderer.setVisible(true);

  // 1. Jugador en el aire ascendiendo (salto)
  const mockAirAscending = {
    pos: { x: 0, y: 3, z: 0 },
    vel: { x: 0, y: 6.0, z: 0 },
    yaw: 0,
    pitch: 0,
    onGround: false,
  };

  for (let i = 0; i < 5; i++) {
    renderer.update(0.016, mockAirAscending);
  }
  assert.ok(renderer.jumpOffset !== 0, 'La inercia de salto vertical debe ser no nula');

  // 2. Aterrizaje en el suelo
  const mockLanding = {
    pos: { x: 0, y: 1, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    pitch: 0,
    onGround: true,
  };

  renderer.update(0.016, mockLanding);
  assert.ok(renderer.landingImpact < 0, 'El aterrizaje debe producir un impulso negativo de amortiguación');

  renderer.dispose();
});

test('FirstPersonWeaponRenderer: Inercia de giro de cámara (Look Sway)', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);
  renderer.setHero('ranger');
  renderer.setVisible(true);

  const player = {
    pos: { x: 0, y: 1, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    yaw: 0,
    pitch: 0,
    onGround: true,
  };

  // Frame inicial
  renderer.update(0.016, player);

  // Giro rápido a la derecha (yaw positivo) y hacia arriba (pitch positivo)
  player.yaw = 0.25;
  player.pitch = 0.15;
  renderer.update(0.016, player);

  assert.ok(renderer.swayPos.x !== 0, 'El giro de yaw debe generar sway horizontal');
  assert.ok(renderer.swayPos.y !== 0, 'El giro de pitch debe generar sway vertical');
  assert.ok(renderer.swayRot.z !== 0, 'El giro debe generar torsión angular en Z');

  renderer.dispose();
});

test('FirstPersonWeaponRenderer: Animaciones de ataque canónicas para los 5 héroes', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);
  renderer.setVisible(true);

  const heroClasses = ['adventurer', 'paladin', 'ranger', 'wizard', 'guardian'];

  for (let i = 0; i < heroClasses.length; i++) {
    const heroKey = heroClasses[i];
    const weapon = HERO_WEAPONS[i];
    renderer.setHero(heroKey);

    assert.equal(renderer.isAttacking, false);
    renderer.triggerAttack(weapon);
    assert.equal(renderer.isAttacking, true);
    assert.ok(renderer.attackDuration > 0);

    const player = {
      pos: { x: 0, y: 1, z: 0 },
      vel: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      onGround: true,
    };

    // Avanzar la animación mediante frames continuos hasta el clímax del golpe (~45% del tiempo)
    const targetMidTime = renderer.attackDuration * 0.45;
    while (renderer.attackTimer < targetMidTime) {
      renderer.update(0.016, player);
    }
    assert.equal(renderer.isAttacking, true, `${heroKey} debe continuar atacando en la mitad`);

    // Héroes específicos deben exhibir cinética característica en el impacto
    if (heroKey === 'adventurer') {
      // Estocada hacia adelante: Z negativo acentuado
      assert.ok(renderer.group.position.z < renderer.basePos.z, 'Aventurero debe proyectar la estocada al frente (-Z)');
    } else if (heroKey === 'paladin') {
      // Mandoble: gran rotación en Y/Z por el barrido horizontal
      assert.ok(Math.abs(renderer.group.rotation.y - renderer.baseRot.y) > 0.3, 'Paladín debe rotar en Y para el barrido');
    } else if (heroKey === 'ranger') {
      // Disparo de arco: suelta y retroceso
      assert.ok(renderer.group.position.z !== renderer.basePos.z, 'Ranger debe desplazar el arco durante el tensado/suelta');
    } else if (heroKey === 'wizard') {
      // Báculo: proyección mágica al frente y giro del cristal
      assert.ok(renderer.crystalMesh !== null, 'El hechicero debe vincular su cristal amatista');
    } else if (heroKey === 'guardian') {
      // Mazo: caída violenta hacia abajo en Y
      assert.ok(renderer.group.position.y < renderer.basePos.y, 'Guardián debe descargar el mazo hacia abajo (-Y)');
    }

    // Completar el tiempo total de ataque para verificar retorno al reposo
    while (renderer.isAttacking) {
      renderer.update(0.016, player);
    }
    assert.equal(renderer.isAttacking, false, `El ataque de ${heroKey} debe concluir y volver a reposo`);
  }

  renderer.dispose();
});

test('FirstPersonWeaponRenderer: Guardián integra empuñadura bimano, núcleo rúnico e iluminación de impacto', () => {
  const camera = new THREE.PerspectiveCamera();
  const renderer = new FirstPersonWeaponRenderer(camera);
  renderer.setHero('guardian');
  renderer.setVisible(true);

  assert.ok(renderer.guardianRuneMesh, 'Debe identificar el núcleo rúnico del martillo');

  let armMeshes = 0;
  renderer.currentArmMesh.traverse((child) => {
    if (child.isMesh) armMeshes++;
  });
  assert.ok(armMeshes >= 4, 'El Guardián debe poseer brazos y guanteletes bimanual (>= 4 meshes)');

  // Probar pulso rúnico en ataque
  renderer.triggerAttack(HERO_WEAPONS[4]);
  const mockPlayer = { pos: { x: 0, y: 1, z: 0 }, vel: { x: 0, y: 0, z: 0 }, yaw: 0, pitch: 0, onGround: true };

  // Avanzar al impacto mediante frames continuos
  const targetImpactTime = renderer.attackDuration * 0.48;
  while (renderer.attackTimer < targetImpactTime) {
    renderer.update(0.016, mockPlayer);
  }
  assert.ok(renderer.guardianRuneMesh.material.emissiveIntensity > 1.0, 'El núcleo rúnico debe intensificar su brillo en el impacto');

  renderer.dispose();
});
