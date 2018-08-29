import {
  StandardUserWorkflowConfigurer,
  RegistrationConfigurer,
  AuthenticationConfigurer,
  LostPasswordConfigurer
} from '../../common/configurer/grammar';
import { StandardUserWorkflow } from '../core/StandardUserWorkflow';
import { RegistrationConfigurerImpl } from './account/RegistrationConfigurerImpl';
import { Provider } from '@zetapush/core';
import {
  ConfigurationProperties,
  ZetaPushContext,
  Configurer,
  SimpleProviderRegistry,
  scopedDependency
} from '../../common/configurer';
import {
  AccountConfirmationManagerInjectable,
  AccountCreationManagerInjectable,
  AccountConfirmationManager,
  AccountCreationManager,
  RedirectionProviderInjectable,
  RedirectionProvider,
  ConfirmedAccount
} from '../api';
import { ConfirmationUrlHttpHandler } from '../core/account/confirmation/ConfirmationUrlHttpHandler';
import { HttpServerInjectable, HttpServer, ExpressServerConfigurer } from '@zetapush/http-server';
import { AuthenticationConfigurerImpl } from '../configurer/account/AuthenticationConfigurerImpl';

export class StandardUserWorkflowConfigurerImpl implements StandardUserWorkflowConfigurer, Configurer {
  private registrationConfigurer?: RegistrationConfigurerImpl;
  private authenticationConfigurer?: AuthenticationConfigurerImpl;

  constructor(private properties: ConfigurationProperties, private zetapushContext: ZetaPushContext) {}

  registration(): RegistrationConfigurer {
    this.registrationConfigurer = new RegistrationConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.registrationConfigurer;
  }

  login(): AuthenticationConfigurer {
    this.authenticationConfigurer = new AuthenticationConfigurerImpl(this, this.properties, this.zetapushContext);
    return this.authenticationConfigurer;
  }

  lostPassword(): LostPasswordConfigurer {
    throw new Error('Not implemented');
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.registrationConfigurer, this.authenticationConfigurer);
    providerRegistry.registerFactory(
      StandardUserWorkflow,
      [
        AccountCreationManagerInjectable,
        AccountConfirmationManagerInjectable,
        scopedDependency('confirmation.success', RedirectionProviderInjectable),
        scopedDependency('confirmation.failure', RedirectionProviderInjectable)
      ],
      (
        creationManager: AccountCreationManager,
        confirmationManager: AccountConfirmationManager,
        success: RedirectionProvider<ConfirmedAccount>,
        failure: RedirectionProvider<Error>
      ) => new StandardUserWorkflow(creationManager, confirmationManager, success, failure)
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
