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
   * Get default deployment id associated to Sendmail service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sendmail_0';
  }
}
