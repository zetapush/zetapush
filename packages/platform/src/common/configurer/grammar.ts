import { TimestampBasedUuidGenerator } from '../core';
import { Provider, Type } from 'injection-js';
import { AccountStatus, AccountStatusProvider } from '../../user-management/standard-user-workflow/api';
import { StaticAccountStatusProvider } from '../../user-management/standard-user-workflow/core';

export interface And<P> {
  and(): P;
}

export interface Configurer<T> {
  build(): Promise<T>;
}

export interface StandardUserWorkflowConfigurer {
  account(): StandardUserWorkflowAccountConfigurer;
}

export interface StandardUserWorkflowAccountConfigurer extends And<StandardUserWorkflowConfigurer> {
  registration(): StandardUserWorkflowAccountRegistrationConfigurer;

  login(): StandardUserWorkflowAccountLoginConfigurer;

  reset(): StandardUserWorkflowAccountPasswordResetConfigurer;
}

//==================== general ====================//

export interface UuidConfigurer<P> extends And<P> {
  generator(provider: Provider);
}

export interface EmailConfigurer<P> extends And<P> {
  from(email: string): P;
  from(provider: Provider): P;

  htmlTemplate /* TODO */(): EmailInliningConfigurer<EmailConfigurer<P>>;

  textTemplate /* TODO */(): P;
}

export interface EmailInliningConfigurer<P> extends And<P> {
  inlineCss /* TODO */(): P;

  inlineImages /* TODO */(): P;
}

export interface SmsConfigurer<P> extends And<P> {
  template /* TODO */(): P;
}

export interface SuccessFailureRedirectionConfigurer<P> extends And<P> {
  successUrl(url: string);

  failureUrl(url: string);
}

export interface FieldsConfigurer<P> extends And<P> {
  field(name: string): FieldConfigurer<FieldsConfigurer<P>>;

  scan(): ScanConfigurer<P>;
}

export interface ScanConfigurer<P> extends And<P> {
  annotations(clazz: Type<any>): ScanConfigurer<P>;
}

export interface FieldConfigurer<P> extends And<P> {
  // TODO
}

//==================== account registration ====================//

export interface StandardUserWorkflowAccountRegistrationConfigurer extends And<StandardUserWorkflowAccountConfigurer> {
  uuid(): UuidConfigurer<StandardUserWorkflowAccountRegistrationConfigurer>;

  creationStatus(): StandardUserWorkflowAccountCreationStatusConfigurer;

  fields(): FieldsConfigurer<StandardUserWorkflowAccountRegistrationConfigurer>;

  welcome(): StandardUserWorkflowAccountRegistrationWelcomeConfigurer;

  confirmation(): StandardUserWorkflowAccountRegistratioConfirmationConfigurer;
}

export interface StandardUserWorkflowAccountCreationStatusConfigurer
  extends And<StandardUserWorkflowAccountRegistrationConfigurer> {
  value(accountStatus: AccountStatus): StandardUserWorkflowAccountCreationStatusConfigurer;

  provider(accountStatusProvider: AccountStatusProvider): StandardUserWorkflowAccountCreationStatusConfigurer;
}

export interface StandardUserWorkflowAccountRegistrationWelcomeConfigurer
  extends And<StandardUserWorkflowAccountRegistrationConfigurer> {
  email(): EmailConfigurer<StandardUserWorkflowAccountRegistrationWelcomeConfigurer>;

  sms(): SmsConfigurer<StandardUserWorkflowAccountRegistratioConfirmationConfigurer>;
}

export interface StandardUserWorkflowAccountRegistratioConfirmationConfigurer
  extends And<StandardUserWorkflowAccountRegistrationConfigurer> {
  email(): EmailConfigurer<StandardUserWorkflowAccountRegistratioConfirmationConfigurer>;

  sms(): SmsConfigurer<StandardUserWorkflowAccountRegistratioConfirmationConfigurer>;

  redirection(): SuccessFailureRedirectionConfigurer<StandardUserWorkflowAccountRegistratioConfirmationConfigurer>;
}

//==================== account login ====================//

export interface StandardUserWorkflowAccountLoginConfigurer {
  fields(): FieldsConfigurer<StandardUserWorkflowAccountRegistrationConfigurer>;
}

//==================== account password reset ====================//

export interface StandardUserWorkflowAccountPasswordResetConfigurer {
  email(): EmailConfigurer<StandardUserWorkflowAccountRegistrationWelcomeConfigurer>;
}
