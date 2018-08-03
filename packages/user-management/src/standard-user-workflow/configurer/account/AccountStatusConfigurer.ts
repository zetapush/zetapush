import { AccountStatusConfigurer, Configurer, AccountConfigurer } from '../../../common/configurer/grammar';
import { AccountStatus, AccountStatusProvider } from '../../api';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { StaticAccountStatusProvider } from '../../core';
import { MissingMandatoryConfigurationError } from '../../../common/configurer/ConfigurerError';

export class AccountStatusConfigurerImpl extends AbstractParent<AccountConfigurer>
  implements AccountStatusConfigurer, Configurer<AccountStatusProvider> {
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

  async build(): Promise<AccountStatusProvider> {
    if (this.accountStatus) {
      return new StaticAccountStatusProvider(this.accountStatus);
    }
    if (this.accountStatusProvider) {
      return this.accountStatusProvider;
    }
    throw new MissingMandatoryConfigurationError('No configuration provided for initial account status');
  }
}
