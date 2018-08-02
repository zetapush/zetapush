import { Configurer } from '../Core/index';
import { Userdir } from './Userdir';
import { UserSearchConfig } from './UserdirTypes';

/**User directory service*/
export class UserdirConfigurer extends Configurer {
  /**Administrative API for elasticsearch index management. One type ('users') is defined. You can provide mappings for it.*/
  /**
   * Configures the mappings
   *
   * Configures the global user account search index with the given mappings and settings.
   * The settings fields only supports a sub-set of ES settings : analysis
   * */
  setMapping(body: UserSearchConfig): Promise<UserSearchConfig> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Userdir.DEFAULT_DEPLOYMENT_ID,
      '/config/setMapping'
    );
  }
}
