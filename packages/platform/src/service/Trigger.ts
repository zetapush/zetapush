import { Service } from '../core/index';
import { ImpersonatedRequest } from '../core/types';

export interface EventTrigger extends ImpersonatedRequest {
  /** Event name */
  event: string;
  /** Event data */
  data: any;
}

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
  /**
   * Triggers an event.
   *
   * All listeners previously registered for that event will be called, in no particular order.
   * */
  trigger({ event, data, owner }: EventTrigger): Promise<void> {
    return this.$publish('trigger', { event, data, owner });
  }
}
