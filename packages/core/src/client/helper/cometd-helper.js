import { shuffle } from '../../utils/index.js';

/**
 * Delay to update server url
 * @type {integer}
 */
const UPDATE_SERVER_URL_DELAY = 250;

/**
 * Default macro channel
 * @type {string}
 */
export const DEFAULT_MACRO_CHANNEL = 'completed';

/**
 * Default task channel
 * @type {string}
 */
export const DEFAULT_TASK_CHANNEL = 'call';

/**
 * CometD Messages enumeration
 * @type {Object}
 */
const Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry',
};

/**
 * Provide utilities and abstraction on CometD Transport layer
 * @access private
 */
export class CometDHelper {
  /**
   * Constructor
   * @param {Class} clientHelper - Instance of ClientHelper
   */
  constructor(clientHelper) {
    this.clientHelper = clientHelper;
  }

  /**
   * Configure transport layer during init
   * @access private
   */
  configureTransports() {
    // Register transports layers
    this.clientHelper.transports.ALL.forEach(({ type, Transport }) => {
      this.clientHelper.cometd.registerTransport(type, new Transport());
    });

    // Handle transport exception
    this.clientHelper.cometd.onTransportException = (cometd, transport) => {
      this.clientHelper.cometd._debug('ClientHelper::onTransportException', {
        transport,
      });
      // Try to find an other available server
      // Remove the current one from the _serverList array
      this.updateServerUrl();
    };
  }

  /**
   * Remove current server url from the server list and shuffle for another one
   */
  updateServerUrl() {
    this.clientHelper.getServers().then((servers) => {
      const index = servers.indexOf(this.clientHelper.serverUrl);
      if (index > -1) {
        servers.splice(index, 1);
      }
      if (servers.length === 0) {
        // No more server available
        this.clientHelper.noServerUrlAvailable();
      } else {
        this.clientHelper.serverUrl = shuffle(servers);
        this.clientHelper.cometd.configure({
          url: `${this.clientHelper.serverUrl}/strd`,
        });
        setTimeout(() => {
          this.clientHelper.cometd.handshake(
            this.clientHelper.getHandshakeFields(),
          );
        }, UPDATE_SERVER_URL_DELAY);
      }
    });
  }

  /**
   * Notify listeners when handshake step succeed
   */
  authenticationFailed(error) {
    this.clientHelper.userId = null;
    this.clientHelper.userInfo = null;
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onFailedHandshake(error);
      });
  }

  /**
   * Negociate authentication
   * @param {error} error
   */
  negotiationFailed(error) {
    this.clientHelper.cometd._debug('ClientHelper::negotiationFailed', error);
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onNegotiationFailed(error);
      });
  }

  /**
   * Notify listeners when connection will close
   */
  connectionWillClose() {
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionWillClose();
      });
  }

  /**
   * Notify listeners when connection is established
   */
  connectionEstablished() {
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionEstablished();
      });
  }

  /**
   * Notify listeners when connection is broken
   */
  connectionBroken() {
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionBroken();
      });
  }

  /**
   * Notify listeners when connection is closed
   */
  connectionClosed() {
    this.clientHelper.userId = null;
    this.clientHelper.userInfo = null;
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionClosed();
      });
  }

  /**
   * Get queued subscription index
   * @return {Object} index
   */
  getQueuedSubscription(subscriptions = {}) {
    const index = this.clientHelper.subscribeQueue.findIndex(
      (element) => subscriptions === element.subscriptions,
    );
    return {
      index,
      queued: index > -1,
    };
  }

  /**
   * Handle CometD subscription
   * @param {*} prefix
   * @param {*} listener
   * @param {*} subscriptions
   */
  handleSubscribe(prefix, listener = {}, subscriptions = {}) {
    const { queued } = this.getQueuedSubscription(subscriptions);
    if (!queued) {
      // Store arguments to renew subscriptions on connection
      this.clientHelper.subscribeQueue.push({
        prefix,
        listener,
        subscriptions,
      });
    }
    // Subscribe if user is connected
    if (!this.clientHelper.cometd.isDisconnected()) {
      for (let method in listener) {
        if (listener.hasOwnProperty(method)) {
          if (subscriptions[method] === void 0) {
            const channel = `${prefix()}/${method}`;
            subscriptions[method] = this.clientHelper.cometd.subscribe(
              channel,
              listener[method],
            );
          }
        }
      }
    }
    return subscriptions;
  }

  /**
   * Handle CometD unsubscribe
   * @param {*} subscriptions
   */
  handleUnsubscribe(subscriptions = {}) {
    // Unsubscribe
    for (let method in subscriptions) {
      if (subscriptions.hasOwnProperty(method)) {
        const subscription = subscriptions[method];
        this.clientHelper.cometd.unsubscribe(subscription);
      }
    }
    // Remove subscription from queue
    const { index, queued } = this.getQueuedSubscription(subscriptions);
    if (queued) {
      this.clientHelper.subscribeQueue.splice(index, 1);
    }
  }

  /**
   * Configure the cometD listener for handshake
   */
  configureHandshakeListener() {
    this.clientHelper.cometd.addListener(
      '/meta/handshake',
      ({ ext, successful, advice, error }) => {
        this.clientHelper.cometd._debug('ClientHelper::/meta/handshake', {
          ext,
          successful,
          advice,
          error,
        });
        if (successful) {
          const { authentication = null } = ext;

          if (authentication) {
            this.clientHelper.userId = authentication.userId;
            this.clientHelper.userInfo = authentication.userInfo;
          }

          this.clientHelper.connectionListeners
            .filter(({ enabled }) => enabled)
            .forEach(({ listener }) => {
              listener.onSuccessfulHandshake(authentication);
            });
        } else {
          if (typeof advice === 'undefined') {
            return;
          }
          if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
            this.authenticationFailed(error);
          } else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
            this.negotiationFailed(error);
          }
        }
      },
    );
  }

  /**
   * Configure the cometD listener for the connection
   */
  configureConnectListener() {
    this.clientHelper.cometd.addListener(
      '/meta/connect',
      ({ advice, channel, successful }) => {
        this.clientHelper.cometd._debug('ClientHelper::/meta/connect', {
          advice,
          channel,
          successful,
        });
        // ConnectionListener
        if (this.clientHelper.cometd.isDisconnected()) {
          this.clientHelper.connected = false;
          // Notify connection will close
          this.connectionWillClose();
        } else {
          this.clientHelper.wasConnected = this.clientHelper.connected;
          this.clientHelper.connected = successful;
          if (!this.clientHelper.wasConnected && this.clientHelper.connected) {
            this.clientHelper.cometd.batch(this, () => {
              // Unqueue subscriptions
              this.clientHelper.subscribeQueue.forEach(
                ({ prefix, listener, subscriptions }) => {
                  this.handleSubscribe(prefix, listener, subscriptions);
                },
              );
            });
            // Notify connection is established
            this.connectionEstablished();
          } else if (
            this.clientHelper.wasConnected &&
            !this.clientHelper.connected
          ) {
            // Notify connection is broken
            this.connectionBroken();
          }
        }
      },
    );
  }

  /**
   * Configure the CometD listener for the disconnection
   */
  configureDisconnectListener() {
    this.clientHelper.cometd.addListener(
      '/meta/disconnect',
      ({ channel, successful }) => {
        this.clientHelper.cometd._debug('ClientHelper::/meta/disconnect', {
          channel,
          successful,
        });
        if (this.clientHelper.cometd.isDisconnected()) {
          this.clientHelper.connected = false;
          // Notify connection is closed
          this.connectionClosed();
        }
      },
    );
  }
}
