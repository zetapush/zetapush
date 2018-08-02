import { Configurer } from '../Core/index';
import { Workflow } from './Workflow';
import { WorkflowTemplateCreation, WorkflowTemplatePurge } from './WorkflowTypes';

/**Workflow*/
export class WorkflowConfigurer extends Configurer {
  /**
   * Administrative API for workflow management.
   *
   * You can define workflow templates
   * */
  /**
   * Creates a template
   *
   * Creates a new workflow template.
   * This new template will be available for instantiation by 'create'.
   * */
  createTemplate(body: WorkflowTemplateCreation): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Workflow.DEFAULT_DEPLOYMENT_ID,
      '/workflow/createTemplate'
    );
  }
  /**
   * Purges all templates
   *
   * Purges all existing templates
   * */
  purgeTemplates(body: WorkflowTemplatePurge): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Workflow.DEFAULT_DEPLOYMENT_ID,
      '/workflow/purgeTemplates'
    );
  }
}
