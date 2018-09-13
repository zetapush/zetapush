import { Service } from '../Core/index';
import { LogRequest } from './LogsTypes';

/**
 * Logs
 *
 * Log service
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
   * This service is a façade for a system logging facility. Creating two log services has no effect.
   * @access public
   * */
  /**
   * Creates a log entry
   *
   * Adds some server generated data and stores the entry into the sink defined by configuration.
   * @access public
   * */
  log(body: LogRequest) {
    this.$publish('log', body);
  }
}
