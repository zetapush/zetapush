import { Message } from './MessagingTypes';
import { Service } from '../Core';

/**
 * Messaging service
 *
 * Messaging service
 * */
export class Messaging extends Service {
  /**
   * Get deployment type associated to Messaging service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'messaging';
  }
  /**
   * Get default deployment id associated to Messaging service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'messaging_0';
  }
  /**
   * Messaging service
   *
   * Simple and flexible user-to-user or user-to-group messaging service.
   * @access public
   * */
  send(body: Message) {
    return this.$publish('send', body);
  }
}
