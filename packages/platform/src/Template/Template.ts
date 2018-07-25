import { Service } from '../Core/index';
import {
  LocalizedTemplateCreation,
  TemplateCreation,
  TemplateListRequest,
  TemplateListResult,
  TemplateRemoval,
  TemplateRequest,
  TemplateResult,
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
   * User API for templates
   *
   * Users use this API to evaluate pre-configured templates.
   * @access public
   * */
  /**
   * Evaluates a template
   *
   * Evaluates the given template and returns the result as a string.
   * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
   * @access public
   * */
  evaluate(body: TemplateRequest): Promise<TemplateResult> {
    return this.$publish('evaluate', body);
  }
  /**
   * User API for templates management
   *
   * Users use this API to configure templates.
   * @access public
   * */
  /**
   * Creates a localized template
   *
   * Creates a new localized template for the given 'name' and 'languageTag' (IETF BCP 47), replacing an existing one if it already exists. The default template for the given 'name' must exist.
   * @access public
   * */
  add(body: LocalizedTemplateCreation) {
    return this.$publish('add', body);
  }
  /**
   * Creates a template
   *
   * Creates a new default template for the given 'name', replacing an existing one if it already exists.
   * @access public
   * */
  create(body: TemplateCreation) {
    return this.$publish('create', body);
  }
  /**
   * Removes a template
   *
   * Removes an existing localized template for the given 'name' and 'languageTag'.
   * If you omit the languageTag, all localizations will be removed, including the default.
   * @access public
   * */
  delete(body: TemplateRemoval) {
    return this.$publish('delete', body);
  }
  /**
   * Lists template information
   *
   * Returns a paginated list of previously uploaded template information.
   * @access public
   * */
  list(body: TemplateListRequest): Promise<TemplateListResult> {
    return this.$publish('list', body);
  }
}
