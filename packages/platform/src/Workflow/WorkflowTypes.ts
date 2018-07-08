import {
  PageContent,
  PageDirection,
  Pagination,
  StringAnyMap,
} from '../CommonTypes';

export interface FullWorkflowStateDefinition {
  /**Called on the workflow when this state is about to be reached. If the call is a macro, it has the possibility to prevent the transition by returning {'transition':'failed', 'message':'optional error message'}.*/
  call?: ServiceVerbCall;
  /**ID of the state*/
  stateId: string;
  /**State name*/
  stateName?: string;
}
export interface ServiceVerbCall {
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}
export interface WorkflowCreationRequest {
  /**Template on which this workflow is based.*/
  templateName: string;
  /**User data. Put your domain-specific data here. It can be a complex object or a simple reference to something that you store somewhere else.*/
  userData?: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface WorkflowInfo {
  /**Workflow ID, as returned by 'create'*/
  workflow: string;
  /**Current state of this workflow.*/
  state?: string;
  /**User data for this workflow.*/
  userData?: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Creation timestamp of this workflow.*/
  creation?: number;
  /**First state of this workflow.*/
  firstState?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Template on which this workflow is based.*/
  template?: WorkflowTemplate;
}
export interface WorkflowList {
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Pagination information*/
  page?: Pagination;
}
export interface WorkflowStateDefinition {
  /**ID of the state*/
  stateId: string;
  /**State name*/
  stateName?: string;
}
export interface WorkflowTemplate {
  /**All the possible states of this workflow*/
  states: WorkflowStateDefinition[];
  /**Unique template name*/
  templateName: string;
  /**All the transitions of this workflow*/
  transitions?: WorkflowTransitionDefinition[];
}
export interface WorkflowTemplateCreation {
  /**All the possible states of this workflow*/
  states: FullWorkflowStateDefinition[];
  /**Unique template name*/
  templateName: string;
  /**All the transitions of this workflow*/
  transitions?: WorkflowTransitionDefinition[];
}
export interface WorkflowTemplateInfoRequest {
  /**Template name, as created with 'createTemplate'*/
  templateName?: string;
}
export interface WorkflowTemplateList {
  /**Pagination information*/
  page?: Pagination;
}
export interface WorkflowTemplateListResult {
  /**Request leading to the result*/
  request?: WorkflowTemplateList;
  /**Result for the specified request*/
  result?: PageContent<WorkflowTemplate>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId?: string;
}
export interface WorkflowTemplatePurge {}
export interface WorkflowTransitionDefinition {
  /**Starting state*/
  from: string;
  /**Destination state*/
  to: string;
}
export interface WorkflowTransitionRequest {
  /**Workflow ID, as returned by 'create'*/
  workflow: string;
  /**Destination state*/
  to: string;
  /**User data. When not null, used to update the user-data field of the workflow instance*/
  userData?: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}