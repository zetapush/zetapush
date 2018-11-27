import { AbstractParent } from '../../../common/configurer/AbstractParent';
import {
  ResetPasswordConfigurer,
  AskResetPasswordConfigurer,
  Configurer,
  EmailConfigurer,
  SuccessFailureRedirectionConfigurer,
  EmailConfigurerImpl,
  Scope,
  SimpleProviderRegistry,
  scopedDependency
} from '../../../common/configurer';
import { Provider, ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import {
  AskResetPasswordManagerInjectable,
  ResetPasswordUrlProvider,
  ResetPasswordUrlProviderInjectable,
  ResetPasswordContext
} from '../../api/LostPassword';
import {
  UserRepositoryInjectable,
  TokenManagerInjectable,
  MessageSenderInjectable,
  UserRepository,
  TokenManager,
  MessageSender,
  TemplateManagerInjectable,
  TemplateManager
} from '../../../common/api';
import {
  EmailAskResetPasswordManager,
  ExtractEmailAddressFromProfileProvider,
  StaticConfirmationUrlProvider
} from '../../core';
import { VariablesWithContextProvider } from '../../../common/core/template/Variables';
import { FixedLocationTemplateManagerHelper } from '../../../common/core';
import { ConfirmationUrlProvider, ConfirmationUrlProviderInjectable } from '../../api';
import { NamedLocation } from '../../../common/core/resource/Named';
import { SuccessFailureRedirectionConfigurerImpl } from '../confirmation/SuccessFailureRedirectionConfigurer';
import { InstanceHelper } from '../../../common/configurer/InstanceHelper';
import { FuncResetPasswordUrlProvider } from '../../core/lost-password/FuncConfirmationUrlProvider';
import { StaticResetPasswordUrlProvider } from '../../core/lost-password/StaticResetPasswordUrlProvider';

export class AskResetPasswordConfigurerImpl extends AbstractParent<ResetPasswordConfigurer>
  implements AskResetPasswordConfigurer, Configurer {
  private emailConfigurer?: EmailConfigurerImpl<AskResetPasswordConfigurer>;
  private resetPasswordUrlHelper: InstanceHelper<ResetPasswordUrlProvider, string>;
  private askResetPasswordUrl?: string;

  constructor(
    parent: ResetPasswordConfigurer,
    private properties: ConfigurationProperties,
    private zetapushContext: ZetaPushContext
  ) {
    super(parent);
    this.resetPasswordUrlHelper = new InstanceHelper(ResetPasswordUrlProviderInjectable, FuncResetPasswordUrlProvider);
  }

  email(): EmailConfigurer<AskResetPasswordConfigurer> {
    this.emailConfigurer = new EmailConfigurerImpl(this, new Scope('ask-reset-password-email'));
    return this.emailConfigurer;
  }

  url(urlProvider: ResetPasswordUrlProvider): AskResetPasswordConfigurer;
  url(func: (context: ResetPasswordContext) => Promise<string>): AskResetPasswordConfigurer;
  url(resetPasswordUrl: string): AskResetPasswordConfigurer;
  url(arg: any): AskResetPasswordConfigurer {
    if (typeof arg === 'string') {
      this.askResetPasswordUrl = arg;
    } else {
      this.resetPasswordUrlHelper.register(arg);
    }
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();

    await providerRegistry.registerConfigurer(this.emailConfigurer);

    if (this.askResetPasswordUrl) {
      providerRegistry.registerInstance(
        ResetPasswordUrlProviderInjectable,
        new StaticResetPasswordUrlProvider(this.askResetPasswordUrl)
      );
    } else {
      providerRegistry.registerProvider(this.resetPasswordUrlHelper.getProvider());
    }

    if (this.emailConfigurer) {
      providerRegistry.registerFactory(
        AskResetPasswordManagerInjectable,
        [
          UserRepositoryInjectable,
          TokenManagerInjectable,
          MessageSenderInjectable,
          ResetPasswordUrlProviderInjectable,
          scopedDependency('ask-reset-password-email.html', TemplateManagerInjectable),
          scopedDependency('ask-reset-password-email.text', TemplateManagerInjectable)
        ],
        (
          userRepository: UserRepository,
          tokenGenerator: TokenManager,
          sender: MessageSender,
          askResetPasswordProvider: ResetPasswordUrlProvider,
          htmlTemplateManager: TemplateManager,
          textTemplateManager: TemplateManager
        ) => {
          const emailAddressProvider = new ExtractEmailAddressFromProfileProvider();
          return new EmailAskResetPasswordManager(
            userRepository,
            tokenGenerator,
            sender,
            askResetPasswordProvider,
            emailAddressProvider,
            new VariablesWithContextProvider(this.properties, this.zetapushContext),
            new FixedLocationTemplateManagerHelper(
              new NamedLocation('html-ask-reset-password-email'),
              htmlTemplateManager
            ),
            new FixedLocationTemplateManagerHelper(
              new NamedLocation('text-ask-reset-password-email'),
              textTemplateManager
            )
          );
        }
      );
    }

    return providerRegistry.getProviders();
  }
}
