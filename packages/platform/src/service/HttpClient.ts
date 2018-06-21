import { Service } from '../core/index';

/**
 * HTTP client
 *
 * Web-service client
 *  An admin records URL templates that can be called by users
 *  Calls are not configurable by end-users
 *  However an admin may leverage the macro service to achieve URL, headers and body configurability
 * */
/**
 * User API for http requests
 *
 * @access public
 * */
export class HttpClient extends Service {
  /**
   * Get deployment type associated to Httpclient service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'httpclient';
  }
  /**
   * Get default deployment id associated to Httpclient service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${HttpClient.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Makes a predefined request
   *
   * Lookups a predefined request by name, and executes it.
   * */
  call({ name, requestId }) {
    return this.$publish('call', { name, requestId });
  }
}
