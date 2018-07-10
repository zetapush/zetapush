import { Service } from '../Core/index';
import { EventTrigger } from './TriggerTypes';

/**
 * Triggers
 *
 * Register callbacks for events and trigger them when needed
 *
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
    return 'trigger_0';
  }
  /**
   * Trigger service
   *
   * Register listeners and trigger events.
   * @access public
   * */
  trigger(body: EventTrigger) {
    return this.$publish('trigger', body);
  }
}
