// src/render/firstPersonAttacks.js

/**
 * Evalúa las cinemáticas procedurales de ataque canónico para cada héroe en función del progreso p [0..1].
 * @param {string} heroKey
 * @param {number} p
 * @param {Object} refs Mallas y materiales reactivos del héroe
 * @returns {{atkX: number, atkY: number, atkZ: number, atkRotX: number, atkRotY: number, atkRotZ: number}}
 */
export function evaluateHeroAttack(heroKey, p, refs) {
  let atkX = 0, atkY = 0, atkZ = 0;
  let atkRotX = 0, atkRotY = 0, atkRotZ = 0;

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
    // Mandoble de la Luz: Alzada bimanual pesada, barrido horizontal de 180°, inercia de filo y recuperación
    if (p < 0.25) {
      // Fase 1: Alzada y concentración sagrada (Heavy Wind-up)
      const t = p / 0.25;
      atkY = t * 0.12;
      atkZ = t * 0.08;
      atkX = t * 0.04;
      atkRotX = t * 0.45;
      atkRotZ = -t * 0.35;
      atkRotY = t * 0.30;
      if (refs.paladinCoreMesh?.material) {
        refs.paladinCoreMesh.material.emissiveIntensity = 0.35 + t * 1.2;
      }
      if (refs.paladinFullerMesh?.material) {
        refs.paladinFullerMesh.material.emissiveIntensity = 0.1 + t * 0.8;
      }
    } else if (p < 0.58) {
      // Fase 2: Gran barrido horizontal de 180° (Devastating Cleave Sweep)
      const t = (p - 0.25) / 0.33;
      atkX = 0.04 - t * 0.34;
      atkY = 0.12 - t * 0.18;
      atkZ = 0.08 - t * 0.12;
      atkRotY = 0.30 - t * 2.15;
      atkRotZ = -0.35 + t * 0.95;
      atkRotX = 0.45 - t * 0.85;
      if (refs.paladinCoreMesh?.material) {
        refs.paladinCoreMesh.material.emissiveIntensity = 1.5 + (1 - Math.abs(t - 0.5) * 2) * 1.3;
      }
      if (refs.paladinFullerMesh?.material) {
        refs.paladinFullerMesh.material.emissiveIntensity = 0.9 + (1 - Math.abs(t - 0.5) * 2) * 0.9;
      }
    } else if (p < 0.78) {
      // Fase 3: Retención de inercia colosal y amortiguación (Momentum Follow-through)
      const t = (p - 0.58) / 0.20;
      const dissipate = 1 - t;
      const tremor = Math.sin(t * Math.PI * 6) * dissipate * 0.008;
      atkX = -0.30 + t * 0.10 + tremor;
      atkY = -0.06 + t * 0.03;
      atkZ = -0.04 + t * 0.02;
      atkRotY = -1.85 + t * 0.40;
      atkRotZ = 0.60 - t * 0.15;
      atkRotX = -0.40 + t * 0.12;
      if (refs.paladinCoreMesh?.material) {
        refs.paladinCoreMesh.material.emissiveIntensity = 0.35 + dissipate * 0.6;
      }
      if (refs.paladinFullerMesh?.material) {
        refs.paladinFullerMesh.material.emissiveIntensity = 0.1 + dissipate * 0.3;
      }
    } else {
      // Fase 4: Retorno a guardia de vanguardia (Recovery)
      const t = (p - 0.78) / 0.22;
      const ease = 1 - t * t;
      atkX = -0.20 * ease;
      atkY = -0.03 * ease;
      atkZ = -0.02 * ease;
      atkRotY = -1.45 * ease;
      atkRotZ = 0.45 * ease;
      atkRotX = -0.28 * ease;
      if (refs.paladinCoreMesh?.material) {
        refs.paladinCoreMesh.material.emissiveIntensity = 0.35;
      }
      if (refs.paladinFullerMesh?.material) {
        refs.paladinFullerMesh.material.emissiveIntensity = 0.1;
      }
    }
  } else if (heroKey === 'ranger') {
    // Arco rúnico: Tensado, suelta elástica, oscilación de cuerda y recarga
    if (p < 0.35) {
      // Fase 1: Tensado (Draw) - retrae el arco, alinea y tensa la cuerda
      const t = p / 0.35;
      const drawVibe = Math.sin(t * Math.PI * 6) * t * 0.003;
      atkZ = t * 0.08 + drawVibe;
      atkX = -t * 0.04;
      atkRotX = t * 0.12;
      atkRotZ = t * 0.18;
      if (refs.rangerStringMesh) refs.rangerStringMesh.position.z = -0.04 - t * 0.08;
      if (refs.rangerArrowMesh) {
        refs.rangerArrowMesh.visible = true;
        refs.rangerArrowMesh.position.z = 0.08 - t * 0.08;
      }
      if (refs.rangerGemMesh?.material) {
        refs.rangerGemMesh.material.emissiveIntensity = 0.4 + t * 1.2;
      }
    } else if (p < 0.52) {
      // Fase 2: Suelta instantánea (Release) - la flecha sale propulsada
      const t = (p - 0.35) / 0.17;
      atkZ = 0.08 - t * 0.18;
      atkX = -0.04 + t * 0.02;
      atkRotX = 0.12 - t * 0.28;
      atkRotZ = 0.18 - t * 0.24;
      if (refs.rangerStringMesh) refs.rangerStringMesh.position.z = -0.12 + t * 0.08;
      if (refs.rangerArrowMesh) {
        refs.rangerArrowMesh.position.z = 0.00 + t * 0.60;
        if (t > 0.4) refs.rangerArrowMesh.visible = false;
      }
      if (refs.rangerGemMesh?.material) {
        refs.rangerGemMesh.material.emissiveIntensity = 1.6 + (1 - t) * 0.8;
      }
    } else if (p < 0.75) {
      // Fase 3: Micro-vibración y latigazo resonante de la cuerda
      const t = (p - 0.52) / 0.23;
      const tremor = Math.sin(t * Math.PI * 10) * (1 - t) * 0.010;
      atkZ = -0.10 + t * 0.05 + tremor;
      atkRotX = -0.16 + t * 0.08;
      atkRotZ = -0.06 + tremor * 2;
      if (refs.rangerStringMesh) refs.rangerStringMesh.position.z = -0.04 + tremor * 0.5;
      if (refs.rangerArrowMesh) refs.rangerArrowMesh.visible = false;
      if (refs.rangerGemMesh?.material) {
        refs.rangerGemMesh.material.emissiveIntensity = 0.4 + (1 - t) * 0.4;
      }
    } else {
      // Fase 4: Recarga y retorno suave a postura de guardia
      const t = (p - 0.75) / 0.25;
      const ease = 1 - t * t;
      atkZ = -0.05 * ease;
      atkRotX = -0.08 * ease;
      atkRotZ = -0.02 * ease;
      if (refs.rangerStringMesh) refs.rangerStringMesh.position.z = -0.04;
      if (refs.rangerArrowMesh) {
        refs.rangerArrowMesh.visible = true;
        refs.rangerArrowMesh.position.z = 0.08;
      }
      if (refs.rangerGemMesh?.material) {
        refs.rangerGemMesh.material.emissiveIntensity = 0.4;
      }
    }
  } else if (heroKey === 'wizard') {
    // Canalización, concentración de plasma y descarga de rayo arcano (4 fases)
    if (p < 0.24) {
      // Fase 1: Carga y elevación mística con micro-vibración
      const t = p / 0.24;
      const channelVibe = Math.sin(t * Math.PI * 8) * t * 0.005;
      atkY = t * 0.10 + channelVibe;
      atkZ = t * 0.06;
      atkRotX = t * 0.28;
      atkRotZ = -t * 0.12;
      if (refs.crystalMesh?.material) {
        refs.crystalMesh.material.emissiveIntensity = 0.8 + t * 0.8;
      }
      if (refs.wizardCoreMesh?.material) {
        refs.wizardCoreMesh.material.emissiveIntensity = 1.5 + t * 1.0;
      }
    } else if (p < 0.52) {
      // Fase 2: Descarga violenta de plasma arcano al frente (punto de mira)
      const t = (p - 0.24) / 0.28;
      const thrust = t * t;
      atkZ = 0.06 - thrust * 0.26;
      atkY = 0.10 - thrust * 0.08;
      atkRotX = 0.28 - thrust * 0.65;
      atkRotY = -thrust * 0.15;
      atkRotZ = -0.12 + thrust * 0.18;
      if (refs.crystalMesh?.material) {
        refs.crystalMesh.material.emissiveIntensity = 1.6 + (1 - Math.abs(t - 0.5) * 2) * 1.2;
      }
      if (refs.wizardCoreMesh?.material) {
        refs.wizardCoreMesh.material.emissiveIntensity = 2.5 + (1 - Math.abs(t - 0.5) * 2) * 1.5;
      }
    } else if (p < 0.76) {
      // Fase 3: Retroceso elástico y disipación de energía residual
      const t = (p - 0.52) / 0.24;
      const dissipate = 1 - t;
      const recoilVibe = Math.sin(t * Math.PI * 6) * dissipate * 0.006;
      atkZ = -0.20 + t * 0.10 + recoilVibe;
      atkY = 0.02 + Math.sin(t * Math.PI) * 0.04;
      atkRotX = -0.37 + t * 0.22;
      atkRotY = -0.15 + t * 0.09;
      atkRotZ = 0.06 - t * 0.04;
      if (refs.crystalMesh?.material) {
        refs.crystalMesh.material.emissiveIntensity = 0.8 + dissipate * 0.8;
      }
      if (refs.wizardCoreMesh?.material) {
        refs.wizardCoreMesh.material.emissiveIntensity = 1.5 + dissipate * 1.0;
      }
    } else {
      // Fase 4: Retorno armónico suave al reposo
      const t = (p - 0.76) / 0.24;
      const ease = 1 - t * t;
      atkZ = -0.10 * ease;
      atkY = 0.02 * ease;
      atkRotX = -0.15 * ease;
      atkRotY = -0.06 * ease;
      atkRotZ = 0.02 * ease;
      if (refs.crystalMesh?.material) {
        refs.crystalMesh.material.emissiveIntensity = 0.8;
      }
      if (refs.wizardCoreMesh?.material) {
        refs.wizardCoreMesh.material.emissiveIntensity = 1.5;
      }
    }
  } else if (heroKey === 'guardian') {
    // Mazo sísmico: alzada bimano y golpe descendente demoledor
    if (p < 0.32) {
      const t = p / 0.32;
      atkY = t * 0.16;
      atkZ = t * 0.06;
      atkX = t * 0.03;
      atkRotX = t * 0.55;
      atkRotY = t * 0.18;
      atkRotZ = -t * 0.22;
      if (refs.guardianRuneMesh?.material) {
        refs.guardianRuneMesh.material.emissiveIntensity = 0.6 + t * 0.8;
      }
    } else if (p < 0.52) {
      const t = (p - 0.32) / 0.20;
      const a = t * t;
      atkY = 0.16 - a * 0.44;
      atkZ = 0.06 - a * 0.22;
      atkX = 0.03 - a * 0.09;
      atkRotX = 0.55 - a * 1.55;
      atkRotY = 0.18 - a * 0.38;
      atkRotZ = -0.22 + a * 0.30;
      if (refs.guardianRuneMesh?.material) {
        refs.guardianRuneMesh.material.emissiveIntensity = 1.4 + a * 1.2;
      }
    } else if (p < 0.72) {
      const t = (p - 0.52) / 0.20;
      const tremor = Math.sin(t * Math.PI * 8) * (1 - t) * 0.014;
      const side = Math.cos(t * Math.PI * 6) * (1 - t) * 0.008;
      atkY = -0.28 + t * 0.12 + tremor;
      atkZ = -0.16 + t * 0.08;
      atkX = -0.06 + side;
      atkRotX = -1.0 + t * 0.45;
      atkRotY = -0.20 + t * 0.10;
      atkRotZ = 0.08 - t * 0.04;
      if (refs.guardianRuneMesh?.material) {
        refs.guardianRuneMesh.material.emissiveIntensity = 2.6 * (1 - t) + 0.6 * t;
      }
    } else {
      const t = (p - 0.72) / 0.28;
      const ease = 1 - t * t;
      atkY = -0.16 * ease;
      atkZ = -0.08 * ease;
      atkX = -0.04 * ease;
      atkRotX = -0.55 * ease;
      atkRotY = -0.10 * ease;
      atkRotZ = 0.04 * ease;
      if (refs.guardianRuneMesh?.material) {
        refs.guardianRuneMesh.material.emissiveIntensity = 0.6;
      }
    }
  }

  return { atkX, atkY, atkZ, atkRotX, atkRotY, atkRotZ };
}

/**
 * Restablece los materiales y mallas secundarias al estado base de reposo.
 * @param {Object} refs
 */
export function resetHeroAttackMeshes(refs) {
  if (refs.guardianRuneMesh?.material) refs.guardianRuneMesh.material.emissiveIntensity = 0.6;
  if (refs.paladinCoreMesh?.material) refs.paladinCoreMesh.material.emissiveIntensity = 0.35;
  if (refs.paladinFullerMesh?.material) refs.paladinFullerMesh.material.emissiveIntensity = 0.1;
  if (refs.crystalMesh?.material) refs.crystalMesh.material.emissiveIntensity = 0.8;
  if (refs.wizardCoreMesh?.material) refs.wizardCoreMesh.material.emissiveIntensity = 1.5;
  if (refs.rangerGemMesh?.material) refs.rangerGemMesh.material.emissiveIntensity = 0.4;
  if (refs.rangerArrowMesh) {
    refs.rangerArrowMesh.visible = true;
    refs.rangerArrowMesh.position.z = 0.08;
  }
  if (refs.rangerStringMesh) refs.rangerStringMesh.position.z = -0.04;
}
