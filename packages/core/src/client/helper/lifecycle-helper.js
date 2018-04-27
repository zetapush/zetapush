import { ConnectionStatusListener } from '../../connection/connection-status.js';
import { shuffle } from '../../utils/index.js';

/**
 * Provide utilities and abstraction on Life Cycle
 * @access private
 */
export class LifeCycleHelper {
  /**
   * Constructor
   * @param {Class} clientHelper : Instance of Client Helper
   */
  constructor(clientHelper) {
    this.clientHelper = clientHelper;
  }

  /**
   * Notify when the connection to the server fail
   */
  connectionToServerFail(failure) {
    this.clientHelper.connectionListeners
      .filter(({ enabled }) => enabled)
      .forEach(({ listener }) => {
        listener.onConnectionToServerFail(failure);
      });
  }

  /**
   * Handle the add of connection status listener
   * @param {*} listener
   */
  handleAddConnectionStatusListener(listener) {
    this.clientHelper.connectionListeners.push({
      enabled: true,
      listener: Object.assign(new ConnectionStatusListener(), listener),
    });

    return this.clientHelper.connectionListeners.length - 1;
  }

  /**
   * Handle connection
   */
  handleConnect() {
    this.clientHelper.getServers().then((servers) => {
      if (servers.length > 0) {
        // Get a random server url
        this.clientHelper.serverUrl = shuffle(servers);
        // Configure CometD
        this.clientHelper.cometd.configure({
          url: `${this.clientHelper.serverUrl}/strd`,
          backoffIncrement: 1000,
          maxBackoff: 60000,
          appendMessageTypeToURL: false,
        });
        // Send handshake fields
        this.clientHelper.cometd.handshake(
          this.clientHelper.getHandshakeFields(),
        );
      } else {
        // No servers available
        this.clientHelper.noServerUrlAvailable();
      }
    });
  }
}
