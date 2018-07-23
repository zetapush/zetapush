import { Configurer } from '../Core';
import { Template } from './Template';
import { PageContent } from '../CommonTypes';
import { TemplateInfo } from './TemplateTypes';

/**Template engine to produce documents from parameterized templates.<br>An admin creates templates.<br> Users produce documents.<br>The implementation uses the <a href='http://freemarker.org/'>freemarker</a> engine.*/
export class TemplateConfigurer extends Configurer {
  /**
   * Administrative API for template management.
   *
   * You upload a default template with 'create' and add localizations with 'add'.
   * 'list' and 'delete' let you manage your existing templates.
   * Template syntax is NOT checked. It will be lazily parsed the first time it is used.
   * */
  /**
   * Uploads a localized template
   *
   * Uploads a new localized template 'file' for the given 'name' and 'languageTag' (IETF BCP 47), replacing an existing one if it already exists. The default template for the given 'name' must exist.
   * This API needs Content-Type 'multipart/form-data'
   * */
  add(): Promise<void> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Template.DEFAULT_DEPLOYMENT_ID,
      '/template/add'
    );
  }
  /**
   * Uploads a template
   *
   * Uploads a new default template 'file' for the given 'name', replacing an existing one if it already exists.
   * This API needs Content-Type 'multipart/form-data'
   * */
  create(): Promise<void> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Template.DEFAULT_DEPLOYMENT_ID,
      '/template/create'
    );
  }
  /**
   * Lists template information
   *
   * Returns a paginated list of previously uploaded template information.
   * */
  list(): Promise<PageContent<TemplateInfo>> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Template.DEFAULT_DEPLOYMENT_ID,
      '/template/list'
    );
  }
}
