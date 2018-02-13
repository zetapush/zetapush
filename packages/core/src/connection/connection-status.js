/**
 * Define life cycle connection methods
 * @access public
 */
export class ConnectionStatusListener {
  /**
   * Callback fired when connection is broken
   */
  onConnectionBroken() {}
  /**
   * Callback fired when connection is closed
   */
  onConnectionClosed() {}
  /**
   * Callback fired when connection is established
   */
  onConnectionEstablished() {}
  /**
   * Callback fired when an error occurs in connection to server step
   * @param {Object} failure
   */
  onConnectionToServerFail(failure) {}
  /**
   * Callback fired when negociation with server failed
   * @param {Object} failure
   */
  onNegotiationFailed(failure) {}
  /**
   * Callback no server url avaibale
   */
  onNoServerUrlAvailable() {}
  /**
   * Callback fired when connection will close
   */
  onConnectionWillClose() {}
  /**
   * Callback fired when an error occurs in handshake step
   * @param {Object} failure
   */
  onFailedHandshake(failure) {}
  /**
   * Callback fired when a message is lost
   */
  onMessageLost() {}
  /**
   * Callback fired when handshake step succeed
   * @param {Object} authentication
   */
  onSuccessfulHandshake(authentication) {}
}
