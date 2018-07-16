import { Service } from '../Core/index';
import { SmsMessage } from './Sms_ovhTypes';

/**
 * SMS via OVH
 *
 * SMS sender, to send text messages to mobile phones
 * This SMS sending service uses the OVH API
 *
 * */
export class Sms_ovh extends Service {
  /**
   * Get deployment type associated to Sms_ovh service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'sms_ovh';
  }
  /**
   * Get default deployment id associated to Sms_ovh service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sms_ovh_0';
  }
  /**
   * SMS service
   *
   * User API for SMS.
   * @access public
   * */
  send(body: SmsMessage) {
    return this.$publish('send', body);
  }
}
