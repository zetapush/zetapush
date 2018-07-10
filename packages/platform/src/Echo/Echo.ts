import { Service } from '../Core/index';
import { StringAnyMap } from '../CommonTypes';

/**
 * Echo
 *
 * Echo
 * */
export class Echo extends Service {
  /**
   * Get deployment type associated to Echo service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'echo';
  }
  /**
   * Get default deployment id associated to Echo service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'echo_0';
  }
  /**
   * Echo service
   *
   * Simple echo service, for development purposes.
   * @access public
   * */
  echo(body: StringAnyMap): Promise<StringAnyMap> {
    return this.$publish('echo', body);
  }
}
