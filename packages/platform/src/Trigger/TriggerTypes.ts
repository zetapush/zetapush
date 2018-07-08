import { StringAnyMap } from '../CommonTypes';

export interface ApiTriggerId {
  /**Listener name*/
  name: string;
  /**Deployment ID of the service verb to listen to.*/
  deploymentId: string;
  /**Verb to be listened to within the target service.*/
  verb: string;
}
export interface ApiTriggerListener {
  /**Trigger info*/
  trigger: ApiTriggerId;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}
export interface EventTrigger {
  /**Event name*/
  event?: string;
  /**Event data*/
  data?: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface MassTriggers {
  /**List of trigger listeners*/
  triggers?: TriggerListener[];
  /**Whether to purge all the already stored listeners before storing the given listeners*/
  purge?: boolean;
  /**List of API trigger listeners*/
  apiTriggers?: ApiTriggerListener[];
}
export interface TriggerId {
  /**Event name*/
  event: string;
  /**Listener name*/
  name: string;
}
export interface TriggerListener {
  /**Trigger info*/
  trigger: TriggerId;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}