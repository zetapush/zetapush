import { Client } from './basic.js';
import { Authentication } from '../authentication/handshake.js';
import { SessionPersistenceStrategy } from '../utils/session-persistence.js';

/**
 * WeakClient config object.
 * @typedef {Object} WeakClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} deploymentId - Authentication deployment id, default value is 'weak_0'
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 * @property {Array} transports - Client transports list
 */

/**
 * @access public
 * @extends {Client}
 * @example
 * // Create a new WeakClient
 * const client = new ZetaPush.WeakClient({
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 * @example
 * // Explicit deploymentId
 * // WeakClient provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
 * // deploymentId default value is weak_0
 * const client = new ZetaPush.WeakClient({
 *   deploymentId: 'weak_0',
 *   sandboxId: '<YOUR-SANDBOX-ID>'
 * })
 */
export class WeakClient extends Client {
  /**
   * Create a new ZetaPush WeakClient
   * @param {WeakClientConfig} config
   */
  constructor({
    apiUrl,
    sandboxId,
    deploymentId,
    forceHttps,
    resource,
    transports,
  }) {
    const authentication = () => {
      const token = this.getToken();
      const handshake = Authentication.weak({
        deploymentId,
        token,
      });
      return handshake;
    };
    /**
     * Call Client constructor with specific parameters
     */
    super({
      apiUrl,
      sandboxId,
      forceHttps,
      authentication,
      resource,
      transports,
    });
    // Handle successful handshake
    const onSuccessfulHandshake = ({ publicToken, userId, token }) => {
      if (token) {
        this.strategy.set({ publicToken, userId, token });
      }
    };
    this.addConnectionStatusListener({ onSuccessfulHandshake });
    /**
     * @access private
     * @type {SessionPersistenceStrategy}
     */
    this.strategy = new SessionPersistenceStrategy({ sandboxId });
  }
  /**
   * @return {string} The stored token
   */
  getToken() {
    const { token } = this.strategy.get();
    return token;
  }
}
