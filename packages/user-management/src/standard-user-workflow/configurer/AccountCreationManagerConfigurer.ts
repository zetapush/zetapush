import { Injector } from '@zetapush/core';
import { Simple } from '@zetapush/platform-legacy';

import { AbstractParent } from '../../common/configurer/AbstractParent';
import {
  AccountStatusConfigurer,
  Configurer,
  RegistrationConfigurer,
  RegistrationFieldsConfigurer,
  UuidConfigurer,
  AccountConfigurer
} from '../../common/configurer/grammar';
import { UuidGeneratorConfigurerImpl } from '../../common/configurer/Uuid';
import { AccountCreationManager } from '../api';
import { UsernamePasswordAccountCreationManager } from '../core';
import { AccountStatusConfigurerImpl } from './AccountStatusConfigurer';

import { IllegalStateError } from '../../common/api/exception/IllegalStateError';
import { Simple } from '@zetapush/platform';

export class AccountCreationManagerConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements AccountConfigurer, Configurer<AccountCreationManager> {
  private accountUuidConfigurer?: UuidGeneratorConfigurerImpl<AccountConfigurer>;
  private initialStatusConfigurer?: AccountStatusConfigurerImpl;

  constructor(parentConfigurer: RegistrationConfigurer, private injector: Injector) {
    super(parentConfigurer);
  }

  uuid(): UuidConfigurer<AccountConfigurer> {
    this.accountUuidConfigurer = new UuidGeneratorConfigurerImpl(this, this.injector);
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

  async build(): Promise<AccountCreationManager> {
    if (!this.accountUuidConfigurer) {
      throw new IllegalStateError('No uuid generator configured for account creation management');
    }
    if (!this.initialStatusConfigurer) {
      throw new IllegalStateError('No initial status configured for account creation management');
    }
    const userService = this.injector.get(Simple);
    const uuidGenerator = await this.accountUuidConfigurer.build();
    const initalStatusProvider = await this.initialStatusConfigurer.build();
    // TODO: allow developer to provide custom mapper (manually configured or auto discovered and injected ?)
    const additionalAccountDetailsProvider = undefined;
    return new UsernamePasswordAccountCreationManager(
      userService,
      uuidGenerator,
      initalStatusProvider,
      additionalAccountDetailsProvider
    );
  }
}
