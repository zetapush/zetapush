import { Service } from '../Core';
import {
  HttpClientCall,
  HttpClientRequest,
  HttpClientResponse,
  HttpClientSOAPRequest,
  HttpClientSOAPResponse
} from './HttpclientTypes';

/**
 * HTTP client
 *
 * Web-service client
 *  An admin records URL templates that can be called by users
 *  Calls are not configurable by end-users
 *  However an admin may leverage the macro service to achieve URL, headers and body configurability
 * */
export class Httpclient extends Service {
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
    return 'httpclient_0';
  }
  /**
   * User API for http requests
   *
   * @access public
   * */
  call(body: HttpClientCall): Promise<HttpClientResponse> {
    return this.$publish('call', body);
  }
  request(body: HttpClientRequest): Promise<HttpClientResponse> {
    return this.$publish('request', body);
  }
  soap(body: HttpClientSOAPRequest): Promise<HttpClientSOAPResponse> {
    return this.$publish('soap', body);
  }
}
