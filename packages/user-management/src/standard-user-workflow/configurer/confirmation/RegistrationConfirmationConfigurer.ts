import {
  RegistrationConfirmationConfigurer,
  SuccessFailureRedirectionConfigurer,
  SmsConfigurer,
  EmailConfigurer,
  RegistrationConfigurer,
  TokenManagerConfigurer
} from '../../../common/configurer/grammar';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { EmailConfigurerImpl } from '../../../common/configurer/email/EmailConfigurer';
import { AbstractParent } from '../../../common/configurer/AbstractParent';
import { AccountConfirmationManager, AccountConfirmationManagerInjectable } from '../../../standard-user-workflow/api';
import { ExtractEmailAddressFromProfileProvider } from '../../../standard-user-workflow/core/account/ExtractEmailAddressFromProfileProvider';
import { MissingMandatoryConfigurationError } from '../../../common/configurer/ConfigurerError';
import { TokenManagerConfigurerImpl } from '../../../common/configurer/token/TokenConfigurerImpl';
import { StaticAccountStatusProvider, StandardAccountStatus } from '../../../standard-user-workflow/core';
import { FixedLocationTemplateManagerHelper } from '../../../common/core/template/FixedLocationTemplateManagerHelper';
import { VariablesWithContextProvider } from '../../../common/core/template/Variables';
import { TokenCheckerAccountConfirmationManager } from '../../../standard-user-workflow/core/account/confirmation/TokenCherckerAccountConfirmationManager';
import { UserRepository, UserRepositoryInjectable } from '../../../common/api/User';
import { Provider, Inject } from '@zetapush/core';
import {
  Configurer,
  SimpleProviderRegistry,
  scoped,
  Scope,
  scopedDependency
} from '../../../common/configurer/Configurer';
import {
  TokenGenerator,
  TokenManager,
  EmailSender,
  MessageSender,
  TokenManagerInjectable,
  TemplateManager,
  TemplateManagerInjectable,
  MessageSenderInjectable
} from '../../../common/api';
import { TemplatedEmailAccountConfirmationManager } from '../../core/account/confirmation/TemplatedEmailAccountConfirmationManager';
import { NamedLocation } from '../../../common/core/resource/Named';
import {
  ConfirmationUrlProvider,
  AccountConfirmationContext,
  ConfirmationUrlProviderInjectable
} from '../../api/Confirmation';
import { isFunction, isClass, InstanceHelper } from '../../../common/configurer/InstanceHelper';
import { FuncConfirmationUrlProvider } from '../../core/account/confirmation/FuncConfirmationUrlProvider';
import { StaticConfirmationUrlProvider } from '../../core/account/confirmation/StaticConfirmationUrlProvider';
import { ConfirmationUrlHttpHandler } from '../../core/account/confirmation/ConfirmationUrlHttpHandler';
import { StandardUserWorkflow } from '../../core/StandardUserWorkflow';
import { HttpServerInjectable, HttpServer, ExpressServerWrapper, ExpressServerConfigurer } from '@zetapush/http-server';
import { SuccessFailureRedirectionConfigurerImpl } from './SuccessFailureRedirectionConfigurer';

export class RegistrationConfirmationConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements RegistrationConfirmationConfigurer, Configurer {
  private emailConfigurer?: EmailConfigurerImpl<RegistrationConfirmationConfigurer>;
  private tokenConfigurer?: TokenManagerConfigurerImpl<RegistrationConfirmationConfigurer>;
  private confirmationUrlHelper: InstanceHelper<ConfirmationUrlProvider, string>;
  private confirmationUrl?: string;
  private redirectionConfigurer?: SuccessFailureRedirectionConfigurerImpl<RegistrationConfirmationConfigurer>;

  constructor(
    parentConfigurer: RegistrationConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parentConfigurer);
    this.confirmationUrlHelper = new InstanceHelper(ConfirmationUrlProviderInjectable, FuncConfirmationUrlProvider);
  }

  url(urlProvider: ConfirmationUrlProvider): RegistrationConfirmationConfigurer;
  url(func: (context: AccountConfirmationContext) => Promise<string>): RegistrationConfirmationConfigurer;
  url(confirmationUrl: string): RegistrationConfirmationConfigurer;
  url(arg: any): RegistrationConfirmationConfigurer {
    if (typeof arg === 'string') {
      this.confirmationUrl = arg;
    } else {
      this.confirmationUrlHelper.register(arg);
    }
    return this;
  }

  token(): TokenManagerConfigurer<RegistrationConfirmationConfigurer> {
    this.tokenConfigurer = new TokenManagerConfigurerImpl(this);
    return this.tokenConfigurer;
  }

  email(): EmailConfigurer<RegistrationConfirmationConfigurer> {
    this.emailConfigurer = new EmailConfigurerImpl(this, new Scope('confirmation-email'));
    return this.emailConfigurer;
  }

  sms(): SmsConfigurer<RegistrationConfirmationConfigurer> {
    throw new Error('Not implemented');
  }

  redirection(): SuccessFailureRedirectionConfigurer<RegistrationConfirmationConfigurer> {
    this.redirectionConfigurer = new SuccessFailureRedirectionConfigurerImpl(this, new Scope('confirmation'));
    return this.redirectionConfigurer;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.required(
      scopedDependency('confirmation-email.sender', MessageSenderInjectable),
      new MissingMandatoryConfigurationError(
        `Confirmation is enabled but neither email nor sms is enabled/configured to send confirmation message`
      )
    );

    await providerRegistry.registerConfigurer(this.emailConfigurer);
    await providerRegistry.registerConfigurer(this.tokenConfigurer);
    if (this.confirmationUrl) {
      providerRegistry.registerInstance(
        ConfirmationUrlProviderInjectable,
        new StaticConfirmationUrlProvider(this.confirmationUrl)
      );
    } else {
      providerRegistry.registerProvider(this.confirmationUrlHelper.getProvider());
    }
    // if there is confirmation using confirmation link
    // => register a http handler for that link
    // => register redirection providers to redirect once confirmation has been done
    if (this.confirmationUrl || this.confirmationUrlHelper.getProvider()) {
      await providerRegistry.registerConfigurer(this.redirectionConfigurer);
    }

    if (this.emailConfigurer) {
      providerRegistry.registerFactory(
        AccountConfirmationManagerInjectable,
        [
          UserRepositoryInjectable,
          TokenManagerInjectable,
          scopedDependency('confirmation-email.sender', MessageSenderInjectable),
          ConfirmationUrlProviderInjectable,
          scopedDependency('confirmation-email.html', TemplateManagerInjectable),
          scopedDependency('confirmation-email.text', TemplateManagerInjectable)
        ],
        (
          userRepository: UserRepository,
          tokenGenerator: TokenManager,
          sender: MessageSender,
          confirmationUrlProvider: ConfirmationUrlProvider,
          htmlTemplateManager: TemplateManager,
          textTemplateManager: TemplateManager
        ) => {
          // TODO: allow user to choose new status
          const confirmedStatusProvider = new StaticAccountStatusProvider(StandardAccountStatus.Active);
          const delegate = new TokenCheckerAccountConfirmationManager(
            tokenGenerator,
            userRepository,
            confirmedStatusProvider
          );
          if (this.emailConfigurer) {
            const emailAddressProvider = new ExtractEmailAddressFromProfileProvider();
            return new TemplatedEmailAccountConfirmationManager(
              delegate,
              emailAddressProvider,
              sender,
              confirmationUrlProvider,
              new VariablesWithContextProvider(this.properties, this.zetapushContext),
              new FixedLocationTemplateManagerHelper(new NamedLocation('html-confirmation-email'), htmlTemplateManager),
              new FixedLocationTemplateManagerHelper(new NamedLocation('text-confirmation-email'), textTemplateManager)
            );
          }
          throw new Error('Not implemented');
        }
      );
    }
    return providerRegistry.getProviders();
  }
}
