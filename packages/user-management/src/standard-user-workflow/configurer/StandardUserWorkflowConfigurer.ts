import {
  StandardUserWorkflowConfigurer,
  RegistrationConfigurer,
  AuthenticationConfigurer,
  LostPasswordConfigurer
} from '../../common/configurer/grammar';
import { StandardUserWorkflow } from '../core/StandardUserWorkflow';
import { RegistrationConfigurerImpl } from './account/RegistrationConfigurerImpl';
import { Provider } from '@zetapush/core';
import { Configurer, SimpleProviderRegistry, scopedDependency } from '../../common/configurer';
import {
  AccountConfirmationManagerInjectable,
  AccountCreationManagerInjectable,
  AccountConfirmationManager,
  AccountCreationManager,
  RedirectionProviderInjectable,
  RedirectionProvider,
  ConfirmedAccount,
  AskResetPasswordAccount,
  ConfirmResetPasswordAccount,
  Account
} from '../api';
import { ConfirmationUrlHttpHandler } from '../core/account/confirmation/ConfirmationUrlHttpHandler';
import { HttpServerInjectable, HttpServer, ExpressServerConfigurer } from '@zetapush/http-server';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { AuthenticationConfigurerImpl } from '../configurer/account/AuthenticationConfigurerImpl';
import { LostPasswordConfigurerImpl } from './lost-password';
import {
  AskResetPasswordManagerInjectable,
  ConfirmResetPasswordManagerInjectable,
  AskResetPasswordManager,
  ConfirmResetPasswordManager
} from '../api/LostPassword';

export class StandardUserWorkflowConfigurerImpl implements StandardUserWorkflowConfigurer, Configurer {
  private registrationConfigurer?: RegistrationConfigurerImpl;
  private authenticationConfigurer?: AuthenticationConfigurerImpl;
  private lostPasswordConfigurer?: LostPasswordConfigurerImpl;

  constructor(private properties: ConfigurationProperties, private zetapushContext: ZetaPushContext) {}

  registration(): RegistrationConfigurer {
    if (!this.registrationConfigurer) {
      this.registrationConfigurer = new RegistrationConfigurerImpl(this, this.properties, this.zetapushContext);
    }
    return this.registrationConfigurer;
  }

  login(): AuthenticationConfigurer {
    if (!this.authenticationConfigurer) {
      this.authenticationConfigurer = new AuthenticationConfigurerImpl(this, this.properties, this.zetapushContext);
    }
    return this.authenticationConfigurer;
  }

  lostPassword(): LostPasswordConfigurer {
    if (!this.lostPasswordConfigurer) {
      this.lostPasswordConfigurer = new LostPasswordConfigurerImpl(this, this.properties, this.zetapushContext);
    }
    return this.lostPasswordConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerConfigurer(this.lostPasswordConfigurer);

    await providerRegistry.registerConfigurer(this.registrationConfigurer, this.authenticationConfigurer);
    providerRegistry.registerFactory(
      StandardUserWorkflow,
      [
        AccountCreationManagerInjectable,
        AccountConfirmationManagerInjectable,
        AskResetPasswordManagerInjectable,
        ConfirmResetPasswordManagerInjectable,
        scopedDependency('confirmation.success', RedirectionProviderInjectable),
        scopedDependency('confirmation.failure', RedirectionProviderInjectable)
      ],
      (
        creationManager: AccountCreationManager,
        confirmationManager: AccountConfirmationManager,
        askResetPasswordManager: AskResetPasswordManager,
        confirmResetPasswordManager: ConfirmResetPasswordManager,
        successConfirmationAccount: RedirectionProvider<ConfirmedAccount>,
        failureConfirmationAccount: RedirectionProvider<Error>
      ) =>
        new StandardUserWorkflow(
          creationManager,
          confirmationManager,
          askResetPasswordManager,
          confirmResetPasswordManager,
          successConfirmationAccount,
          failureConfirmationAccount
        )
    );
    // TODO: should only provide Http handler if confirmation url configured and points to zetapush ?
    // TODO: this should be imported through modules
    await providerRegistry.registerConfigurer(new ExpressServerConfigurer());
    providerRegistry.registerFactory(
      ConfirmationUrlHttpHandler,
      [StandardUserWorkflow, HttpServerInjectable],
      (standardUserWorkflow: StandardUserWorkflow, httpServer: HttpServer) =>
        new ConfirmationUrlHttpHandler(standardUserWorkflow, httpServer)
    );
    return providerRegistry.getProviders();
  }
}
