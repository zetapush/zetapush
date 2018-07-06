import { Service } from '../core/index';
import { PageContent, Paginable } from '../core/types';

type TemplateData = {
  [property: string]: any;
};

export interface TemplateInfo {
  /** Template name, as configured by an admin */
  name: string;
  /** List of languages for which a localization of the template exists */
  languageTags: string[];
}

export interface TemplateRequest {
  /** Locale, as defined by IETF BCP 47 */
  languageTag?: string;
  /** Template name, as configured by an admin */
  name: string;
  /** Data model */
  data: TemplateData;
}

export interface TemplateResult {
  /** Result of template evaluation */
  content: string;
}

export interface LocalizedTemplateCreation {
  /** Locale, as defined by IETF BCP 47 */
  languageTag: string;
  /** Template name, as configured by an admin */
  name: string;
  /** Template contents, as a character string */
  template: string;
}

export interface TemplateCreation {
  /** Template name */
  name: string;
  /** Template contents, as a character string */
  template: string;
}

export interface TemplateRemoval {
  /** Locale, as defined by IETF BCP 47 */
  languageTag: string;
  /** Template name, as configured by an admin */
  name: string;
}

export interface TemplateListRequest extends Paginable {}

export interface TemplateListResult {
  request: TemplateListRequest;
  result: PageContent<TemplateInfo>;
}

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
  /**
   * Creates a new localized template for the given 'name' and 'languageTag' (IETF BCP 47), replacing an existing one if it already exists. The default template for the given 'name' must exist.
   */
  add({
    languageTag,
    name,
    template,
  }: LocalizedTemplateCreation): Promise<void> {
    return this.$publish('add', { languageTag, name, template });
  }
  /**
   * Creates a new default template for the given 'name', replacing an existing one if it already exists.
   */
  create({ name, template }: TemplateCreation): Promise<void> {
    return this.$publish('create', { name, template });
  }
  /**
   * Removes an existing localized template for the given 'name' and 'languageTag'.
   * If you omit the languageTag, all localizations will be removed, including the default.
   */
  delete({ languageTag, name }: TemplateRemoval): Promise<void> {
    return this.$publish('delete', { languageTag, name });
  }
  list({ page }: TemplateListRequest): Promise<TemplateListResult> {
    return this.$publish('list', { page });
  }
}
