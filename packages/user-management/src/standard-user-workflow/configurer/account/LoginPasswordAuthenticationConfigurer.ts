import {
  LoginConfigurer,
  StandardUserWorkflowConfigurer,
  FieldsConfigurer,
  AccountConfigurer
} from '../../../common/configurer/grammar';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AuthenticationManagerInjectable } from '../../api/Authentication';
import { LoginPasswordAuthenticationManager } from '../../core';
import { Configurer, SimpleProviderRegistry } from '../../../common/configurer';
import { Provider } from '@zetapush/core';

export class LoginPasswordAuthenticationConfigurer extends AbstractParent<AccountConfigurer>
  implements LoginConfigurer, Configurer {
  constructor(parentConfigurer: AccountConfigurer) {
    super(parentConfigurer);
  }

  fields(): FieldsConfigurer<LoginConfigurer> {
    // TODO:
    throw new Error('Method not implemented.');
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerClass(AuthenticationManagerInjectable, LoginPasswordAuthenticationManager);
    return providerRegistry.getProviders();
  }
}
