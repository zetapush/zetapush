import {
  StandardUserWorkflowConfigurer,
  RegistrationConfigurer,
  AuthenticationConfigurer,
  LostPasswordConfigurer
} from '../../common/configurer/grammar';
import { StandardUserWorkflow } from '../core/StandardUserWorkflow';
import { RegistrationConfigurerImpl } from './account/RegistrationConfigurerImpl';
import { Provider } from '@zetapush/core';
import { ConfigurationProperties, ZetaPushContext, Configurer, SimpleProviderRegistry } from '../../common/configurer';
import {
  AccountConfirmationManagerInjectable,
  AccountCreationManagerInjectable,
  AccountConfirmationManager,
  AccountCreationManager,
  AuthenticationManagerInjectable,
  AuthenticationManager
} from '../api';
import { AuthenticationConfigurerImpl } from '../configurer/account';

export class StandardUserWorkflowConfigurerImpl implements StandardUserWorkflowConfigurer, Configurer {
  private registrationConfigurer?: RegistrationConfigurerImpl;
  private authenticationConfigurer?: AuthenticationConfigurerImpl;

  constructor(private properties: ConfigurationProperties, private zetapushContext: ZetaPushContext) {}

  registration(): RegistrationConfigurer {
    this.registrationConfigurer = new RegistrationConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.registrationConfigurer;
  }

  login(): AuthenticationConfigurer {
    this.authenticationConfigurer = new AuthenticationConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.authenticationConfigurer;
  }

  lostPassword(): LostPasswordConfigurer {
    throw new Error('Not implemented');
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.registrationConfigurer, this.authenticationConfigurer);
    providerRegistry.registerFactory(
      StandardUserWorkflow,
      [AccountCreationManagerInjectable, AccountConfirmationManagerInjectable, AuthenticationManagerInjectable],
      (
        creationManager: AccountCreationManager,
        confirmationManager: AccountConfirmationManager,
        authenticationManager: AuthenticationManager
      ) => new StandardUserWorkflow(creationManager, confirmationManager, authenticationManager)
    );
    return providerRegistry.getProviders();
  }
}
