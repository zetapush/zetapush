import { Service } from '../Core/index';
import { UserInfoRequest, UserInfoResponse, UserSearchRequest, UserSearchResponse } from './UserdirTypes';

/**
 * User directory service
 *
 * User directory service
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
    return 'userdir_0';
  }
  /**
   * User API for user information
   *
   * @access public
   * */
  /**
   * Searches for users matching the request
   *
   * @access public
   * */
  search(body: UserSearchRequest): Promise<UserSearchResponse> {
    return this.$publish('search', body);
  }
  /**
   * Requests public data for the specified users
   *
   * @access public
   * */
  userInfo(body: UserInfoRequest): Promise<UserInfoResponse> {
    return this.$publish('userInfo', body);
  }
}
