import { AbstractParent } from '../../../common/configurer/AbstractParent';
import {
  AccountStatusConfigurer,
  Configurer,
  RegistrationConfigurer,
  RegistrationFieldsConfigurer,
  UuidConfigurer
} from '../../../common/configurer/grammar';
import { UuidGeneratorConfigurer } from '../../../common/configurer/Uuid';
import { AccountCreationManager } from '../api';
import { UsernamePasswordAccountCreationManager } from '../core';
import { AccountStatusConfigurerImpl } from './AccountStatusConfigurer';
import { ReflectiveInjector, Injector } from 'injection-js';
import { Simple } from '../../../authentication';

export class AccountCreationManagerConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements RegistrationFieldsConfigurer, Configurer<AccountCreationManager> {
  private accountUuidConfigurer: UuidGeneratorConfigurer<RegistrationFieldsConfigurer>;
  private initialStatusConfigurer: AccountStatusConfigurerImpl;

  constructor(parentConfigurer: RegistrationConfigurer, private injector: Injector) {
    super(parentConfigurer);
  }

  accountUuid(): UuidConfigurer<RegistrationFieldsConfigurer> {
    this.accountUuidConfigurer = new UuidGeneratorConfigurer(this, this.injector);
    return this.accountUuidConfigurer;
  }

  initialStatus(): AccountStatusConfigurer {
    this.initialStatusConfigurer = new AccountStatusConfigurerImpl(this);
    return this.initialStatusConfigurer;
  }

  async build(): Promise<AccountCreationManager> {
    const userService = this.injector.get(Simple);
    const uuidGenerator = await this.accountUuidConfigurer.build();
    const initalStatusProvider = await this.initialStatusConfigurer.build();
    // TODO: allow developer to provide custom mapper (manually configured or auto discovered and injected ?)
    const additionalAccountDetailsProvider = null;
    return new UsernamePasswordAccountCreationManager(
      userService,
      uuidGenerator,
      initalStatusProvider,
      additionalAccountDetailsProvider
    );
  }
}
