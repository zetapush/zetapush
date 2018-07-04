import { Provider } from '../Provider';
import { Template } from '../Template';
import * as zp from '../all_types';

/**Template engine to produce documents from parameterized templates.<br>An admin creates templates.<br> Users produce documents.<br>The implementation uses the <a href='http://freemarker.org/'>freemarker</a> engine.*/
export class TemplateProvider extends Provider {
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
  async add(): Promise<void> {
    return await this.provide(
      null,
      Template.DEFAULT_DEPLOYMENT_ID,
      '/template/add',
    );
  }
  /**
   * Uploads a template
   *
   * Uploads a new default template 'file' for the given 'name', replacing an existing one if it already exists.
   * This API needs Content-Type 'multipart/form-data'
   * */
  async create(): Promise<void> {
    return await this.provide(
      null,
      Template.DEFAULT_DEPLOYMENT_ID,
      '/template/create',
    );
  }
  /**
   * Lists template information
   *
   * Returns a paginated list of previously uploaded template information.
   * */
  async list(): Promise<zp.PageContent<zp.TemplateInfo>> {
    return await this.provide(
      null,
      Template.DEFAULT_DEPLOYMENT_ID,
      '/template/list',
    );
  }
}
