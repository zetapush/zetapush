import { Service } from '../Core/index';
import {
  NotifiableDeviceRegistration,
  NotificationMessage,
  NotificationSendStatus,
} from './NotifTypes';

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
  /**
   * Registers a device
   *
   * Registers the device for the current user and resource.
   * This service maintains a mapping of __userkey/__resource to device registration IDs.
   * You MUST NOT re-use the same resource name from one device to another if you want to target specific devices with 'send'.
   * Only one registration can be active for a given __userKey/__resource pair in a notification service.
   * Device registration can be <b>neither impersonated nor called indirectly</b> (from a scheduled job).
   * @access public
   * */
  register(body: NotifiableDeviceRegistration) {
    return this.$publish('register', body);
  }
  /**
   * Sends a notification to the target
   *
   * Sends a native push notification to the target.
   * @access public
   * */
  send(body: NotificationMessage): Promise<NotificationSendStatus> {
    return this.$publish('send', body);
  }
  /**
   * Unregisters a device
   *
   * Unregisters the device for the current user and resource.
   * This verb does not need any parameters.
   * @access public
   * */
  unregister() {
    return this.$publish('unregister');
  }
}
