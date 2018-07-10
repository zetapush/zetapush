import { Idempotence, PageContent, StringAnyMap } from '../CommonTypes';

export interface AllCredentials {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**List of account information for the asking user. empty if the user does not have credentials in the service. One item in this list is a map of account fields.*/
  credentials?: StringAnyMap[];
}
export interface BasicAuthenticatedUser {
  /**You can pass any number of arbitrary properties in the enclosing object (there is no field actually named additionalProperties). */
  additionalProperties?: StringAnyMap;
}
export interface BasicUserCreation {
  /**You can pass any number of arbitrary properties in the enclosing object (there is no field actually named additionalProperties).*/
  additionalProperties?: StringAnyMap;
  /**Specify the behavior when the user already exists. The default value is IGNORE_IDENTICAL*/
  idempotence?: Idempotence;
}
export interface ChangePasswordRequest {
  /**Server-provided temporary token to reset a password*/
  token?: string;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key?: string;
  /**New password*/
  password: string;
}
export interface CheckPasswordRequest {
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key?: string;
  /**Password to be checked*/
  password: string;
}
export interface CheckPasswordResult {
  /**Whether the password matches*/
  matches?: boolean;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key?: string;
}
export interface ExistenceCheck {
  /**User key within the realm*/
  key: string;
  /**Whether to fail is the user does not exist. When true, fails silently.*/
  softFail?: boolean;
}
export interface ImpersonatedTraceableRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface ResetInfo {
  /**Server-provided temporary token to reset a password*/
  token?: string;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key?: string;
}
export interface ResetRequest {
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key?: string;
}
export interface UserLoginchange {
  /**New account key within this realm. Must not be already in use.*/
  newKey: string;
  /**Existing account key within this realm (login). Will be free for use upon successful completion.*/
  oldKey: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
