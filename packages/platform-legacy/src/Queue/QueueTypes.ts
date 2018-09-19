import {
  Base64EncodedBytes,
  ConfigurableHttpOutput,
  DeployedFragmentLiveInfo,
  OwnerResource,
  StringAnyMap,
  StringDeployedFragmentLiveInfo_Map,
  StringListStringMap,
  StringStringMap,
  ZetaApiError
} from '../CommonTypes';

export interface ConfigureCall {}
export interface ConfigureTask {
  /**for server use*/
  earlyFail?: boolean;
  /**for server use*/
  done?: boolean;
  /**Use-case specific payload*/
  request?: ConfigureTaskRequest;
  /**Sandbox ID of this queue service*/
  businessId?: string;
  /**Channel name*/
  channel?: string;
  /**Server-generated task ID. Should be given back to channel 'done'*/
  taskId?: string;
  /**Some tasks (provisioning) require a particular generation of workers.*/
  generation?: string;
  /**STR Node processing the request*/
  comet?: string;
  /**Deployment ID of this queue service*/
  deploymentId?: string;
  /**Slave coordinates for this task*/
  assignee?: OwnerResource;
  /**for server use*/
  dispatched?: boolean;
}
export interface ConfigureTaskRequest {
  /**Request submitter*/
  originator?: OwnerResource;
  /**Task description*/
  description?: string;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**BusinessId of the service which the task is from*/
  originBusinessId?: string;
  /**DeploymentId of the service which the task is from*/
  originDeploymentId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Task parameters. Specific for each consumer/producer contract*/
  data?: ConfigureCall;
  /**When impersonating someone, use this field to differentiate from originator.owner*/
  owner?: string;
}
export interface DeployedItem {
  /**EMPTY DESC*/
  description?: string;
  /**EMPTY DESC*/
  enabled?: boolean;
  /**EMPTY DESC*/
  businessId: string;
  /**EMPTY DESC*/
  itemId: string;
  /**EMPTY DESC*/
  forbiddenVerbs?: string[];
  /**EMPTY DESC*/
  deploymentId?: string;
  /**EMPTY DESC*/
  options?: StringStringMap;
}
export interface HttpRequestCall {
  /**Request submitter*/
  originator?: OwnerResource;
  /**Task description*/
  description?: string;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**BusinessId of the service which the task is from*/
  originBusinessId?: string;
  /**DeploymentId of the service which the task is from*/
  originDeploymentId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Task parameters. Specific for each consumer/producer contract*/
  data?: HttpRequestInfo;
  /**When impersonating someone, use this field to differentiate from originator.owner*/
  owner?: string;
}
export interface HttpRequestInfo {
  /**IP address*/
  ip?: string;
  /**HTTP query parameters*/
  parameters?: StringListStringMap;
  /**base64 encoded body bytes*/
  body?: Base64EncodedBytes;
  /**Request Path*/
  path?: string;
  /**HTTP headers*/
  headers?: StringListStringMap;
  /**Request method*/
  method?: string;
  /**Request URL*/
  url?: string;
}
export interface HttpRequestQueueTask {
  /**for server use*/
  earlyFail?: boolean;
  /**for server use*/
  done?: boolean;
  /**Use-case specific payload*/
  request?: HttpRequestCall;
  /**Sandbox ID of this queue service*/
  businessId?: string;
  /**Channel name*/
  channel?: string;
  /**Server-generated task ID. Should be given back to channel 'done'*/
  taskId?: string;
  /**Some tasks (provisioning) require a particular generation of workers.*/
  generation?: string;
  /**STR Node processing the request*/
  comet?: string;
  /**Deployment ID of this queue service*/
  deploymentId?: string;
  /**Slave coordinates for this task*/
  assignee?: OwnerResource;
  /**for server use*/
  dispatched?: boolean;
}
export interface QueueTask {
  /**for server use*/
  earlyFail?: boolean;
  /**for server use*/
  done?: boolean;
  /**Use-case specific payload*/
  request?: TaskRequest;
  /**Sandbox ID of this queue service*/
  businessId?: string;
  /**Channel name*/
  channel?: string;
  /**Server-generated task ID. Should be given back to channel 'done'*/
  taskId?: string;
  /**Some tasks (provisioning) require a particular generation of workers.*/
  generation?: string;
  /**STR Node processing the request*/
  comet?: string;
  /**Deployment ID of this queue service*/
  deploymentId?: string;
  /**Slave coordinates for this task*/
  assignee?: OwnerResource;
  /**for server use*/
  dispatched?: boolean;
}
export interface SlaveRPCQueueTask {
  /**for server use*/
  earlyFail?: boolean;
  /**for server use*/
  done?: boolean;
  /**Use-case specific payload*/
  request?: SlaveRpcCall;
  /**Sandbox ID of this queue service*/
  businessId?: string;
  /**Channel name*/
  channel?: string;
  /**Server-generated task ID. Should be given back to channel 'done'*/
  taskId?: string;
  /**Some tasks (provisioning) require a particular generation of workers.*/
  generation?: string;
  /**STR Node processing the request*/
  comet?: string;
  /**Deployment ID of this queue service*/
  deploymentId?: string;
  /**Slave coordinates for this task*/
  assignee?: OwnerResource;
  /**for server use*/
  dispatched?: boolean;
}
export interface SlaveRpcCall {
  /**Request submitter*/
  originator?: OwnerResource;
  /**Task description*/
  description?: string;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**BusinessId of the service which the task is from*/
  originBusinessId?: string;
  /**DeploymentId of the service which the task is from*/
  originDeploymentId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Task parameters. Specific for each consumer/producer contract*/
  data?: SlaveRpcCallInfo;
  /**When impersonating someone, use this field to differentiate from originator.owner*/
  owner?: string;
}
export interface SlaveRpcCallInfo {
  /**RPC Parameters*/
  parameters?: any;
  /**RPC name (method name)*/
  name?: string;
  /**RPC namespace*/
  namespace?: string;
}
export interface TaskCompletion {
  /**Target for the response (the syntax is the same as in messaging.send). Overrides 'broadcast' when set.*/
  target?: any;
  /**Optional context ID for logs. This value MUST have been previously given by the server to this connected client.*/
  contextId?: string;
  /**Optional result of the processing. When 'success' is false, can contain an error object (with String fields 'code' and 'message'). The format of the result is predefined for some precise use cases : see 'http', 'dispatch(2)' and 'configure'*/
  result?: any;
  /**Server-assigned task identifier.*/
  taskId?: string;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId?: string;
  /**A task consumer can specify whether computation was a success or not.*/
  success?: boolean;
}
export interface TaskConsumerConfiguration {
  /**Generic bag of configuration values*/
  env?: StringAnyMap;
}
export interface TaskConsumerRegistration {
  /**Task consumer maximum capacity at a given time. The server will not exceed that capacity when dispatching new tasks. Special tasks (provisioning) are not affected by this restriction.*/
  capacity?: number;
  /**Routing information.*/
  routing?: TaskConsumerRouting;
}
export interface TaskConsumerRouting {
  /**The newly registered consumer demands that all traffic be routed to it.*/
  exclusive?: boolean;
}
export interface TaskProgress {
  /**Optional context ID for logs. This value MUST have been previously given by the server to this connected client.*/
  contextId?: string;
  /**Server-assigned task identifier.*/
  taskId?: string;
  /**Progress information. Use-case specific.*/
  progress?: any;
}
export interface TaskRequest {
  /**Request submitter*/
  originator?: OwnerResource;
  /**Task description*/
  description?: string;
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**BusinessId of the service which the task is from*/
  originBusinessId?: string;
  /**DeploymentId of the service which the task is from*/
  originDeploymentId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Task parameters. Specific for each consumer/producer contract*/
  data?: any;
  /**When impersonating someone, use this field to differentiate from originator.owner*/
  owner?: string;
}
export interface WorkerAdminBulkRequest {
  /**List of admin requests*/
  requests?: WorkerAdminRequest[];
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
}
export interface WorkerAdminBulkResponse {
  /**List of responses, in the same order as in the request*/
  responses?: any[];
  /**This field might contain a (fatal) error.*/
  error?: ZetaApiError;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId?: string;
}
export interface WorkerAdminBulkServiceCreation {
  /**Context ID. Clients and developers must not pass this explicitly. This value is generated by the server and can be passed back by the worker SDKs.*/
  contextId?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**List of services to be created*/
  services?: DeployedItem[];
}
export interface WorkerAdminRequest {
  /**Parameter (request body)*/
  parameters?: any;
  /**Deployment ID of the target service*/
  deploymentId?: string;
  /**Verb name inside the service*/
  verb?: string;
}
export interface WorkerStartupContext {
  /**Workers, indexed by worker name*/
  workers?: StringDeployedFragmentLiveInfo_Map;
  /**Fronts, indexed by front name*/
  fronts?: StringDeployedFragmentLiveInfo_Map;
}
