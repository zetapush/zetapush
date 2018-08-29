import { AuthenticationConfigurer } from '../../../common/configurer/grammar';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AuthenticationManagerInjectable } from '../../api/Authentication';
import { Configurer, SimpleProviderRegistry } from '../../../common/configurer';
import { Provider, ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import {
  StandardUserWorkflowConfigurer,
  LoginPasswordAuthenticationConfigurer
} from '../../../common/configurer/grammar';
import { LoginPasswordAuthenticationConfigurerImpl } from '../authentication/LoginPasswordAuthenticationConfigurer';
import { LoginPasswordAuthenticationManager } from '../../core/authentication';

export class AuthenticationConfigurerImpl extends AbstractParent<StandardUserWorkflowConfigurer>
  implements AuthenticationConfigurer, Configurer {
  private loginPasswordAuthenticationConfigurer?: LoginPasswordAuthenticationConfigurerImpl;

  constructor(
    parent: StandardUserWorkflowConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
  }

  loginPassword(): LoginPasswordAuthenticationConfigurer {
    this.loginPasswordAuthenticationConfigurer = new LoginPasswordAuthenticationConfigurerImpl(this);
    return this.loginPasswordAuthenticationConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();

    if (!this.loginPasswordAuthenticationConfigurer) {
      providerRegistry.registerClass(AuthenticationManagerInjectable, LoginPasswordAuthenticationManager);
    } else {
      await providerRegistry.registerConfigurer(this.loginPasswordAuthenticationConfigurer);
    }

    return providerRegistry.getProviders();
  }
}
