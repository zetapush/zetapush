import { Service } from '../core/index';

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
/**
 * User API for templates
 *
 * Users use this API to evaluate pre-configured templates.
 * @access public
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
    return `${Template.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Evaluates a template
   *
   * Evaluates the given template and returns the result as a string.
   * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
   * */
  evaluate({ languageTag, name, requestId, data }) {
    return this.$publish('evaluate', { languageTag, name, requestId, data });
  }
}
