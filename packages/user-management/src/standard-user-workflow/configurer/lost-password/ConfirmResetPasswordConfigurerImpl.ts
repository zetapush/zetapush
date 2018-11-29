import { AbstractParent } from '../../../common/configurer/AbstractParent';
import {
  ResetPasswordConfigurer,
  ConfirmResetPasswordConfigurer,
  Configurer,
  SuccessFailureRedirectionConfigurer,
  Scope,
  SimpleProviderRegistry
} from '../../../common/configurer';
import { Provider, ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { ConfirmResetPasswordManagerInjectable } from '../../api/LostPassword';
import { UserRepositoryInjectable, TokenManagerInjectable, UserRepository, TokenManager } from '../../../common/api';
import { Simple } from '@zetapush/platform-legacy';
import { ConfirmResetPasswordManagerImpl } from '../../core';

export class ConfirmResetPasswordConfigurerImpl extends AbstractParent<ResetPasswordConfigurer>
  implements ConfirmResetPasswordConfigurer, Configurer {
  constructor(
    parent: ResetPasswordConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerFactory(
      ConfirmResetPasswordManagerInjectable,
      [UserRepositoryInjectable, TokenManagerInjectable, Simple],
      (userRepository: UserRepository, tokenValidator: TokenManager, legacyAuth: Simple) => {
        return new ConfirmResetPasswordManagerImpl(userRepository, tokenValidator, legacyAuth);
      }
    );

    return providerRegistry.getProviders();
  }
}
