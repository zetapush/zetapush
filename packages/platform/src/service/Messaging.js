/**
 * Messaging service
 *
 * Messaging service
 * */
/**
 * Messaging service
 *
 * Simple and flexible user-to-user or user-to-group messaging service.
 * @access public
 * */
export class Messaging extends Service {
  /**
   * Get default deployment id associated to Messaging service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'messaging_0';
  }
  /**
   * Sends a message to a target
   *
   * Sends the given message to the specified target on the given (optional) channel.
   * The administratively given default channel name is used when none is provided in the message itself.
   * */
  send({ target, channel, data }) {
    return this.$publish('send', { target, channel, data });
  }
}
