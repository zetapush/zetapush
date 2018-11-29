import { AbstractParent } from '../../../common/configurer/AbstractParent';
import {
  StandardUserWorkflowConfigurer,
  LostPasswordConfigurer,
  Configurer,
  ResetPasswordConfigurer,
  SimpleProviderRegistry
} from '../../../common/configurer';
import { ResetPasswordConfigurerImpl } from './ResetPasswordConfigurerImpl';
import { Provider, ConfigurationProperties, ZetaPushContext } from '@zetapush/core';

export class LostPasswordConfigurerImpl extends AbstractParent<StandardUserWorkflowConfigurer>
  implements LostPasswordConfigurer, Configurer {
  private resetPasswordConfigurer?: ResetPasswordConfigurerImpl;

  constructor(
    parent: StandardUserWorkflowConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
  }

  reset(): ResetPasswordConfigurer {
    this.resetPasswordConfigurer = new ResetPasswordConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.resetPasswordConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.resetPasswordConfigurer);
    return providerRegistry.getProviders();
  }
}
