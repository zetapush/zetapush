import { Service } from '../Core/index';
import {
  LocalizedTemplateCreation,
  TemplateCreation,
  TemplateListRequest,
  TemplateListResult,
  TemplateRemoval,
  TemplateRequest,
  TemplateResult
} from './TemplateTypes';

/**
 * Template engine
 *
 * Template engine to produce documents from parameterized templates
 * <br>An admin creates templates
 * <br> Users produce documents
 * <br>The implementation uses the <a href='http://freemarker
 * org/'>freemarker</a> engine
 *
 * */
export class Template extends Service {
  /**
   * Get deployment type associated to Template service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'template';
  }
  /**
   * Get default deployment id associated to Template service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'template_0';
  }
  /**
   * User API for templates management
   *
   * Users use this API to configure templates.
   * @access public
   * */
  add(body: LocalizedTemplateCreation) {
    return this.$publish('add', body);
  }
  create(body: TemplateCreation) {
    return this.$publish('create', body);
  }
  delete(body: TemplateRemoval) {
    return this.$publish('delete', body);
  }
  list(body: TemplateListRequest): Promise<TemplateListResult> {
    return this.$publish('list', body);
  }
  /**
   * User API for templates
   *
   * Users use this API to evaluate pre-configured templates.
   * @access public
   * */
  evaluate(body: TemplateRequest): Promise<TemplateResult> {
    return this.$publish('evaluate', body);
  }
}
