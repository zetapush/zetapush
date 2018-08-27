import {
  RegistrationConfigurer,
  StandardUserWorkflowConfigurer,
  AccountConfigurer,
  RegistrationWelcomeConfigurer,
  RegistrationConfirmationConfigurer
} from '../../../common/configurer/grammar';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AccountCreationManagerConfigurerImpl } from './AccountCreationManagerConfigurer';
import {
  ConfigurationProperties,
  ZetaPushContext,
  Configurer,
  SimpleProviderRegistry
} from '../../../common/configurer';
import { Provider } from '@zetapush/core';
import { RegistrationConfirmationConfigurerImpl } from '../confirmation';

export class RegistrationConfigurerImpl extends AbstractParent<StandardUserWorkflowConfigurer>
  implements RegistrationConfigurer, Configurer {
  private accountConfigurer?: AccountCreationManagerConfigurerImpl;
  private confirmationConfigurer?: RegistrationConfirmationConfigurerImpl;

  constructor(
    parent: StandardUserWorkflowConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
  }

  account(): AccountConfigurer {
    this.accountConfigurer = new AccountCreationManagerConfigurerImpl(this);
    return this.accountConfigurer;
  }

  welcome(): RegistrationWelcomeConfigurer {
    throw new Error('Not implemented');
  }

  confirmation(): RegistrationConfirmationConfigurer {
    this.confirmationConfigurer = new RegistrationConfirmationConfigurerImpl(
      this,
      this.properties,
      this.zetapushContext
    );
    return this.confirmationConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.accountConfigurer);
    await providerRegistry.registerConfigurer(this.confirmationConfigurer);
    return providerRegistry.getProviders();
  }
}
