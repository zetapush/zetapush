/**
 * Useful methods for ClientHelper
 * @access private
 */
export class UtilsHelper {
  constructor(clientHelper) {
    this.clientHelper = clientHelper;
  }

  /**
   * Notify listeners when no server url available
   */
  noServerUrlAvailable() {
    this.clientHelper.cometd._debug('ClientHelper::noServerUrlAvailable');
    this.clientHelper.connectionListeners
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
    return `${this.clientHelper.getClientId()}:${
      this.clientHelper.uniqId
    }:${++this.clientHelper.requestId}`;
  }
}
