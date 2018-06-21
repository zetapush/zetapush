import { Service } from '../core/index';

/**
 * Push Notifications
 *
 * Native Push Notifications for Android, iOS
 *
 *
 *
 * */
/**
 * Notification User API
 *
 * User API for notifications.
 * For notifications to work properly, it is imperative that the resource name of a device remain constant over time.
 * @access public
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
    return `${Notif.DEPLOYMENT_TYPE}_0`;
  }
}
