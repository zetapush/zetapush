import { Provider } from '../Provider';
import { Userdir } from '../Userdir';
import * as zp from '../all_types';

/**User directory service*/
export class UserdirProvider extends Provider {
  /**Administrative API for elasticsearch index management. One type ('users') is defined. You can provide mappings for it.*/
  /**
   * Configures the mappings
   *
   * Configures the global user account search index with the given mappings and settings.
   * The settings fields only supports a sub-set of ES settings : analysis
   * */
  async setMapping(body: zp.UserSearchConfig): Promise<zp.UserSearchConfig> {
    return await this.provide(
      null,
      Userdir.DEFAULT_DEPLOYMENT_ID,
      '/config/setMapping',
    );
  }
}
