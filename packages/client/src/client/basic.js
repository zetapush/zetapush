import { ClientHelper } from './helper.js';
import { API_URL, FORCE_HTTPS } from '../utils/http.js';
import { ConnectionStatusListener } from '../connection/connection-status.js';

/**
 * Client config object.
 * @typedef {Object} ClientConfig
 * @property {string} platformUrl - Platform Url
 * @property {string} appName - Application name
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
 * const client = new ZetaPushClient.Client({
 *   appName: '<YOUR-APP-NAME>',
 *   authentication() {
 *     return ZetaPushClient.Authentication.weak({
 *       token: null
 *    })
 *   }
 * })
 * @example
 * // Client with authentication based connection
 * const client = new ZetaPushClient.Client({
 *   appName: '<YOUR-APP-NAME>',
 *   authentication() {
 *     return ZetaPushClient.Authentication.simple({
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
 *    })
 *   }
 * })
 * @example
 * // Explicit deploymentId
 * const clientSimple = new ZetaPushClient.Client({
 *   appName: '<YOUR-APP-NAME>',
 *   authentication() {
 *     return ZetaPushClient.Authentication.simple({
 *       deploymentId: '<YOUR-SIMPLE-AUTHENTICATION-DEPLOYMENT-ID>',
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>'
 *    })
 *   }
 * })
 * const clientWeak = new ZetaPushClient.Client({
 *   appName: '<YOUR-APP-NAME>',
 *   authentication() {
 *     return ZetaPushClient.Authentication.weak({
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
  constructor({ platformUrl = API_URL, appName, forceHttps = FORCE_HTTPS, authentication, resource, transports } = {}) {
    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new ClientHelper({
      platformUrl,
      appName,
      forceHttps,
      authentication,
      resource,
      transports
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
   * @return {Promise}
   */
  connect() {
    return new Promise((resolve, reject) => {
      let handler = null;
      this.disconnect().then(() => {
        const onSucess = () => {
          // Remove connection status listener
          this.removeConnectionStatusListener(handler);
          // Resolve connection success
          resolve();
        };
        const onError = (error) => {
          // Remove connection status listener
          this.removeConnectionStatusListener(handler);
          // Reject connection
          reject({
            code: 'CONNECTION_FAILED',
            message: 'Unable to connect to platform',
            cause: error
          });
        };
        // Register connection status listener
        handler = this.addConnectionStatusListener({
          onConnectionBroken: onError,
          onConnectionClosed: onError,
          onConnectionEstablished: onSucess,
          onConnectionToServerFail: onError,
          onConnectionWillClose: onError,
          onFailedHandshake: onError,
          onNegotiationFailed: () => onError(new Error('Negotiation Failed')),
          onNoServerUrlAvailable: () => onError(new Error('No Server Url Available'))
        });
        // Connect client to ZetaPush backend
        this.helper.connect();
      });
    });
  }
  /**
   * Create a promise based service instance
   * @param {{deploymentId: string, listener: Object, Type: class}} parameters
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
      Type
    });
  }
  /**
   * Create a promise based macro service instance
   * @param {{deploymentId: string, listener: Object, Type: class}} parameters
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
      Type
    });
  }
  /**
   * Create a promise based task service instance
   * @param {{deploymentId: string, Type: class}} parameters
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
      Type
    });
  }
  /**
   * Create a generic proxified macro service
   * Each property of the proxified service wrap a publish/subscribe
   * Publish parameters on channel --> /service/${appName}/${deploymentId}/call
   * Subscribe success on channel --> /service/${appName}/${deploymentId}/${method}
   * Subscribe error on channel --> /service/${appName}/${deploymentId}/error
   * If remote method publish response on a specific channel, generic proxy will not raise success
   * @example
   * const service = client.createProxyMacroService();
   * service.myMethod({ key: 'value' }).then((response) => console.log('myMethod', response))
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyMacroService(deploymentId) {
    return this.helper.createProxyMacroService(deploymentId);
  }
  /**
   * Create a generic proxified task service
   * Each property of the proxified service wrap a publish/subscribe
   * Publish parameters on channel --> /service/${appName}/${deploymentId}/call
   * Subscribe success on channel --> /service/${appName}/${deploymentId}/${method}
   * Subscribe error on channel --> /service/${appName}/${deploymentId}/error
   * If remote method publish response on a specific channel, generic proxy will not raise success
   * @example
   * const service = client.createProxyTaskService();
   * service.myMethod({ key: 'value' }).then((response) => console.log('myMethod', response))
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyTaskService(deploymentId) {
    return this.helper.createProxyTaskService(deploymentId);
  }
  /**
   * Create a generic proxified service
   * Each property of the proxified service wrap a publish/subscribe
   * Publish parameters on channel --> /service/${appName}/${deploymentId}/${method}
   * Subscribe success on channel --> /service/${appName}/${deploymentId}/${method}
   * Subscribe error on channel --> /service/${appName}/${deploymentId}/error
   * If remote method publish response on a specific channel, generic proxy will not raise success
   * @example
   * const service = client.createProxyService('');
   * service.myMethod({ key: 'value' }).then((response) => console.log('myMethod', response))
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyService(deploymentId) {
    return this.helper.createProxyService(deploymentId);
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
   *   Type: ZetaPushClient.services.Stack
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
   *   Type: ZetaPushClient.services.Stack
   * })
   * service.list({
   *   stack: '<STACK-ID>'
   * })
   */
  createService({ deploymentId, listener, Type }) {
    return this.helper.createService({
      deploymentId,
      listener,
      Type
    });
  }
  /**
   * Disconnect client from ZetaPush
   * @return {Promise}
   */
  disconnect() {
    return new Promise((resolve, reject) => {
      const handlers = [];
      if (this.isConnected()) {
        const onConnectionClosed = () => {
          // Remove connection status listener
          handlers.forEach((handler) => {
            this.removeConnectionStatusListener(handler);
          });
          // Resolve disconnection
          resolve();
        };
        handlers.push(this.onConnectionClosed(onConnectionClosed));
        // Disconnect client
        this.helper.disconnect();
      } else {
        // Resolve disconnection
        resolve();
      }
    });
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
  getAppName() {
    return this.helper.getAppName();
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
   *   appName: '<YOUR-APP-NAME>',
   *   authentication: () => Authentication.simple({
   *     login: '<YOUR-USER-LOGIN>',
   *     password: '<YOUR-USER-PASSWORD>'
   *   })
   * })
   * client.connect().then(() => {
   *   console.log('connected')
   *   const profile = client.getUserInfo()
   *   console.log('Your profile', profile)
   * })
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
Object.getOwnPropertyNames(ConnectionStatusListener.prototype).forEach((method) => {
  // Only implements unsupported methods
  if (!Client.prototype.hasOwnProperty(method)) {
    Client.prototype[method] = function addListener(listener) {
      return this.addConnectionStatusListener({
        [method]: listener
      });
    };
  }
});
