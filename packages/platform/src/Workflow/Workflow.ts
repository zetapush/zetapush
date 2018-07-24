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
  WorkflowTransitionRequest,
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
   * Simple workflow service : workflow usage API
   *
   * Instantiate workflows.
   * Transition requests trigger the registered code for the target state.
   * @access public
   * */
  /**
   * Creates a new workflow.
   *
   * @access public
   * */
  create(body: WorkflowCreationRequest): Promise<WorkflowInfo> {
    return this.$publish('create', body);
  }
  /**
   * Forces a transition
   *
   * The state is forcefully changed to the given state
   * Theoretically forbidden transitions are authorized.
   * Otherwise, this verb behaves as 'transition'
   * @access public
   * */
  forceTransition(
    body: WorkflowTransitionRequest,
  ): Promise<WorkflowTransitionRequest> {
    return this.$publish('forceTransition', body);
  }
  /**
   * Lists this user's workflows.
   *
   * @access public
   * */
  list(body: WorkflowList): Promise<PageContent<WorkflowInfo>> {
    return this.$publish('list', body);
  }
  /**
   * Transitions this workflow to another state.
   *
   * The wanted transition must be one of the allowed transitions of the workflow.
   * If the call is a macro, it has the possibility to prevent the transition by returning {'transition':'failed', 'message':'optional error message'}.
   * The transition is synchronous if and only if it triggers a macro (use the @Workflow ZMS annotation).
   * The data passed to the macro has the type 'WorkflowTransitionInfo'
   * @access public
   * */
  transition(
    body: WorkflowTransitionRequest,
  ): Promise<WorkflowTransitionRequest> {
    return this.$publish('transition', body);
  }
  /**
   * Simple workflow service : workflow definition API
   *
   * Manage workflow templates.
   * Consider using the @Workflow annotation to ease configuration.
   * @access public
   * */
  /**
   * Creates a template
   *
   * Creates a new workflow template.
   * This new template will be available for instantiation by 'create'.
   * @access public
   * */
  createTemplate(body: WorkflowTemplateCreation): Promise<WorkflowTemplate> {
    return this.$publish('createTemplate', body);
  }
  /**
   * Fetche a template
   *
   * Returns a existing template, by identifier.
   * @access public
   * */
  getTemplate(body: WorkflowTemplateInfoRequest): Promise<WorkflowTemplate> {
    return this.$publish('getTemplate', body);
  }
  /**
   * Asks for a list of templates
   *
   * Returns a paginated list of templates.
   * @access public
   * */
  listTemplates(
    body: WorkflowTemplateList,
  ): Promise<WorkflowTemplateListResult> {
    return this.$publish('listTemplates', body);
  }
}
