import { Service } from '../core/index';

/**
 * Mail sender
 *
 * Sends email through SMTP
 * */
/**
 * Mail service user API
 *
 * This service is statically configured with an outgoing SMTP server.
 * Users call the API here to actually send emails.
 * @access public
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
    return `${Sendmail.DEPLOYMENT_TYPE}_0`;
  }
}
