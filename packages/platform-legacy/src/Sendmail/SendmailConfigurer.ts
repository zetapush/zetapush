import { Configurer } from '../Core/index';
import { Sendmail } from './Sendmail';

/**Sends email through SMTP*/
export class SendmailConfigurer extends Configurer {
  /**Administrative API for mail testing*/
  /**
   * Sends a test email
   *
   * Sends a test email to the given email address.
   * */
  test(): Promise<string> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Sendmail.DEFAULT_DEPLOYMENT_ID,
      'mail/test'
    );
  }
}
