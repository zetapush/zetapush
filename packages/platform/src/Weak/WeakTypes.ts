import { Base64EncodedBytes } from '../CommonTypes';

export interface ProvisioningRequest {
  /**Number of accounts to create*/
  n?: number;
}
export interface ProvisioningResult {
  /**List of provisioned tokens*/
  users?: UserToken[];
}
export interface UserControlRequest {
  /**Public token of the weak you want to control*/
  publicToken?: string;
  /**Whether the controlled user/device fully impersonates its controller*/
  fullRights?: boolean;
}
export interface UserControlStatus {
  /**User key of the controlling user*/
  controller?: string;
  /**Public token of the weak you want to control*/
  publicToken?: string;
  /**Whether the controlled user/device fully impersonates its controller*/
  fullRights?: boolean;
}
export interface UserToken {
  /**private token*/
  token?: string;
  /**userKey for this user*/
  userKey?: string;
  /**public token*/
  publicToken?: string;
}
