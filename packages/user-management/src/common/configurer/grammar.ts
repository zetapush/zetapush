import { Type } from '@zetapush/core';

import { AccountStatus, AccountStatusProvider } from '../../standard-user-workflow/api';
import { UuidGenerator, Uuid, Variables, Location, Token, TokenGenerator, TokenStorageManager } from '../api';

export interface And<P> {
  and(): P;
}

export interface Configurer<T> {
  build(): Promise<T>;
}

export interface StandardUserWorkflowConfigurer {
  registration(): RegistrationConfigurer;

  login(): LoginConfigurer;

  lostPassword(): LostPasswordConfigurer;
}

//==================== general ====================//

export interface UuidConfigurer<P> extends And<P> {
  generator(func: () => Promise<Uuid>): UuidConfigurer<P>;
  generator(instance: UuidGenerator): UuidConfigurer<P>;
  generator(generatorClass: Type<UuidGenerator>): UuidConfigurer<P>;
}

export interface EmailConfigurer<P> extends And<P> {
  from(email: string): EmailConfigurer<P>;
  subject(subject: string): EmailConfigurer<P>;
  // from(): EmailConfigurer<P>;
  smtp(): SmtpEmailConfigurer<EmailConfigurer<P>>;
  ovh(): OvhEmailConfigurer<EmailConfigurer<P>>;
  mailjet(): MailjetEmailConfigurer<EmailConfigurer<P>>;

  htmlTemplate /* TODO */(): EmailTemplateConfigurer<EmailConfigurer<P>>;

  textTemplate /* TODO */(): TemplateConfigurer<EmailConfigurer<P>>;
}

export interface SmtpEmailConfigurer<P> extends And<P> {
  host(smtpHost: string): SmtpEmailConfigurer<P>;
  port(smtpPort: string): SmtpEmailConfigurer<P>;
  username(smtpUsername: string): SmtpEmailConfigurer<P>;
  password(smtpPassword: string): SmtpEmailConfigurer<P>;
  ssl(enableSsl: boolean): SmtpEmailConfigurer<P>;
  starttls(enableTls: boolean): SmtpEmailConfigurer<P>;
}

export interface OvhEmailConfigurer<P> extends And<P> {
  url(ovhUrl: string): OvhEmailConfigurer<P>;
  username(ovhUsername: string): OvhEmailConfigurer<P>;
  password(ovhPassword: string): OvhEmailConfigurer<P>;
}
export interface MailjetEmailConfigurer<P> extends And<P> {
  url(mailjetUrl: string): MailjetEmailConfigurer<P>;
  apiKeyPublic(mailjetApiKeyPublic: string): MailjetEmailConfigurer<P>;
  apiKeyPrivate(mailjetApiKeyPrivate: string): MailjetEmailConfigurer<P>;
}

export interface TemplateConfigurer<P> extends And<P> {
  template(location: Location): EmailTemplateConfigurer<P>;
  template(func: (variables: Variables) => string): EmailTemplateConfigurer<P>;
}

export interface EmailTemplateConfigurer<P> extends TemplateConfigurer<P> {
  inlineCss /* TODO */(): EmailTemplateConfigurer<P>;

  inlineImages /* TODO */(): EmailTemplateConfigurer<P>;
}

export interface SmsConfigurer<P> extends And<P> {
  template /* TODO */(): SmsConfigurer<P>;
}

export interface SuccessFailureRedirectionConfigurer<P> extends And<P> {
  successUrl(url: string): SuccessFailureRedirectionConfigurer<P>;

  failureUrl(url: string): SuccessFailureRedirectionConfigurer<P>;
}

export interface FieldsConfigurer<P> extends And<P> {
  field(name: string): void /* TODO: FieldConfigurer<FieldsConfigurer<P>>*/;

  scan(model: Type<any>): ScanConfigurer<FieldsConfigurer<P>>;
}

export interface ScanConfigurer<P> extends And<P> {
  annotations(model: Type<any>): AnnotationsConfigurer<ScanConfigurer<P>>;
}

export interface AnnotationsConfigurer<P> extends And<P> {
  validation(): ValidationConfigurer<AnnotationsConfigurer<P>>;
}

export interface ValidationConfigurer<P> extends And<P> {}

export interface FieldConfigurer<P> extends And<P> {
  // TODO
}

export interface TokenManagerConfigurer<P> extends And<P> {
  validity(duration: number): TokenManagerConfigurer<P>;

  generator(func: () => Promise<Token>): TokenManagerConfigurer<P>;
  generator(instance: TokenGenerator): TokenManagerConfigurer<P>;
  generator(generatorClass: Type<TokenGenerator>): TokenManagerConfigurer<P>;
  storage(tokenStorageManager?: TokenStorageManager): TokenManagerConfigurer<P>;
}

//==================== account registration ====================//

export interface RegistrationConfigurer extends And<AccountConfigurer> {
  account(): AccountConfigurer;

  welcome(): RegistrationWelcomeConfigurer;

  confirmation(): RegistrationConfirmationConfigurer;
}

export interface AccountConfigurer extends And<RegistrationConfigurer> {
  uuid(): UuidConfigurer<AccountConfigurer>;

  initialStatus(): AccountStatusConfigurer;

  fields(): RegistrationFieldsConfigurer;
}

export interface RegistrationFieldsConfigurer extends FieldConfigurer<RegistrationConfigurer> {
  scan(): ScanConfigurer<RegistrationFieldsConfigurer>;
}

export interface AccountStatusConfigurer extends And<AccountConfigurer> {
  value(accountStatus: AccountStatus): AccountStatusConfigurer;

  provider(accountStatusProvider: AccountStatusProvider): AccountStatusConfigurer;
}

export interface RegistrationWelcomeConfigurer extends And<RegistrationConfigurer> {
  email(): EmailConfigurer<RegistrationWelcomeConfigurer>;

  sms(): SmsConfigurer<RegistrationWelcomeConfigurer>;
}

export interface RegistrationConfirmationConfigurer extends And<RegistrationConfigurer> {
  email(): EmailConfigurer<RegistrationConfirmationConfigurer>;

  sms(): SmsConfigurer<RegistrationConfirmationConfigurer>;

  redirection(): SuccessFailureRedirectionConfigurer<RegistrationConfirmationConfigurer>;

  token(): TokenManagerConfigurer<RegistrationConfirmationConfigurer>;
}

//==================== account login ====================//

export interface LoginConfigurer extends And<AccountConfigurer> {
  fields(): FieldsConfigurer<LoginConfigurer>;
}

//==================== account password reset ====================//

export interface LostPasswordConfigurer extends And<AccountConfigurer> {
  reset(): ResetPasswordConfigurer;
}

export interface ResetPasswordConfigurer extends And<AccountConfigurer> {
  email(): EmailConfigurer<ResetPasswordConfigurer>;
}
