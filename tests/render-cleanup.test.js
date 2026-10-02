import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { VoxelMap } from '../src/render/VoxelMap.js';
import { AvatarRenderer } from '../src/render/AvatarRenderer.js';
import { World } from '../src/core/World.js';

describe('Render Lifecycle & WebGL Cleanup', () => {
  let origDoc;
  let origImg;

  before(() => {
    origDoc = global.document;
    origImg = global.Image;
    global.document = {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          fillRect: () => {},
          drawImage: () => {}
        })
      })
    };
    global.Image = class {
      set src(_v) {}
    };
  });

  after(() => {
    global.document = origDoc;
    global.Image = origImg;
  });

  it('VoxelMap.dispose() libera geometría, atlas de textura, material y referencias', () => {
    const scene = new THREE.Scene();
    const world = new World();
    const voxelMap = new VoxelMap(scene, world);

    assert.ok(voxelMap.mesh, 'InstancedMesh debe existir tras inicializar');
    assert.equal(scene.children.includes(voxelMap.mesh), true, 'mesh debe estar en la escena');

    let geomDisposed = false;
    let matDisposed = false;
    let texDisposed = false;

    voxelMap.mesh.geometry.dispose = () => { geomDisposed = true; };
    if (voxelMap.mesh.material.map) {
      voxelMap.mesh.material.map.dispose = () => { texDisposed = true; };
    }
    voxelMap.mesh.material.dispose = () => { matDisposed = true; };

    voxelMap.dispose();

    assert.equal(scene.children.includes(voxelMap.mesh), false, 'mesh debe ser retirado de la escena');
    assert.equal(geomDisposed, true, 'geometría debe ser desechada');
    assert.equal(matDisposed, true, 'material debe ser desechado');
    assert.equal(texDisposed, true, 'textura del atlas debe ser desechada');
    assert.equal(voxelMap.mesh, null, 'mesh debe ser null');
    assert.equal(voxelMap.blockToInst, null, 'buffers deben ser liberados');
  });

  it('AvatarRenderer.clear() y dispose() liberan muñecos y cachés compartidos', () => {
    const scene = new THREE.Scene();
    const avatars = new AvatarRenderer(scene);

    avatars.ensure(0, '#38bdf8');
    avatars.ensure(1, '#ef4444');
    assert.equal(avatars.avatars.size, 2);

    avatars.clear();
    assert.equal(avatars.avatars.size, 0);

    avatars.dispose();
    assert.equal(avatars._geoCache, null);
    assert.equal(avatars._sharedMats, null);
  });
});
