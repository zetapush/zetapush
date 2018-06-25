import { Service } from '../core/index';

/**
 * User directory service
 *
 * User directory service
 * */
/**
 * User API for user information
 *
 * @access public
 * */
export class Userdir extends Service {
  /**
   * Get deployment type associated to Userdir service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'userdir';
  }
  /**
   * Get default deployment id associated to Userdir service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${Userdir.DEPLOYMENT_TYPE}_0`;
  }
  /**Searches for users matching the request*/
  search({ requestId, query, page }) {
    return this.$publish('search', { requestId, query, page });
  }
  /**Requests public data for the specified users*/
  userInfo({ userKeys }) {
    return this.$publish('userInfo', { userKeys });
  }
}