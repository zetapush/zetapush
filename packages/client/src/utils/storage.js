/**
 * Provide fallback for DOMStorage
 * @access protected
 */
class MemoryStorage {
  constructor() {
    this._map = new Map();
  }
  getItem(key) {
    return this._map.get(key);
  }
  setItem(key, value) {
    return this._map.get(key);
  }
  removeItem(key) {
    this._map.delete(key);
  }
  clear() {
    this._map = new Map();
  }
  key(n) {
    return Array.from(this._map.keys())[n];
  }
  get length() {
    return this._map.size;
  }
}

/**
 * @type {Storage}
 * @access protected
 */
export const platformStorage = typeof localStorage === 'undefined' ? new MemoryStorage() : localStorage;
