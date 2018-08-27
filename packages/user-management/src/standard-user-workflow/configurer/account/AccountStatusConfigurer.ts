import { AccountStatusConfigurer, AccountConfigurer } from '../../../common/configurer/grammar';
import { AccountStatus, AccountStatusProvider, AccountStatusProviderInjectable } from '../../api';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { StaticAccountStatusProvider } from '../../core';
import { Configurer, SimpleProviderRegistry } from '../../../common/configurer';
import { Provider } from '@zetapush/core';

export class AccountStatusConfigurerImpl extends AbstractParent<AccountConfigurer>
  implements AccountStatusConfigurer, Configurer {
  private accountStatus?: AccountStatus;
  private accountStatusProvider?: AccountStatusProvider;

  constructor(parentConfigurer: AccountConfigurer) {
    super(parentConfigurer);
  }

  value(accountStatus: AccountStatus): AccountStatusConfigurer {
    this.accountStatus = accountStatus;
    return this;
  }

  provider(accountStatusProvider: AccountStatusProvider): AccountStatusConfigurer {
    this.accountStatusProvider = accountStatusProvider;
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    if (this.accountStatus) {
      providerRegistry.registerFactory(
        AccountStatusProviderInjectable,
        [],
        () => new StaticAccountStatusProvider(this.accountStatus!)
      );
    }
    if (this.accountStatusProvider) {
      providerRegistry.registerInstance(AccountStatusProviderInjectable, this.accountStatusProvider);
    }
    return providerRegistry.getProviders();
  }
}
