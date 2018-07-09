import { Service } from '../Core/index';
import {
  ProvisioningRequest,
  ProvisioningResult,
  UserControlRequest,
  UserControlStatus,
  UserToken,
} from './WeakTypes';

/**
 * Weak authentication
 *
 * The weak authentication allows for anonymous authentication of devices
 *  Such devices can display a qrcode to allow regular users to take control of them
 * */
export class Weak extends Service {
  /**
   * Get deployment type associated to Weak service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'weak';
  }
  /**
   * Get default deployment id associated to Weak service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'weak_0';
  }
  /**
   * User API for weak devices control
   *
   * User API for control and release of weakly authenticated user sessions.
   * @access public
   * */
  control(body: UserControlRequest): Promise<UserControlStatus> {
    return this.$publish('control', body);
  }
  getToken(): Promise<UserToken> {
    return this.$publish('getToken');
  }
  provision(body: ProvisioningRequest): Promise<ProvisioningResult> {
    return this.$publish('provision', body);
  }
  release(body: UserControlRequest): Promise<UserControlStatus> {
    return this.$publish('release', body);
  }
}
