import {
  StandardUserWorkflowConfigurer,
  RegistrationConfigurer,
  LoginConfigurer,
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
  AccountCreationManager
} from '../api';

export class StandardUserWorkflowConfigurerImpl implements StandardUserWorkflowConfigurer, Configurer {
  private registrationConfigurer?: RegistrationConfigurerImpl;

  constructor(private properties: ConfigurationProperties, private zetapushContext: ZetaPushContext) {}

  registration(): RegistrationConfigurer {
    this.registrationConfigurer = new RegistrationConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.registrationConfigurer;
  }

  login(): LoginConfigurer {
    throw new Error('Not implemented');
  }

  lostPassword(): LostPasswordConfigurer {
    throw new Error('Not implemented');
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.registrationConfigurer);
    providerRegistry.registerFactory(
      StandardUserWorkflow,
      [AccountCreationManagerInjectable, AccountConfirmationManagerInjectable],
      (creationManager: AccountCreationManager, confirmationManager: AccountConfirmationManager) =>
        new StandardUserWorkflow(creationManager, confirmationManager)
    );
    return providerRegistry.getProviders();
  }
}
