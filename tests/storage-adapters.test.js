import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MemoryAdapter,
  LocalStorageAdapter,
  IndexedDBAdapter,
  HybridStorageAdapter,
} from '../src/storage/StorageAdapters.js';

test('MemoryAdapter - CRUD básico y clear', async () => {
  const adapter = new MemoryAdapter();
  assert.equal(await adapter.get('test_key'), null);

  await adapter.set('test_key', { foo: 'bar', num: 42 });
  const val = await adapter.get('test_key');
  assert.deepEqual(val, { foo: 'bar', num: 42 });

  await adapter.delete('test_key');
  assert.equal(await adapter.get('test_key'), null);

  await adapter.set('k1', 'val1');
  await adapter.set('k2', 'val2');
  await adapter.clear();
  assert.equal(await adapter.get('k1'), null);
  assert.equal(await adapter.get('k2'), null);
});

test('LocalStorageAdapter - Prefijo y fallback ante entorno sin storage', async () => {
  const storageMap = new Map();
  const fakeLocalStorage = {
    getItem: (k) => storageMap.get(k) || null,
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
    get length() { return storageMap.size; },
    key: (i) => Array.from(storageMap.keys())[i] || null,
  };

  const originalLS = globalThis.localStorage;
  globalThis.localStorage = fakeLocalStorage;

  try {
    const adapter = new LocalStorageAdapter('test_runa_');
    assert.equal(await adapter.get('slot1'), null);

    await adapter.set('slot1', { name: 'Hero', gems: 100 });
    assert.ok(storageMap.has('test_runa_slot1'));

    const loaded = await adapter.get('slot1');
    assert.deepEqual(loaded, { name: 'Hero', gems: 100 });

    await adapter.delete('slot1');
    assert.equal(await adapter.get('slot1'), null);

    // Test clear por prefijo
    await adapter.set('a', 1);
    await adapter.set('b', 2);
    storageMap.set('other_app_key', 'preserve_me');
    await adapter.clear();
    assert.equal(await adapter.get('a'), null);
    assert.equal(await adapter.get('b'), null);
    assert.equal(storageMap.get('other_app_key'), 'preserve_me');
  } finally {
    globalThis.localStorage = originalLS;
  }
});

test('HybridStorageAdapter - Cascada y tolerancia a fallback sin IndexedDB', async () => {
  const adapter = new HybridStorageAdapter({ prefix: 'hybrid_test_' });

  // En entorno Node.js, IndexedDB no está disponible -> fallback en memoria / LS
  await adapter.set('player_data', { level: 3, score: 999 });
  const loaded = await adapter.get('player_data');
  assert.deepEqual(loaded, { level: 3, score: 999 });

  await adapter.delete('player_data');
  assert.equal(await adapter.get('player_data'), null);

  await adapter.set('slot_a', { gems: 10 });
  await adapter.set('slot_b', { gems: 20 });
  await adapter.clear();
  assert.equal(await adapter.get('slot_a'), null);
  assert.equal(await adapter.get('slot_b'), null);
});

test('IndexedDBAdapter - Detección estática isSupported', () => {
  if (typeof indexedDB === 'undefined') {
    assert.equal(IndexedDBAdapter.isSupported(), false);
  } else {
    assert.equal(IndexedDBAdapter.isSupported(), true);
  }
});
