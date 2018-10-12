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
   * @param {{appName: string, storage: DOMStorage}} parameters
   */
  constructor({ appName, storage = platformStorage } = {}) {
    /**
     * @access private
     * @type {DOMStorage}
     */
    this.storage = storage;
    // Set application name
    this.setAppName(appName);
  }
  /**
   * Set application name
   * @param {string} appName
   */
  setAppName(appName) {
    /**
     * @access private
     * @type {string}
     */
    this.key = `${ZETAPUSH_SESSION_KEY}.${appName}`;
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
