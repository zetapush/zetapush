import {
  RegistrationConfirmationConfigurer,
  SuccessFailureRedirectionConfigurer,
  SmsConfigurer,
  EmailConfigurer,
  RegistrationConfigurer,
  TokenManagerConfigurer
} from '../grammar';
import { EmailConfigurerImpl } from '../email/EmailConfigurer';
import { AbstractParent } from '../AbstractParent';
import { AccountConfirmationManager, AccountConfirmationManagerInjectable } from '../../../standard-user-workflow/api';
import { ExtractEmailAddressFromProfileProvider } from '../../../standard-user-workflow/core/account/ExtractEmailAddressFromProfileProvider';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { TokenManagerConfigurerImpl } from '../token/TokenConfigurerImpl';
import { ConfigurationProperties } from '../ConfigurationProperties';
import { ZetaPushContext } from '../ZetaPushContext';
import { StaticAccountStatusProvider, StandardAccountStatus } from '../../../standard-user-workflow/core';
import { FixedLocationTemplateManagerHelper } from '../../core/template/FixedLocationTemplateManagerHelper';
import { VariablesWithContextProvider } from '../../core/template/Variables';
import { TokenCheckerAccountConfirmationManager } from '../../../standard-user-workflow/core/account/confirmation/TokenCherckerAccountConfirmationManager';
import { UserRepository, UserRepositoryInjectable } from '../../api/User';
import { Provider, Inject } from '@zetapush/core';
import { Configurer, SimpleProviderRegistry, scoped, Scope, scopedDependency } from '../Configurer';
import {
  TokenGenerator,
  TokenManager,
  EmailSender,
  MessageSender,
  TokenManagerInjectable,
  TemplateManager,
  TemplateManagerInjectable,
  EmailSenderInjectable
} from '../../api';
import { TemplatedEmailAccountConfirmationManager } from '../../../standard-user-workflow/core/account/confirmation/TemplatedEmailAccountConfirmationManager';
import { NamedLocation } from '../../core/resource/Named';

export class RegistrationConfirmationConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements RegistrationConfirmationConfigurer, Configurer {
  private emailConfigurer?: EmailConfigurerImpl<RegistrationConfirmationConfigurer>;
  private tokenConfigurer?: TokenManagerConfigurerImpl<RegistrationConfirmationConfigurer>;

  constructor(
    parentConfigurer: RegistrationConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parentConfigurer);
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
    throw new Error('Not implemented');
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    await providerRegistry.registerConfigurer(this.emailConfigurer);
    await providerRegistry.registerConfigurer(this.tokenConfigurer);

    if (this.emailConfigurer) {
      providerRegistry.registerFactory(
        AccountConfirmationManagerInjectable,
        [
          UserRepositoryInjectable,
          TokenManagerInjectable,
          EmailSenderInjectable,
          scopedDependency('confirmation-email.html', TemplateManagerInjectable),
          scopedDependency('confirmation-email.text', TemplateManagerInjectable)
        ],
        (
          userRepository: UserRepository,
          tokenGenerator: TokenManager,
          sender: MessageSender,
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
