import { Service } from '../core/index.js';

/**
 * Weak authentication
 *
 * The weak authentication allows for anonymous authentication of devices
 *  Such devices can display a qrcode to allow regular users to take control of them
 * */
/**
 * User API for weak devices control
 *
 * User API for control and release of weakly authenticated user sessions.
 * @access public
 * */
export class Weak extends Service {
  /**
   * Get deployment type associated to Weak service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'weak';
  }
  /**
   * Get default deployment id associated to Weak service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Weak.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Controls a session
   *
   * Takes control of a weak user session, identified by the given public token.
   * The public token has been previously made available by the controlled device, for example by displaying a QRCode.
   * Upon control notification, the client SDK of the controlled session is expected to re-handshake.
   * */
  control({ publicToken, fullRights }) {
    return this.$publish('control', { publicToken, fullRights });
  }
  /**
   * Returns the current token
   *
   * Returns your current session's private token. The token field may be null, if you did not log in with this authentication.
   * The token can be used to log in as the same weak user another time.
   * */
  getToken() {
    return this.$publish('getToken', {});
  }
  /**
   * Provisions an arbitrary number of accounts.
   * The maximum number of accounts that you can create in one single call is configured per server.
   * */
  provision({ n }) {
    return this.$publish('provision', { n });
  }
  /**
   * Releases a session
   *
   * Releases control of a weak user session, identified by the given public token.
   * The weak user session must have been previously controlled by a call to 'control'.
   * */
  release({ publicToken, fullRights }) {
    return this.$publish('release', { publicToken, fullRights });
  }
}
