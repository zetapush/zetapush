import { Provider } from '../Provider';
import { Notif } from '../Notif';
import * as zp from '../all_types';

/**Native Push Notifications for Android, iOS ...*/
export class NotifProvider extends Provider {
  /**
   * Administrative API for notifications management.
   *
   * You can create and list your applications
   * */
  /**
   * Creates an application
   *
   * The created application can then be referenced when registering a device.
   * */
  async createApp(body: zp.NotifiableApplication): Promise<void> {
    return await this.provide(
      body,
      Notif.DEFAULT_DEPLOYMENT_ID,
      '/notifs/createApp',
    );
  }
}
