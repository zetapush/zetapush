import { TimestampBasedUuidGenerator } from '../../../../../src/common/core';
import { StandardAccountStatus } from '../../../../../src/standard-user-workflow/core';

import { given, autoclean, runInWorker } from '@zetapush/testing';
import { AccountCreationManagerConfigurerImpl } from '../../../../../src/standard-user-workflow/configurer/account/AccountCreationManagerConfigurer';
import 'jasmine';
import {
  AccountCreationManagerInjectable,
  AccountCreationManager,
  LegacyAdapterUserRepository,
  USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
  USER_LEGACY_ADAPTER_COLUMN_DATA
} from '../../../../../src';
import { Simple, Gda } from '@zetapush/platform-legacy';

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
          /**/ .testModule(async () => {
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
            return {
              providers: await (<AccountCreationManagerConfigurerImpl>configurer).getProviders()
            };
          })
          /**/ .dependencies(AccountCreationManagerInjectable, Simple, Gda)
          /**/ .and()
          .apply(this);
      });

      describe(`on a valid account`, () => {
        it(
          `stores the account and returns it with an identifier and WaitingConfirmation status`,
          async () => {
            await runInWorker(this, async (creationManager: AccountCreationManager, simple: Simple, gda: Gda) => {
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

              expect(account.accountStatus).toBe(StandardAccountStatus.WaitingConfirmation);
              expect(<any>account.profile).toEqual({
                firstname: 'Odile',
                lastname: 'DERAY'
              });
              // check in database
              const user = await simple.checkAccount({ key: 'odile.deray' });
              expect(user).toBeDefined();
              expect(user.fields.accountId).toBeDefined();
              expect(user.fields.accountId).toBe(account.accountId);
              expect(user.status.data).toBe(StandardAccountStatus.WaitingConfirmation);
              expect(user.status.active).toBe(false);
              expect(user.fields.userProfile).toEqual({
                firstname: 'Odile',
                lastname: 'DERAY'
              });
              const { result } = await gda.get({
                table: USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
                key: account.accountId
              });
              expect(result).toBeDefined();
              const column = result[USER_LEGACY_ADAPTER_COLUMN_DATA];
              expect(column).toBeDefined();
              expect(column.userKey).toBeDefined();
              expect(column.login).toBe('odile.deray');
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
