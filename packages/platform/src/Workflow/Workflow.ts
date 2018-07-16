import { Service } from '../Core/index';
import { PageContent } from '../CommonTypes';
import {
  WorkflowCreationRequest,
  WorkflowInfo,
  WorkflowList,
  WorkflowTemplate,
  WorkflowTemplateCreation,
  WorkflowTemplateInfoRequest,
  WorkflowTemplateList,
  WorkflowTemplateListResult,
  WorkflowTransitionRequest
} from './WorkflowTypes';

/**
 * Workflow
 *
 * Workflow
 * */
export class Workflow extends Service {
  /**
   * Get deployment type associated to Workflow service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'workflow';
  }
  /**
   * Get default deployment id associated to Workflow service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'workflow_0';
  }
  /**
   * Simple workflow service : workflow definition API
   *
   * Manage workflow templates.
   * Consider using the @Workflow annotation to ease configuration.
   * @access public
   * */
  createTemplate(body: WorkflowTemplateCreation): Promise<WorkflowTemplate> {
    return this.$publish('createTemplate', body);
  }
  getTemplate(body: WorkflowTemplateInfoRequest): Promise<WorkflowTemplate> {
    return this.$publish('getTemplate', body);
  }
  listTemplates(body: WorkflowTemplateList): Promise<WorkflowTemplateListResult> {
    return this.$publish('listTemplates', body);
  }
  /**
   * Simple workflow service : workflow usage API
   *
   * Instantiate workflows.
   * Transition requests trigger the registered code for the target state.
   * @access public
   * */
  create(body: WorkflowCreationRequest): Promise<WorkflowInfo> {
    return this.$publish('create', body);
  }
  forceTransition(body: WorkflowTransitionRequest): Promise<WorkflowTransitionRequest> {
    return this.$publish('forceTransition', body);
  }
  list(body: WorkflowList): Promise<PageContent<WorkflowInfo>> {
    return this.$publish('list', body);
  }
  transition(body: WorkflowTransitionRequest): Promise<WorkflowTransitionRequest> {
    return this.$publish('transition', body);
  }
}
