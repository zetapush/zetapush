import { PageContent, PageDirection, Pagination, StringAnyMap } from '../CommonTypes';

export interface CronPlanning {
  /**Cron planning request*/
  request?: CronTaskListRequest;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**List of all tasks matching the request*/
  tasks?: PageContent<CronTaskRequest>;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface CronTaskDeletion {
  /**cron name identifying the task to be removed*/
  cronName?: string;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface CronTaskListRequest {
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**Start timestamp for the task list. Not implemented*/
  start?: number;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Stop timestamp for the task list. Not implemented*/
  stop?: number;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Pagination information*/
  page?: Pagination;
}
export interface CronTaskRequest {
  /**Cron identifier. mandatory for creation or update.*/
  cronName: string;
  /**Cron-like expression (with fixed minutes and hours) or unix timestamp (as milliseconds from the epoch). Times are UTC.*/
  schedule: any;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**Max number of executions.*/
  stop?: number;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}
export interface TimerRequest {
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Delay in seconds before calling the given API. Must be a integer between 1 and 120.*/
  delay?: number;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}
export interface TimerResult {
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**Timer identifier*/
  id?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}