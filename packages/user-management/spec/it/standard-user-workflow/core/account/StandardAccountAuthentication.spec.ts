import { given, runInWorker, autoclean } from '@zetapush/testing';
import { AuthenticationConfigurerImpl } from '../../../../../src/standard-user-workflow/configurer/account/AuthenticationConfigurerImpl';
import { AuthenticationManagerInjectable } from '../../../../../src/standard-user-workflow/api/Authentication';
import { mock } from 'ts-mockito';
import { LegacyAdapterUserRepository } from '../../../../../src/standard-user-workflow/legacy';
import {
  ZetaPushContext,
  ConfigurationProperties,
  AccountCreationManager,
  StandardAccountStatus
} from '../../../../../src';
import { StandardUserWorkflow } from '../../../../../src/standard-user-workflow/core/StandardUserWorkflow';
import { UserRepositoryInjectable } from '../../../../../src/common/api/User';
import { AccountCreationManagerInjectable } from '../../../../../src/';

describe(`StandardAccountAuthentication`, () => {
  const authConfigurer = jasmine.createSpyObj('StandardUserWorkflowConfigurer', [
    'registration',
    'login',
    'lostPassword'
  ]);
  const properties = mock<ConfigurationProperties>(<any>{});
  const zetapushContext = mock<ZetaPushContext>(<any>{});

  describe(`connect()`, () => {
    describe(`that use the LoginPasswordAuthenticationManager`, () => {
      beforeEach(async () => {
        await given()
          .credentials()
          .fromEnv()
          .newApp()
          .and()
          .worker()
          .configuration(async () => {
            // Configure the Cloud Service we want to test
            const configurer = new AuthenticationConfigurerImpl(authConfigurer, properties, zetapushContext);
            configurer.loginPassword();
            return await (<AuthenticationConfigurerImpl>configurer).getProviders();
          })
          .dependencies(StandardUserWorkflow, AccountCreationManagerInjectable, UserRepositoryInjectable)
          .and()
          .apply(this);
      });

      describe(`On valid authentication`, () => {
        it(
          `Connection success and that returns the connected user`,
          async () => {
            await runInWorker(
              this,
              async (
                _,
                standardUserWorkflow: StandardUserWorkflow,
                creationManager: AccountCreationManager,
                userRepo: LegacyAdapterUserRepository
              ) => {
                // GIVEN
                const account = await creationManager.createAccount({
                  credentials: {
                    login: 'odile.deray',
                    password: 'password'
                  },
                  profile: {
                    firstname: 'Odile',
                    lastname: 'DERAY'
                  }
                });

                // Set the account status
                await userRepo.updateStatus(account.accountId, StandardAccountStatus.Active);

                // WHEN
                const connectedAccount = await standardUserWorkflow.login({
                  login: 'odile.deray',
                  password: 'password'
                });

                // THEN
                expect(connectedAccount).toEqual(account);
              }
            );
          },
          5 * 60 * 1000
        );
      });

      afterEach(async () => {
        await autoclean(this);
      });
    });
  });
});
