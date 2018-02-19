import { Service } from '../core/index.js';

/**
 * SMS via OVH
 *
 * SMS sender, to send text messages to mobile phones
 * This SMS sending service uses the OVH API
 *
 * */
/**
 * SMS service
 *
 * User API for SMS.
 * @access public
 * */
export class Sms_ovh extends Service {
  /**
   * Get default deployment id associated to Sms_ovh service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sms_ovh_0';
  }
}
