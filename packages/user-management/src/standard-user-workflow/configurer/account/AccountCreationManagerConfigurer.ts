import { Provider } from '@zetapush/core';

import {
  AccountStatusConfigurer,
  RegistrationConfigurer,
  RegistrationFieldsConfigurer,
  UuidConfigurer,
  AccountConfigurer
} from '../../../common/configurer/grammar';
import { UuidGeneratorConfigurerImpl } from '../../../common/configurer/fields/UuidConfigurer';
import { AccountStatusProvider, AccountStatusProviderInjectable, AccountCreationManagerInjectable } from '../../api';
import { AccountStatusConfigurerImpl } from './AccountStatusConfigurer';
import { LoginPasswordAccountCreationManager } from '../../core';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { UuidGenerator, UuidGeneratorInjectable, IllegalArgumentValueError } from '../../../common/api';
import { UserRepository, UserRepositoryInjectable } from '../../../common/api/User';
import { Configurer, SimpleProviderRegistry } from '../../../common/configurer';
import { Type } from '@zetapush/core';
import { InstanceHelper } from '../../../common/configurer/InstanceHelper';

export class AccountCreationManagerConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements AccountConfigurer, Configurer {
  private accountUuidConfigurer?: UuidGeneratorConfigurerImpl<AccountConfigurer>;
  private initialStatusConfigurer?: AccountStatusConfigurerImpl;
  private userStorageHelper: InstanceHelper<UserRepository, any>;

  constructor(parentConfigurer: RegistrationConfigurer) {
    super(parentConfigurer);
    this.userStorageHelper = new InstanceHelper(
      UserRepositoryInjectable,
      null,
      (userStorageInstanceOrClass) =>
        new IllegalArgumentValueError(
          `Can't use provided storage as a UserRepository`,
          'userStorageInstanceOrClass',
          userStorageInstanceOrClass
        )
    );
  }

  uuid(): UuidConfigurer<AccountConfigurer> {
    this.accountUuidConfigurer = new UuidGeneratorConfigurerImpl(this);
    return this.accountUuidConfigurer;
  }

  initialStatus(): AccountStatusConfigurer {
    this.initialStatusConfigurer = new AccountStatusConfigurerImpl(this);
    return this.initialStatusConfigurer;
  }

  fields(): RegistrationFieldsConfigurer {
    // TODO
    throw new Error('Method not implemented.');
  }

  storage(userStorageClass: Type<UserRepository>): AccountConfigurer;
  storage(userStorageInstance: UserRepository): AccountConfigurer;
  storage(userStorageInstanceOrClass: any): AccountConfigurer {
    this.userStorageHelper.register(userStorageInstanceOrClass);
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.accountUuidConfigurer);
    await providerRegistry.registerConfigurer(this.initialStatusConfigurer);
    providerRegistry.registerProvider(this.userStorageHelper.getProvider());
    providerRegistry.registerFactory(
      AccountCreationManagerInjectable,
      [UserRepositoryInjectable, UuidGeneratorInjectable, AccountStatusProviderInjectable],
      (userRepository: UserRepository, uuidGenerator: UuidGenerator, initialStatusProvider: AccountStatusProvider) => {
        // TODO: allow developer to provide custom mapper (manually configured or auto discovered and injected ?)
        const additionalAccountDetailsProvider = undefined;
        return new LoginPasswordAccountCreationManager(
          userRepository,
          uuidGenerator,
          initialStatusProvider,
          additionalAccountDetailsProvider
        );
      }
    );
    return providerRegistry.getProviders();
  }
}
