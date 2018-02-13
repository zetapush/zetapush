import { platformStorage } from './storage';

/**
 * @type {string}
 */
export const ZETAPUSH_SESSION_KEY = 'zetapush.token';

/**
 * Provide abstraction for token persistence
 * @access protected
 */
export class SessionPersistenceStrategy {
  /**
   * @param {{sandboxId: string, storage: DOMStorage}} parameters
   */
  constructor({ sandboxId, storage = platformStorage } = {}) {
    /**
     * @access private
     * @type {string}
     */
    this.key = `${ZETAPUSH_SESSION_KEY}.${sandboxId}`;
    /**
     * @access private
     * @type {DOMStorage}
     */
    this.storage = storage;
  }
  /**
   * @return {string} session The stored session
   */
  get() {
    const { key, storage } = this;
    const json = storage.getItem(key) || '{}';
    let session = {};
    try {
      session = JSON.parse(json);
    } catch (e) {}
    return session;
  }
  /**
   * @param {Object} session The session to store
   */
  set(session = {}) {
    const { key, storage } = this;
    const json = JSON.stringify(session);
    try {
      storage.setItem(key, json);
    } catch (e) {}
    return session;
  }
}
