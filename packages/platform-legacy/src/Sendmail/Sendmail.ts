import { Service } from '../Core/index';
import { Email } from './SendmailTypes';

/**
 * Mail sender
 *
 * Sends email through SMTP
 * */
export class Sendmail extends Service {
  /**
   * Get deployment type associated to Sendmail service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'sendmail';
  }
  /**
   * Get default deployment id associated to Sendmail service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sendmail_0';
  }
  /**
   * Mail service user API
   *
   * This service is statically configured with an outgoing SMTP server.
   * Users call the API here to actually send emails.
   * @access public
   * */
  /**
   * Sends an email
   *
   * Sends an email with the given body to the intended recipients.
   * @access public
   * */
  send(body: Email) {
    this.$publish('send', body);
  }
}
