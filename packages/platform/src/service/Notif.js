import { Service } from '../core/index.js';

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
   * Get default deployment id associated to Notif service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'notif_0';
  }
}
