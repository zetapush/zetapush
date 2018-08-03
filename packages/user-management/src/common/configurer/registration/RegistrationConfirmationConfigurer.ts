import {
  RegistrationConfirmationConfigurer,
  Configurer,
  SuccessFailureRedirectionConfigurer,
  SmsConfigurer,
  EmailConfigurer,
  RegistrationConfigurer,
  TokenGeneratorConfigurer
} from '../grammar';
import { EmailConfigurerImpl } from '../email/EmailConfigurer';
import { AbstractParent } from '../AbstractParent';
import { AccountConfirmationManager } from '../../../standard-user-workflow/api';
import { TemplatedMessageAccountConfirmationManager } from '../../core/confirmation/TemplatedMessageAccountConfirmationManager';
import { TokenGeneratorConfigurerImpl } from '../token/TokenConfigurer';
import { Injector } from 'injection-js';
import { ExtractEmailAddressFromProfileProvider } from '../../../standard-user-workflow/core/account/ExtractEmailAddressFromProfileProvider';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';

export class RegistrationConfirmationConfigurerImpl extends AbstractParent<RegistrationConfigurer>
  implements RegistrationConfirmationConfigurer, Configurer<AccountConfirmationManager> {
  private emailConfigurer?: EmailConfigurerImpl<RegistrationConfirmationConfigurer>;
  private tokenConfigurer?: TokenGeneratorConfigurerImpl<RegistrationConfirmationConfigurer>;

  constructor(parentConfigurer: RegistrationConfigurer, private injector: Injector) {
    super(parentConfigurer);
  }

  token(): TokenGeneratorConfigurer<RegistrationConfirmationConfigurer> {
    this.tokenConfigurer = new TokenGeneratorConfigurerImpl(this, this.injector);
    return this.tokenConfigurer;
  }

  email(): EmailConfigurer<RegistrationConfirmationConfigurer> {
    this.emailConfigurer = new EmailConfigurerImpl(this);
    return this.emailConfigurer;
  }

  sms(): SmsConfigurer<RegistrationConfirmationConfigurer> {
    throw new Error('Not implemented');
  }

  redirection(): SuccessFailureRedirectionConfigurer<RegistrationConfirmationConfigurer> {
    throw new Error('Not implemented');
  }

  async build(): Promise<AccountConfirmationManager> {
    let tokenGenerator;
    if (this.tokenConfigurer) {
      tokenGenerator = await this.tokenConfigurer.build();
    } else {
      // TODO: default
      throw new MissingMandatoryConfigurationError('No token generator provided');
    }
    if (this.emailConfigurer) {
      const emailAddressProvider = new ExtractEmailAddressFromProfileProvider();
      const {
        sender,
        htmlTemplateManager,
        htmlLocation,
        textTemplateManager,
        textLocation
      } = await this.emailConfigurer.build();
      return new TemplatedMessageAccountConfirmationManager(
        tokenGenerator,
        emailAddressProvider,
        sender,
        htmlLocation,
        htmlTemplateManager,
        textLocation,
        textTemplateManager
      );
    }
    throw new Error('Not implemented');
  }
}
