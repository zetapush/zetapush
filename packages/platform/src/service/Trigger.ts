import { Service } from '../core/index';

/**
 * Triggers
 *
 * Register callbacks for events and trigger them when needed
 *
 * */
/**
 * Trigger service
 *
 * Register listeners and trigger events.
 * @access public
 * */
export class Trigger extends Service {
  /**
   * Get deployment type associated to Trigger service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'trigger';
  }
  /**
   * Get default deployment id associated to Trigger service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Trigger.DEPLOYMENT_TYPE}_0`;
  }
}
