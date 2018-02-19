import { ClientHelper } from './helper.js';
import { API_URL, FORCE_HTTPS } from '../utils/http.js';
import { ConnectionStatusListener } from '../connection/connection-status.js';

/**
 * Client config object.
 * @typedef {Object} ClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} sandboxId - Sandbox id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {function():AbstractHandshake} authentication - Return authentication properties
 * @property {string} resource - Client resource id
 * @property {Transports} transports - Client transports implementation
 */

/**
 * ZetaPush Client to connect
 * @access public
 * @example
 * // Securized client with token based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   authentication() {
 *     return ZetaPush.Authentication.weak({
 *       token: null
 *    })
 *   }
 * })
 * @example
 * // Client with authentication based connection
 * const client = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   authentication() {
 *     return ZetaPush.Authentication.simple({
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
 *    })
 *   }
 * })
 * @example
 * // Explicit deploymentId
 * const clientSimple = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   authentication() {
 *     return ZetaPush.Authentication.simple({
 *       deploymentId: '<YOUR-SIMPLE-AUTHENTICATION-DEPLOYMENT-ID>',
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
 *    })
 *   }
 * })
 * const clientWeak = new ZetaPush.Client({
 *   sandboxId: '<YOUR-SANDBOX-ID>',
 *   authentication() {
 *     return ZetaPush.Authentication.weak({
 *       deploymentId: '<YOUR-WEAK-AUTHENTICATION-DEPLOYMENT-ID>',
 *       token: '<SESSION-TOKEN>'
 *    })
 *   }
 * })
 */
export class Client {
  /**
   * Create a new ZetaPush Client
   * @param {ClientConfig} config
   */
  constructor({
    apiUrl = API_URL,
    sandboxId,
    forceHttps = FORCE_HTTPS,
    authentication,
    resource,
    transports,
  }) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new ClientHelper({
      apiUrl,
      sandboxId,
      forceHttps,
      authentication,
      resource,
      transports,
    });
  }
  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   * @return {number} handler
   */
  addConnectionStatusListener(listener) {
    return this.helper.addConnectionStatusListener(listener);
  }
  /**
   * Safely connect client to ZetaPush
   */
  connect() {
    if (this.isConnected()) {
      const handler = this.addConnectionStatusListener({
        onConnectionClosed: () => {
          this.removeConnectionStatusListener(handler);
          this.helper.connect();
        },
      });
      this.disconnect();
    } else {
      this.helper.connect();
    }
  }
  /**
   * Create a promise based service instance
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   * @example
   * const stack = client.createAsyncService({
   *   Type: Stack
   * })
   * stack.push({
   *   message: Hello'
   * }).then((result) => {
   *   console.log(result)
   * })
   */
  createAsyncService({ deploymentId, listener, Type }) {
    return this.helper.createAsyncService({
      deploymentId,
      listener,
      Type,
    });
  }
  /**
   * Create a promise based macro service instance
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   * @example
   * const api = client.createAsyncMacroService({
   *   Type: WelcomeMacro
   * })
   * api.welcome({
   *   message: Hello'
   * }).then(({ message }) => {
   *   console.log(message)
   * })
   */
  createAsyncMacroService({ deploymentId, listener, Type }) {
    return this.helper.createAsyncMacroService({
      deploymentId,
      listener,
      Type,
    });
  }
  /**
   * Create a promise based task service instance
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   * @example
   * const api = client.createAsyncMacroService({
   *   Type: WelcomeMacro
   * })
   * api.welcome({
   *   message: Hello'
   * }).then(({ message }) => {
   *   console.log(message)
   * })
   */
  createAsyncTaskService({ deploymentId, Type }) {
    return this.helper.createAsyncTaskService({
      deploymentId,
      Type,
    });
  }
  /**
   * Create a publish/subscribe for a service type
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   * @example
   * const service = client.createService({
   *   listener: {
   *     list(message) {
   *       console.log('Stack list callback', message)
   *     },
   *     push(message) {
   *       console.log('Stack push callback', message)
   *     }
   *   },
   *   Type: ZetaPush.services.Stack
   * })
   * service.list({
   *   stack: '<STACK-ID>'
   * })
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * const service = client.createService({
   *   deploymentId: 'stack_0'
   *   listener: {
   *     list(message) {
   *       console.log('Stack list callback', message)
   *     },
   *     push(message) {
   *       console.log('Stack push callback', message)
   *     }
   *   },
   *   Type: ZetaPush.services.Stack
   * })
   * service.list({
   *   stack: '<STACK-ID>'
   * })
   */
  createService({ deploymentId, listener, Type }) {
    return this.helper.createService({
      deploymentId,
      listener,
      Type,
    });
  }
  /**
   * Disonnect client from ZetaPush
   */
  disconnect() {
    if (this.isConnected()) {
      this.helper.disconnect();
    }
  }
  /**
   * Is client connected to ZetaPush
   * @return {boolean}
   */
  isConnected() {
    return this.helper.isConnected();
  }
  /**
   * Get the client sandbox id
   * @return {string}
   */
  getSandboxId() {
    return this.helper.getSandboxId();
  }
  /**
   * Get the client resource
   * @return {string}
   */
  getResource() {
    return this.helper.getResource();
  }
  /**
   * Get server urls list
   * @return {Promise} servers
   */
  getServers() {
    return this.helper.getServers();
  }
  /**
   * Get the client user id
   * @return {string}
   */
  getUserId() {
    return this.helper.getUserId();
  }
  /*
   * Get the client user info
   * @return {Object}
   * @example
   * // Create new ZetaPush Client
   * const client = new Client({
   *   sandboxId: '<YOUR-SANDBOX-ID>',
   *   authentication: () => Authentication.simple({
   *     login: '<YOUR-USER-LOGIN>',
   *     password: '<YOUR-USER-PASSWORD>'
   *   })
   * })
   * // Add connection establised listener
   * client.onConnectionEstablished(() => {
   *   console.log('onConnectionEstablished')
   *   const profile = client.getUserInfo()
   *   console.log('Your profile', profile)
   * })
   * client.connect()
   */
  getUserInfo() {
    return this.helper.getUserInfo();
  }
  /**
   * Remove a connection status listener
   * @param {number} handler
   */
  removeConnectionStatusListener(handler) {
    return this.helper.removeConnectionStatusListener(handler);
  }
  /**
   * Set a new authentication methods
   * @param {function():AbstractHandshake} authentication
   */
  setAuthentication(authentication) {
    this.helper.setAuthentication(authentication);
  }
  /**
   * Set logging level
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */
  setLogLevel(level) {
    this.helper.setLogLevel(level);
  }
  /**
   * Set new client resource value
   * @param {string} resource
   */
  setResource(resource) {
    this.helper.setResource(resource);
  }
  /**
   * Remove all subscriptions
   * @param {Object} service
   */
  unsubscribe(service) {
    if (!service.$subscriptions) {
      throw new TypeError('Missing $subscriptions property in service');
    }
    return this.helper.unsubscribe(service.$subscriptions);
  }
}

/**
 * Add shorthand connection status method
 */
Object.getOwnPropertyNames(ConnectionStatusListener.prototype).forEach(
  (method) => {
    // Only implements unsupported methods
    if (!Client.prototype.hasOwnProperty(method)) {
      Client.prototype[method] = function addListener(listener) {
        return this.addConnectionStatusListener({
          [method]: listener,
        });
      };
    }
  },
);
