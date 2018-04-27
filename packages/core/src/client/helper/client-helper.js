import { CometD, Transports } from '@zetapush/cometd';
import {
  getSandboxConfig,
  uuid,
  isDerivedOf,
  shuffle,
} from '../../utils/index';
import { LifeCycleHelper } from './lifecycle-helper';
import { CometDHelper } from './cometd-helper';
import {
  AsyncHelper,
  ASYNC_SERVICE,
  ASYNC_MACRO_SERVICE,
  ASYNC_TASK_SERVICE,
} from './async-events';

import {
  ProxyHelper,
  PROXY_SERVICE,
  PROXY_MACRO_SERVICE,
  PROXY_TASK_SERVICE,
} from './proxy-events';
import { Macro, Queue } from '@zetapush/platform';

/**
 * Provide utilities and abstraction on ZetaPush Client
 * @access private
 */
export class ClientHelper {
  /**
   * Create a new ZetaPush client helper
   */
  constructor({
    apiUrl,
    sandboxId,
    forceHttps = false,
    authentication,
    resource = null,
    transports = Transports,
  }) {
    /**
     * @access private
     * @type {Class}
     */
    this.lifecycleHelper = new LifeCycleHelper(this);
    /**
     * @access private
     * @type {Class}
     */
    this.cometdHelper = new CometDHelper(this);
    /**
     * @access
     * @type {Class}
     */
    this.asyncHelper = new AsyncHelper(this);
    /**
     * @access
     * @type {Class}
     */
    this.proxyHelper = new ProxyHelper(this);
    /**
     * @access private
     * @type {string}
     */
    this.sandboxId = sandboxId;
    /**
     * @access private
     * @type {function():AbstractHandshake}
     */
    this.authentication = authentication;
    /**
     * @access private
     * @type {string}
     */
    this.resource = resource;
    /**
     * @access private
     * @type {string}
     */
    this.transports = transports;
    /**
     * @access private
     * @type {number}
     */
    this.requestId = 0;
    /**
     * @access private
     * @type {string}
     */
    this.userId = null;
    /**
     * @access private
     * @type {Object}
     */
    this.userInfo = null;
    /**
     * @access private
     * @type {string}
     */
    this.uniqId = uuid();
    /**
     * @access private
     * @type {Promise}
     */
    this.config = getSandboxConfig({
      apiUrl,
      sandboxId,
      forceHttps,
      transports,
    }).catch((error) => {
      // Notify error in connection to server step
      this.lifecycleHelper.connectionToServerFail(error);
      // Return empty config
      return {
        sandboxId,
        servers: [],
      };
    });
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.connectionListeners = [];
    /**
     * @access private
     * @type {boolean}
     */
    this.connected = false;
    /**
     * @access private
     * @type {boolean}
     */
    this.wasConnected = false;
    /**
     * @access private
     * @type {string}
     */
    this.serverUrl = null;
    /**
     * @access private
     * @type {string}
     */
    this.sessionId = null;
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.subscribeQueue = [];
    /**
     * @access private
     * @type {CometD}
     */
    this.cometd = new CometD();

    // Resolve sandbox alias from server-side config
    this.config.then((config) => {
      // Resolve
      this.sandboxId = config.sandboxId;
    });

    // Configure CometD transports
    this.cometdHelper.configureTransports();

    // Configure CometD listeners
    this.cometdHelper.configureHandshakeListener();
    this.cometdHelper.configureConnectListener();
    this.cometdHelper.configureDisconnectListener();
  }

  /**
   * Get server urls list
   * @return {Promise} servers
   */
  getServers() {
    return this.config.then(({ servers }) => servers);
  }

  /**
   * Get CometD handshake parameters
   * @return {Object}
   */
  getHandshakeFields() {
    const handshake = this.authentication();
    return handshake.getHandshakeFields(this);
  }

  /**
   * Add a connection listener to handle life cycle connection events
   * @param {ConnectionStatusListener} listener
   * @return {number} handler
   */
  addConnectionStatusListener(listener) {
    return this.lifecycleHelper.handleAddConnectionStatusListener(listener);
  }

  /**
   * Connect client using CometD Transport
   */
  connect() {
    this.lifecycleHelper.handleConnect();
  }

  /**
   * Is client connected to ZetaPush
   * @return {boolean}
   */
  isConnected() {
    return !this.cometd.isDisconnected();
  }

  /**
   * Get sandbox id
   * @return {string}
   */
  getSandboxId() {
    return this.sandboxId;
  }

  /**
   * Set logging level for CometD client
   * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
   * less verbose to more verbose.
   * @param {string} level
   */
  setLogLevel(level) {
    this.cometd.setLogLevel(level);
  }

  /**
   * Set a new authentication methods
   * @param {function():AbstractHandshake} authentication
   */
  setAuthentication(authentication) {
    this.authentication = authentication;
  }

  /**
   * Remove a connection status listener
   */
  removeConnectionStatusListener(handler) {
    const listener = this.connectionListeners[handler];
    if (listener) {
      listener.enabled = false;
    }
  }

  /**
   * Notify listeners when a message is lost
   */
  messageLost(channel, data) {
    this.cometd._debug('ClientHelper::messageLost', channel, data);
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onMessageLost(channel, data);
      });
  }

  /**
   * Get user id
   * @return {string}
   */
  getUserId() {
    return this.userId;
  }
  /**
   * Get user info
   * @return {Objet}
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Get client id
   * @return {string} clientId
   */
  getClientId() {
    return this.cometd.getClientId();
  }

  /**
   * Disconnect CometD client
   */
  disconnect() {
    this.cometd.disconnect(true);
  }

  /**
   * Get resource
   * @return {string}
   */
  getResource() {
    return this.resource;
  }

  /**
   * Create a promise based service
   * @experimental
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createAsyncService({
    listener,
    Type,
    deploymentId = Type.DEFAULT_DEPLOYMENT_ID,
  }) {
    return this.asyncHelper.handleCreateAsyncService(
      listener,
      Type,
      deploymentId,
      ASYNC_SERVICE,
    );
  }

  /**
   * Create a promise based macro service
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createAsyncMacroService({
    listener,
    Type,
    deploymentId = Type.DEFAULT_DEPLOYMENT_ID,
  }) {
    return this.asyncHelper.handleCreateAsyncService(
      listener,
      Type,
      deploymentId,
      ASYNC_MACRO_SERVICE,
    );
  }

  /**
   * Create a promise based task service
   * @experimental
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createAsyncTaskService({ Type, deploymentId = Type.DEFAULT_DEPLOYMENT_ID }) {
    return this.asyncHelper.handleCreateAsyncService(
      listener,
      Type,
      deploymentId,
      ASYNC_TASK_SERVICE,
    );
  }

  /**
   * Create a generic proxified macro service
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyMacroService(deploymentId = Macro.DEFAULT_DEPLOYMENT_ID) {
    return this.proxyHelper.handleCreateProxyService(
      deploymentId,
      PROXY_MACRO_SERVICE,
    );
  }

  /**
   * Create a generic proxified service
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyService(deploymentId) {
    return this.proxyHelper.handleCreateProxyService(
      deploymentId,
      PROXY_SERVICE,
    );
  }

  /**
   * Create a generic proxified task service
   * @param {string} deploymentId
   * @return {Proxy} proxy
   * @throws {Error} Throw error if Proxy class is not defined
   */
  createProxyTaskService(deploymentId = Queue.DEFAULT_DEPLOYMENT_ID) {
    return this.proxyHelper.handleCreateProxyService(
      deploymentId,
      PROXY_TASK_SERVICE,
    );
  }

  /**
   * Create a publish/subscribe service
   * @param {{listener: Object, Type: class, deploymentId: string}} parameters
   * @return {Object} service
   */
  createService({ listener, Type, deploymentId = Type.DEFAULT_DEPLOYMENT_ID }) {
    const isMacroType = isDerivedOf(Type, Macro);
    const prefix = () => `/service/${this.getSandboxId()}/${deploymentId}`;

    const $publish = isMacroType
      ? this.getMacroPublisher(prefix)
      : this.getServicePublisher(prefix);
    // Create service by publisher
    return this.createServiceByPublisher({
      listener,
      prefix,
      Type,
      $publish,
    });
  }

  /**
   * Subsribe all methods defined in the listener for the given prefixed channel
   * @param {() => string} prefix - Channel prefix
   * @param {Object} listener
   * @param {Object} subscriptions
   * @return {Object} subscriptions
   */
  subscribe(prefix, listener = {}, subscriptions = {}) {
    return this.cometdHelper.handleSubscribe(prefix, listener, subscriptions);
  }

  /**
   * Remove all subscriptions
   * @param {Object} subscriptions
   */
  unsubscribe(subscriptions = {}) {
    return this.cometdHelper.handleUnsubscribe(subscriptions);
  }

  /**
   * Wrap CometdD publish method
   * @param {String} channel
   * @param {Object} parameters
   * @return {Object}
   */
  publish(channel, parameters = {}) {
    this.cometd.publish(channel, parameters);
    return {
      channel,
      parameters,
    };
  }

  /**
   * @param {{listener: Object, prefix: () => string, Type: class, $publish: Function}} parameters
   * @return {Object} service
   */
  createServiceByPublisher({ listener, prefix, Type, $publish }) {
    const service = new Type({
      $publish,
    });
    // Store subscription in service instance
    service.$subscriptions = this.subscribe(prefix, listener);
    return service;
  }

  /**
   * Get a publisher for a macro service
   * @param {() => string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getMacroPublisher(prefix) {
    return (name, parameters, hardFail = false, debug = 1) => {
      const channel = `${prefix()}/call`;
      const requestId = this.getUniqRequestId();
      return this.publish(channel, {
        debug,
        hardFail,
        name,
        parameters,
        requestId,
      });
    };
  }

  /**
   * Get a publisher for a service
   * @param {() => string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getServicePublisher(prefix) {
    return (method, parameters) => {
      const channel = `${prefix()}/${method}`;
      return this.publish(channel, parameters);
    };
  }

  /**
   * Notify listeners when no server url available
   */
  noServerUrlAvailable() {
    this.cometd._debug('ClientHelper::noServerUrlAvailable');
    this.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onNoServerUrlAvailable();
      });
  }

  /**
   * Get uniq request id
   * @return {string}
   */
  getUniqRequestId() {
    return `${this.getClientId()}:${this.uniqId}:${++this.requestId}`;
  }
}
