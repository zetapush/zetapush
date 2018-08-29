import { Simple } from '@zetapush/platform-legacy';
import { Client, SmartClient } from '@zetapush/client';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AuthenticationConfigurer, LoginPasswordAuthenticationConfigurer } from '../../../common/configurer/grammar';
import { Configurer, SimpleProviderRegistry } from '../../../common/configurer';
import { Provider } from '@zetapush/core';
import { LoginPasswordAuthenticationManager } from '../../core/authentication/LoginPasswordAuthenticationManager';
import { AuthenticationManagerInjectable } from '../../api/Authentication';

export class LoginPasswordAuthenticationConfigurerImpl extends AbstractParent<AuthenticationConfigurer>
  implements Configurer, LoginPasswordAuthenticationConfigurer {
  constructor(parent: AuthenticationConfigurer) {
    super(parent);
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();

    providerRegistry.registerClass(AuthenticationManagerInjectable, LoginPasswordAuthenticationManager);
    return providerRegistry.getProviders();
  }
}
