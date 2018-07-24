import { Service } from '../Core';
import { StringAnyMap } from '../CommonTypes';
import { ExistingUser } from './DelegatingTypes';

/**
 * Delegating authentication
 *
 * This authentication delegates authentication to an external auth provider
 * <br>When a zetapush client handshakes with a delegated authentication, the 'token' field given by the client is sent to the configured remote server as part of the URL
 * <br>The response must be in JSON format
 *  Each key of the response will be considered a user information field name
 * <br>The handshake from the server will return the primary key in a field named 'login' (regardless of the actual key name you might have chosen)
 * */
export class Delegating extends Service {
  /**
   * Get deployment type associated to Delegating service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'delegating';
  }
  /**
   * Get default deployment id associated to Delegating service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'delegating_0';
  }
  /**
   * End-user API for the delegating authentication
   *
   * Provisioning verbs.
   * @access public
   * */
  userInfo(body: ExistingUser): Promise<StringAnyMap> {
    return this.$publish('userInfo', body);
  }
}
