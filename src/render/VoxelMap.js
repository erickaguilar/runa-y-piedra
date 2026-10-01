import * as THREE from 'three';
import { WORLD_X, WORLD_Y, WORLD_Z, WORLD_MIN_Y, WORLD_Y_SIZE } from '../core/World.js';
import { BLOCK_COLORS, BLOCK_TYPES } from '../config/constants.js';
import { TextureGenerator } from './TextureGenerator.js';

const THREE_COLORS = {
  1: new THREE.Color(BLOCK_COLORS[1] || 0xffffff),
  2: new THREE.Color(BLOCK_COLORS[2]),
  3: new THREE.Color(BLOCK_COLORS[3]),
  4: new THREE.Color(BLOCK_COLORS[4]),
  5: new THREE.Color(BLOCK_COLORS[5]),
  6: new THREE.Color(BLOCK_COLORS[6]),
  7: new THREE.Color(BLOCK_COLORS[7]),
  8: new THREE.Color(BLOCK_COLORS[8] || 0xffffff),
  9: new THREE.Color(BLOCK_COLORS[9] || 0xffffff),
  10: new THREE.Color(BLOCK_COLORS[10] || 0xffffff),
};

export class VoxelMap {
  constructor(scene, world) {
    this.world = world;
    this.scene = scene;
    this.minY = world.minY ?? WORLD_MIN_Y;
    this.sizeY = world.sizeY ?? WORLD_Y_SIZE;
    this.max = WORLD_X * this.sizeY * WORLD_Z;

    const geo = new THREE.BoxGeometry(1, 1, 1);

    // Buffer instanciado para atlasOffset: vec2 (u, v) por cada bloque del mundo
    this.atlasOffsets = new Float32Array(this.max * 2);
    this.atlasAttr = new THREE.InstancedBufferAttribute(this.atlasOffsets, 2);
    this.atlasAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('atlasOffset', this.atlasAttr);

    const texture = TextureGenerator.createVoxelAtlasTexture(512, 1024);
    const mat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: texture,
    });

    mat.onBeforeCompile = (shader) => {
      // Inyección en Vertex Shader: pasar atlasOffset como varying
      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_pars_vertex>',
        `#include <uv_pars_vertex>
attribute vec2 atlasOffset;
varying vec2 vAtlasOffset;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
vAtlasOffset = atlasOffset;`
      );

      // Inyección en Fragment Shader: calcular UV en el subcuadrante del atlas (4x8: cada casilla es 0.25 en U y 0.125 en V)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_pars_fragment>',
        `#include <map_pars_fragment>
varying vec2 vAtlasOffset;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
  vec2 tileUv = clamp(fract(vMapUv), 0.002, 0.998) * vec2(0.25, 0.125) + vAtlasOffset;
  vec4 sampledDiffuseColor = texture2D( map, tileUv );
  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
  #endif
  diffuseColor *= sampledDiffuseColor;
#endif`
      );
    };

    this.mesh = new THREE.InstancedMesh(geo, mat, this.max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;

    this.dummy = new THREE.Object3D();

    // Mapeos biyectivos
    this.blockToInst = new Int32Array(this.max).fill(-1);
    this.instToBlock = new Int32Array(this.max).fill(-1);
    this.freeSlots = [];
    this.usedCount = 0;

    scene.add(this.mesh);

    this.rebuildFromWorld();
  }

  addBlock(x, y, z, type) {
    if (type === BLOCK_TYPES.DOOR) return; // Las puertas las renderiza DoorRenderer con hojas 3D batientes
    if (type === BLOCK_TYPES.PEDESTAL) return; // El pedestal lo renderiza PedestalRenderer como altar 3D
    const bIdx = this.world.idx(x, y, z);
    if (this.blockToInst[bIdx] !== -1) return;

    let inst;
    if (this.freeSlots.length) inst = this.freeSlots.pop();
    else inst = this.usedCount++;

    if (inst >= this.max) {
      console.warn('InstancedMesh full');
      return;
    }

    this.blockToInst[bIdx] = inst;
    this.instToBlock[inst] = bIdx;

    this.dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(1, 1, 1);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(inst, this.dummy.matrix);

    // Variación procedural por bloque (5 variantes de muro, 5 de piso, 5 de pilares)
    const tileIdx = VoxelMap.selectTile(x, y, z, type);
    const { u, v } = VoxelMap.getTileUVOffset(tileIdx);
    this.atlasOffsets[inst * 2] = u;
    this.atlasOffsets[inst * 2 + 1] = v;
    this.atlasAttr.needsUpdate = true;

    this.mesh.setColorAt(inst, THREE_COLORS[type] || THREE_COLORS[1]);
    this.mesh.count = Math.max(this.mesh.count, inst + 1);
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  removeBlock(x, y, z) {    const bIdx = this.world.idx(x, y, z);
    const inst = this.blockToInst[bIdx];
    if (inst === -1) return;

    // Fuera de pantalla + escala 0
    this.dummy.position.set(0, -9999, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(inst, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;

    this.blockToInst[bIdx] = -1;
    this.instToBlock[inst] = -1;
    this.freeSlots.push(inst);
  }

  /**
   * Tiñe un bloque instanciado (multiplica su color, p. ej. para oscurecer el pozo).
   * Se pierde al rebuildFromWorld; debe re-aplicarse tras recargar el nivel.
   */
  setTint(x, y, z, hex) {
    const bIdx = this.world.idx(x, y, z);
    const inst = this.blockToInst[bIdx];
    if (inst === undefined || inst === -1) return false;
    this.mesh.setColorAt(inst, new THREE.Color(hex));
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    return true;
  }

  openDoor(doorId = 1) {
    const door = this.world?.doors?.find(d => d.id === doorId);
    if (door && Array.isArray(door.coords)) {
      for (const c of door.coords) {
        this.removeBlock(c.x, c.y, c.z);
      }
    } else {
      if (doorId === 1) {
        this.removeBlock(11, 1, 11);
        this.removeBlock(11, 2, 11);
        this.removeBlock(12, 1, 11);
        this.removeBlock(12, 2, 11);
      } else if (doorId === 2) {
        this.removeBlock(11, 1, 24);
        this.removeBlock(11, 2, 24);
        this.removeBlock(12, 1, 24);
        this.removeBlock(12, 2, 24);
      }
    }
  }

  rebuildFromWorld() {
    this.blockToInst.fill(-1);
    this.instToBlock.fill(-1);
    this.freeSlots.length = 0;
    this.usedCount = 0;
    this.mesh.count = 0;

    for (let x = 0; x < WORLD_X; x++) {
      for (let y = this.minY; y < WORLD_Y; y++) {
        for (let z = 0; z < WORLD_Z; z++) {
          const t = this.world.get(x, y, z);
          if (t !== BLOCK_TYPES.AIR && t !== BLOCK_TYPES.DOOR && t !== BLOCK_TYPES.PEDESTAL) {
            this.addBlock(x, y, z, t);
          }
        }
      }
    }
  }

  /** Convierte índice interno en coordenadas {x, y, z}. */
  static blockIndexToXYZ(bIdx) {
    const x = bIdx % WORLD_X;
    const tmp = Math.floor(bIdx / WORLD_X);
    const y = (tmp % WORLD_Y_SIZE) + WORLD_MIN_Y;
    const z = Math.floor(tmp / WORLD_Y_SIZE);
    return { x, y, z };
  }

  /**
   * Hash pseudoaleatorio determinista de 32-bit para coordenadas (x, y, z).
   * O(1), libre de colisiones locales, reproducible idénticamente en cliente y host.
   */
  static hashCoord(x, y, z) {
    let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
  }

  /**
   * Selecciona deterministamente una de las 5 variantes por grupo de bloque:
   * - Muros (Tiles 0 a 4): Sillar regular, sillar agrietado, mampostería, musgo, glifo rúnico.
   * - Suelo (Tiles 5 a 9): Grandes losas 2x2, losa fracturada, adoquines, losa musgosa, rombo ceremonial.
   * - Pilares (5 variaciones, Tiles 10, 12, 20, 21, 22): Columna monolítica base, columna lisa, columna con musgo, columna con desgaste, columna tono oscuro.
   */
  static selectTile(x, y, z, type) {
    const h = VoxelMap.hashCoord(x, y, z);

    switch (type) {
      case BLOCK_TYPES.WALL: {
        // Ponderado arquitectónico: sillar regular dominante, grietas, mampostería y musgo orgánicos, glifos ancestrales
        const wallPalette = [0, 0, 0, 0, 1, 1, 2, 2, 3, 4];
        return wallPalette[h % wallPalette.length];
      }
      case BLOCK_TYPES.STONE_FLOOR:
      case BLOCK_TYPES.FLOOR_STONE:
      case BLOCK_TYPES.FLOOR_WORN:
      case BLOCK_TYPES.FLOOR_MOSS: {
        if (type === BLOCK_TYPES.FLOOR_STONE) return 5; // floorTiles (adoquín limpio)
        if (type === BLOCK_TYPES.FLOOR_WORN) return 6;  // floorTilesWorn (con grietas)
        if (type === BLOCK_TYPES.FLOOR_MOSS) return 7;  // floorTilesMossy (con musgo)

        // Si es STONE_FLOOR genérico (tipo 1): distribución determinista estable (70% limpio, 20% con grietas, 10% con musgo)
        const hFloor = ((x * 374761393) ^ (z * 668265263)) >>> 0;
        const r = hFloor % 100;
        if (r < 70) return 5; // floorTiles
        if (r < 90) return 6; // floorTilesWorn
        return 7;             // floorTilesMossy
      }
      case BLOCK_TYPES.PILLAR: {
        // 5 Variantes de Pilares / Columnas (distribución orgánica determinista):
        // Tile 10: Columna Monolítica Continua (fuste estándar con micro-desgaste)
        // Tile 12: Columna Acanalada Lisa (fuste de cantería limpio)
        // Tile 20: Columna con Musgo (vegetación y líquenes en hendiduras de estrías)
        // Tile 21: Columna con Desgaste (fracturas estructurales y mampostería erosionada)
        // Tile 22: Columna Tono Oscuro (sillar de basalto ensombrecido)
        const pillarPalette = [10, 12, 20, 21, 22];
        return pillarPalette[h % pillarPalette.length];
      }
      case BLOCK_TYPES.RESPAWN_PAD:
        return 11; // Losa rúnica de aparición / reaparición con glifo cian celestial
      case BLOCK_TYPES.JUMP_PAD:
        return 14; // Losa de cantería con runa ámbar de salto y refuerzos de forja
      case BLOCK_TYPES.PEDESTAL:
        return 15; // Círculo rúnico arcano con estrella de 8 puntas para el pedestal
      case BLOCK_TYPES.LAVA: {
        // 5 Variantes de Lava (distribución orgánica determinista):
        // Tile 13: Magma Activo (corrientes de convección y afluentes)
        // Tile 16: Corteza de Basalto & Fisuras Tectónicas Ardientes
        // Tile 17: Géiseres, Domos de Gas & Burbujas Hirvientes
        // Tile 18: Río Rápido de Magma / Corriente Piroclástica Diagonal
        // Tile 19: Caldera de Fusión Pura / Núcleo Solar Blanco-Dorado
        const lavaPalette = [13, 16, 17, 18, 19];
        return lavaPalette[h % lavaPalette.length];
      }
      default:
        return 0;
    }
  }

  /**
   * Convierte el índice de casilla en el atlas de 4x8 (0 a 31) en coordenadas UV normalizadas [0, 1].
   */
  static getTileUVOffset(tileIndex) {
    const col = tileIndex % 4;
    const row = Math.floor(tileIndex / 4);
    const u = col * 0.25;
    const v = (7 - row) * 0.125;
    return { u, v };
  }
}
