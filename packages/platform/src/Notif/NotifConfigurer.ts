import { Configurer } from '../Core';
import { Notif } from './Notif';
import { NotifiableApplication } from './NotifTypes';

/**Native Push Notifications for Android, iOS ...*/
export class NotifConfigurer extends Configurer {
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
  createApp(body: NotifiableApplication): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Notif.DEFAULT_DEPLOYMENT_ID,
      '/notifs/createApp'
    );
  }
}
