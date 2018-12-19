import {
  LostPasswordConfigurer,
  ResetPasswordConfigurer,
  Configurer,
  AskResetPasswordConfigurer,
  ConfirmResetPasswordConfigurer,
  SimpleProviderRegistry,
  TokenManagerConfigurer
} from '../../../common/configurer';
import { Provider, ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AskResetPasswordConfigurerImpl } from './AskResetPasswordConfigurerImpl';
import { ConfirmResetPasswordConfigurerImpl } from './ConfirmResetPasswordConfigurerImpl';
import { TokenManagerConfigurerImpl } from '../../../common/configurer/token/TokenConfigurerImpl';

export class ResetPasswordConfigurerImpl extends AbstractParent<LostPasswordConfigurer>
  implements ResetPasswordConfigurer, Configurer {
  private askResetPasswordConfigurer?: AskResetPasswordConfigurerImpl;
  private confirmResetPasswordConfigurer?: ConfirmResetPasswordConfigurerImpl;
  private tokenManagerConfigurer?: TokenManagerConfigurerImpl<ResetPasswordConfigurer>;

  constructor(
    parent: LostPasswordConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
  }

  ask(): AskResetPasswordConfigurer {
    if (!this.askResetPasswordConfigurer) {
      this.askResetPasswordConfigurer = new AskResetPasswordConfigurerImpl(this, this.properties, this.zetapushContext);
    }
    return this.askResetPasswordConfigurer;
  }

  confirm(): ConfirmResetPasswordConfigurer {
    if (!this.confirmResetPasswordConfigurer) {
      this.confirmResetPasswordConfigurer = new ConfirmResetPasswordConfigurerImpl(
        this,
        this.properties,
        this.zetapushContext
      );
    }
    return this.confirmResetPasswordConfigurer;
  }

  token(): TokenManagerConfigurer<ResetPasswordConfigurer> {
    if (!this.tokenManagerConfigurer) {
      this.tokenManagerConfigurer = new TokenManagerConfigurerImpl(this);
    }
    return this.tokenManagerConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.askResetPasswordConfigurer);
    await providerRegistry.registerConfigurer(this.confirmResetPasswordConfigurer);
    await providerRegistry.registerConfigurer(this.tokenManagerConfigurer);
    return providerRegistry.getProviders();
  }
}
