import { Service } from '../Core/index';
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
  /**
   * Makes a predefined request
   *
   * Lookups a predefined request by name, and executes it.
   * @access public
   * */
  call(body: HttpClientCall): Promise<HttpClientResponse> {
    return this.$publish('call', body);
  }
  /**
   * Makes a parameterized request
   *
   * Executes an HTTP request with the given url, method, headers and body.
   * @access public
   * */
  request(body: HttpClientRequest): Promise<HttpClientResponse> {
    return this.$publish('request', body);
  }
  /**
   * Makes a soap request
   *
   * Executes an HTTP SOAP request with the given url, method, headers and body.
   * @access public
   * */
  soap(body: HttpClientSOAPRequest): Promise<HttpClientSOAPResponse> {
    return this.$publish('soap', body);
  }
}
