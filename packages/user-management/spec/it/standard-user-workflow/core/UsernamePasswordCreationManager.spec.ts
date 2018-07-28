import { TimestampBasedUuidGenerator } from '../../../../src/common/core';
import { AccountCreationManagerConfigurerImpl } from '../../../../src/standard-user-workflow/configurer/AccountCreationManagerConfigurer';
import { StandardAccountStatus } from '../../../../src/standard-user-workflow/core';
import { ReflectiveInjector, Injectable } from 'injection-js';
import { AccountCreationManager } from '../../../../src/standard-user-workflow/api';
import { given, autoclean, runInWorker } from '@zetapush/testing';
import { Injector } from 'injection-js';
import { Simple } from '@zetapush/platform';

describe(`AccountCreationManager`, () => {
  const registrationConfigurer = jasmine.createSpyObj('registrationConfigurer', ['account', 'welcome', 'confirmation']);

  beforeEach(async () => {
    await given()
      .credentials()
      /**/ .fromEnv()
      /**/ .newApp()
      /**/ .and()
      // .worker()
      // /**/ .dependencies(Simple)
      // /**/ .bootstrap((simple: Simple) => {})
      // /**/ .and()
      .apply(this);
  });

  it(
    `configured with
      - uuid: TimestampBasedUuidGenerator
      - account status = 'WAITING_FOR_CONFIRMATION'
     and run with
      - {username: 'odile.deray', password: '123456', profile: {firstname: 'Odile',lastname: 'DERAY'}}
     should return a profile with:
      - accountId = 20 numbers
      - accountStatus = 'WAITING_FOR_CONFIRMATION'
      - userProfile = {firstname: 'Odile', lastname: 'DERAY'}`,
    async () => {
      await runInWorker(this, [Simple], async (simple: Simple, injector: Injector) => {
        // GIVEN
        // create configurer + inject services
        const configurer = new AccountCreationManagerConfigurerImpl(registrationConfigurer, injector);
        configurer
          .uuid()
          /**/ .generator(TimestampBasedUuidGenerator)
          /**/ .and()
          .initialStatus()
          /**/ .value(StandardAccountStatus.WaitingConfirmation);
        const creationManager = await (<AccountCreationManagerConfigurerImpl>configurer).build();
        // WHEN
        const account = await creationManager.createAccount({
          username: 'odile.deray',
          password: '123456',
          profile: {
            firstname: 'Odile',
            lastname: 'DERAY'
          }
        });
        // THEN
        expect(account).toBeDefined();
        expect(account).not.toBeNull();
        expect(account.accountId).toBeDefined();
        expect(account.accountStatus).toBe(StandardAccountStatus.WaitingConfirmation);
        expect(account.userProfile).toEqual({
          firstname: 'Odile',
          lastname: 'DERAY'
        });
      });
    },
    10 * 60 * 1000
  );

  afterEach(async () => {
    await autoclean(this);
  });
});
