import { TimestampBasedUuidGenerator } from '../../../../../src/common/core';
import { StandardAccountStatus } from '../../../../../src/standard-user-workflow/core';

import { given, autoclean, runInWorker } from '@zetapush/testing';
import { AccountCreationManagerConfigurerImpl } from '../../../../../src/standard-user-workflow/configurer/account/AccountCreationManagerConfigurer';
import 'jasmine';
import {
  AccountCreationManagerInjectable,
  AccountCreationManager,
  LegacyAdapterUserRepository
} from '../../../../../src';

describe(`AccountCreationManager`, () => {
  const registrationConfigurer = jasmine.createSpyObj('registrationConfigurer', ['account', 'welcome', 'confirmation']);
  describe(`createAccount()`, () => {
    describe(`that stores in LegacyAdapterUserRepository`, () => {
      beforeEach(async () => {
        await given()
          .credentials()
          /**/ .fromEnv()
          /**/ .newApp()
          /**/ .and()
          .worker()
          /**/ .configuration(async () => {
            // create configurer + inject services
            const configurer = new AccountCreationManagerConfigurerImpl(registrationConfigurer);
            configurer
              .uuid()
              /**/ .generator(TimestampBasedUuidGenerator)
              /**/ .and()
              .initialStatus()
              /**/ .value(StandardAccountStatus.WaitingConfirmation)
              /**/ .and()
              .storage(LegacyAdapterUserRepository);
            return await (<AccountCreationManagerConfigurerImpl>configurer).getProviders();
          })
          /**/ .dependencies(AccountCreationManagerInjectable)
          /**/ .and()
          .apply(this);
      });

      describe(`on a valid account`, () => {
        it(
          `stores the account and returns it with an identifier and WaitingConfirmation status`,
          async () => {
            await runInWorker(this, async (_, creationManager: AccountCreationManager) => {
              // WHEN
              const account = await creationManager.createAccount({
                credentials: {
                  login: 'odile.deray',
                  password: '123456'
                },
                profile: {
                  firstname: 'Odile',
                  lastname: 'DERAY'
                }
              });

              // THEN
              expect(account).toBeDefined();
              expect(account).not.toBeNull();
              expect(account.accountId).toBeDefined();

              console.log('==> account status', account.accountStatus);

              expect(account.accountStatus).toBe(StandardAccountStatus.WaitingConfirmation);
              expect(<any>account.profile).toEqual({
                firstname: 'Odile',
                lastname: 'DERAY'
              });
            });
          },
          5 * 60 * 1000
        );
      });

      // TODO: test account already exists

      // TODO: test with no profile information

      // TODO: test with public fields vs private fields

      afterEach(async () => {
        await autoclean(this);
      });
    });
  });
});
