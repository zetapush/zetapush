import { Service } from '../Core';
import { NotifiableDeviceRegistration, NotificationMessage, NotificationSendStatus } from './NotifTypes';

/**
 * Push Notifications
 *
 * Native Push Notifications for Android, iOS
 *
 *
 *
 * */
export class Notif extends Service {
  /**
   * Get deployment type associated to Notif service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'notif';
  }
  /**
   * Get default deployment id associated to Notif service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'notif_0';
  }
  /**
   * Notification User API
   *
   * User API for notifications.
   * For notifications to work properly, it is imperative that the resource name of a device remain constant over time.
   * @access public
   * */
  register(body: NotifiableDeviceRegistration) {
    return this.$publish('register', body);
  }
  send(body: NotificationMessage): Promise<NotificationSendStatus> {
    return this.$publish('send', body);
  }
  unregister() {
    return this.$publish('unregister');
  }
}
