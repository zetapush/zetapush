import { Service } from '../Core/index';
import { Message } from './MessagingTypes';

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
  /**
   * Sends a message to a target
   *
   * Sends the given message to the specified target on the given (optional) channel.
   * The administratively given default channel name is used when none is provided in the message itself.
   * @access public
   * */
  send(body: Message) {
    return this.$publish('send', body);
  }
}
