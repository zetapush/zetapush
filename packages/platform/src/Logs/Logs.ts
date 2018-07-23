import { Service } from '../Core';
import { LogRequest } from './LogsTypes';

/**
 * Logs
 *
 * json file based authentication
 * */
export class Logs extends Service {
  /**
   * Get deployment type associated to Logs service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'logs';
  }
  /**
   * Get default deployment id associated to Logs service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'logs_0';
  }
  /**
   * Log API
   *
   * User API for logging.
   * @access public
   * */
  log(body: LogRequest) {
    return this.$publish('log', body);
  }
}
