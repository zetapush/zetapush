import { Provider } from '../Provider';
import { Sendmail } from '../Sendmail';
import * as zp from '../all_types';

/**Sends email through SMTP*/
export class SendmailProvider extends Provider {
  /**Administrative API for mail testing*/
  /**
   * Sends a test email
   *
   * Sends a test email to the given email address.
   * */
  async test(): Promise<string> {
    return await this.provide(
      null,
      Sendmail.DEFAULT_DEPLOYMENT_ID,
      '/mail/test',
    );
  }
}
