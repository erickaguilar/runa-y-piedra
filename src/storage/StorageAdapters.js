/**
 * StorageAdapters.js - Adaptadores de persistencia modular para Runa y Piedra
 * 
 * Implementa almacenamiento desacoplado conforme a docs/24-almacenamiento-indexeddb:
 * - IndexedDBAdapter: Asíncrono, transaccional, cero bloqueo en hilo de render (60 FPS).
 * - LocalStorageAdapter: Síncrono/serializado, fallback en navegadores o modo incógnito.
 * - MemoryAdapter: En memoria (Map), ideal para tests unitarios Node.js y SSR.
 * - HybridStorageAdapter: Orquesta fallback transparente con sincronización en espejo.
 */

export class MemoryAdapter {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    if (!this.store.has(key)) return null;
    try {
      return JSON.parse(this.store.get(key));
    } catch {
      return null;
    }
  }

  async set(key, val) {
    this.store.set(key, JSON.stringify(val));
    return true;
  }

  async delete(key) {
    return this.store.delete(key);
  }

  async clear() {
    this.store.clear();
    return true;
  }
}

export class LocalStorageAdapter {
  constructor(prefix = 'runa_') {
    this.prefix = prefix;
  }

  _getStorage() {
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    } catch { /* Sandbox o sin permisos */ }
    return null;
  }

  async get(key) {
    const storage = this._getStorage();
    if (!storage) return null;
    try {
      const raw = storage.getItem(this.prefix + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async set(key, val) {
    const storage = this._getStorage();
    if (!storage) return false;
    try {
      storage.setItem(this.prefix + key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  }

  async delete(key) {
    const storage = this._getStorage();
    if (!storage) return false;
    try {
      storage.removeItem(this.prefix + key);
      return true;
    } catch {
      return false;
    }
  }

  async clear() {
    const storage = this._getStorage();
    if (!storage) return false;
    try {
      const toRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(this.prefix)) {
          toRemove.push(k);
        }
      }
      for (const k of toRemove) {
        storage.removeItem(k);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export class IndexedDBAdapter {
  constructor(dbName = 'runa_saves_db_v2', storeName = 'saves') {
    this.dbName = dbName;
    this.storeName = storeName;
    this._dbPromise = null;
  }

  static isSupported() {
    try {
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
      return false;
    }
  }

  _open() {
    if (this._dbPromise) return this._dbPromise;
    if (!IndexedDBAdapter.isSupported()) {
      return Promise.reject(new Error('IndexedDB no soportado en este entorno'));
    }

    this._dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          this._dbPromise = null;
          reject(req.error || new Error('Error al abrir base de datos IndexedDB'));
        };
      } catch (err) {
        this._dbPromise = null;
        reject(err);
      }
    });

    return this._dbPromise;
  }

  async get(key) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  }

  async set(key, val) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.put(val, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Error al escribir en IndexedDB'));
      tx.onabort = () => reject(tx.error || new Error('Transacción abortada en IndexedDB'));
    });
  }

  async delete(key) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Error al eliminar en IndexedDB'));
      tx.onabort = () => reject(tx.error || new Error('Transacción abortada en IndexedDB'));
    });
  }

  async clear() {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Error al vaciar IndexedDB'));
      tx.onabort = () => reject(tx.error || new Error('Transacción abortada en IndexedDB'));
    });
  }
}

/**
 * Adaptador híbrido con fallback transparente en cascada:
 * 1. IndexedDB (si está disponible y operativo, asíncrono y de cero impacto en 60 FPS)
 * 2. localStorage (fallback automático o espejo rápido)
 * 3. MemoryAdapter (para Node.js, tests o entornos sin storage)
 */
export class HybridStorageAdapter {
  constructor({ prefix = 'runa_', dbName = 'runa_saves_db_v2', storeName = 'saves' } = {}) {
    this.memory = new MemoryAdapter();
    this.ls = new LocalStorageAdapter(prefix);
    this.idb = IndexedDBAdapter.isSupported() ? new IndexedDBAdapter(dbName, storeName) : null;
    this.hasIdb = false;
    this.initChecked = false;
  }

  async _checkIdb() {
    if (this.initChecked) return this.hasIdb;
    this.initChecked = true;
    if (!this.idb) {
      this.hasIdb = false;
      return false;
    }
    try {
      // Probar apertura de IndexedDB
      await this.idb._open();
      this.hasIdb = true;
    } catch {
      this.hasIdb = false;
    }
    return this.hasIdb;
  }

  async get(key) {
    const canUseIdb = await this._checkIdb();
    if (canUseIdb) {
      try {
        const val = await this.idb.get(key);
        if (val !== null && val !== undefined) return val;
      } catch {
        this.hasIdb = false; // Degradar a LS si falla
      }
    }

    // Fallback a localStorage
    const lsVal = await this.ls.get(key);
    if (lsVal !== null && lsVal !== undefined) return lsVal;

    // Fallback a Memory
    return this.memory.get(key);
  }

  async set(key, val) {
    // 1. Espejo en memoria siempre (acceso O(1))
    await this.memory.set(key, val);

    // 2. Primario en IndexedDB si está disponible (asíncrono, estructurado, 0 jank)
    const canUseIdb = await this._checkIdb();
    if (canUseIdb) {
      try {
        await this.idb.set(key, val);
      } catch (err) {
        console.warn('[HybridStorageAdapter] Error al escribir en IndexedDB:', err);
        this.hasIdb = false;
      }
    }

    // 3. Espejo en localStorage tolerante a cuota
    try {
      await this.ls.set(key, val);
    } catch { /* QuotaExceededError tolerado */ }

    return true;
  }

  async delete(key) {
    await this.memory.delete(key);
    await this.ls.delete(key);
    const canUseIdb = await this._checkIdb();
    if (canUseIdb) {
      try {
        await this.idb.delete(key);
      } catch {
        this.hasIdb = false;
      }
    }
    return true;
  }

  async clear() {
    await this.memory.clear();
    await this.ls.clear();
    const canUseIdb = await this._checkIdb();
    if (canUseIdb) {
      try {
        await this.idb.clear();
      } catch {
        this.hasIdb = false;
      }
    }
    return true;
  }
}
