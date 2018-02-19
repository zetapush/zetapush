import { Service } from '../core/index.js';

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
   * Get default deployment id associated to Trigger service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'trigger_0';
  }
}
