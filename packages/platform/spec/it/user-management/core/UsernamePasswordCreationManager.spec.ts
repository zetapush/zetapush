import { createApp, nukeApp } from '../../../utils/context';
import { TimestampBasedUuidGenerator } from '../../../../src/common/core';
import { AccountCreationManagerConfigurerImpl } from '../../../../src/user-management/standard-user-workflow/configurer/AccountCreationManagerConfigurer';
import { StandardAccountStatus } from '../../../../src/user-management/standard-user-workflow/core';
import { ReflectiveInjector } from 'injection-js';
import { AccountCreationManager } from '../../../../src/user-management/standard-user-workflow/api';

describe(`AccountCreationManager`, () => {
  let application;
  let creationManager: AccountCreationManager;

  beforeEach(async () => {
    application = await createApp();
  });

  it(`configured with
      - uuid: TimestampBasedUuidGenerator
      - account status = 'WAITING_FOR_CONFIRMATION'
     and run with
      - {username: 'odile.deray', password: '123456', profile: {firstname: 'Odile',lastname: 'DERAY'}}
     should return a profile with:
      - accountId = 20 numbers
      - accountStatus = 'WAITING_FOR_CONFIRMATION'
      - userProfile = {firstname: 'Odile', lastname: 'DERAY'}`, async () => {
    // runInWorker(application, [Simple], async (Simple) => {
    //   // GIVEN
    //   // TODO: create configurer + inject services
    //   const configurer = new AccountCreationManagerConfigurerImpl(null, ReflectiveInjector.resolveAndCreate([]));
    //   configurer
    //     .uuid()
    //     /**/ .generator(TimestampBasedUuidGenerator)
    //     /**/ .and()
    //     .initialStatus()
    //     /**/ .value(StandardAccountStatus.WaitingConfirmation);
    //   creationManager = await (<AccountCreationManagerConfigurerImpl>configurer).build();
    //   debugger;
    //   // WHEN
    //   const account = await creationManager.createAccount({
    //     username: 'odile.deray',
    //     password: '123456',
    //     profile: {
    //       firstname: 'Odile',
    //       lastname: 'DERAY'
    //     }
    //   });
    //   // THEN
    //   expect(account.accountId).toBeDefined();
    //   expect(account.accountStatus).toBe(StandardAccountStatus.WaitingConfirmation);
    //   expect(account.userProfile).toEqual({
    //     firstname: 'Odile',
    //     lastname: 'DERAY'
    //   });
    // });
  });

  afterEach(async () => {
    await nukeApp(application);
  });
});
