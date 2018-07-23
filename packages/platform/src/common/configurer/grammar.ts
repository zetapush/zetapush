import { Provider, Type } from 'injection-js';
import { AccountStatus, AccountStatusProvider } from '../../user-management/standard-user-workflow/api';
import { UuidGenerator, Uuid } from '../api';

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
  // from(): EmailConfigurer<P>;

  htmlTemplate /* TODO */(): EmailInliningConfigurer<EmailConfigurer<P>>;

  textTemplate /* TODO */(): EmailConfigurer<P>;
}

export interface EmailInliningConfigurer<P> extends And<P> {
  inlineCss /* TODO */(): EmailInliningConfigurer<P>;

  inlineImages /* TODO */(): EmailInliningConfigurer<P>;
}

export interface SmsConfigurer<P> extends And<P> {
  template /* TODO */(): SmsConfigurer<P>;
}

export interface SuccessFailureRedirectionConfigurer<P> extends And<P> {
  successUrl(url: string): SuccessFailureRedirectionConfigurer<P>;

  failureUrl(url: string): SuccessFailureRedirectionConfigurer<P>;
}

export interface FieldsConfigurer<P> extends And<P> {
  field(name: string): void /* TODO: FieldConfigurer<FieldsConfigurer<P>> */;

  scan(model: Type<any>): ScanConfigurer<FieldsConfigurer<P>>;
}

export interface ScanConfigurer<P> extends And<P> {
  annotations(): AnnotationsConfigurer<ScanConfigurer<P>>;
}

export interface AnnotationsConfigurer<P> extends And<P> {
  validation(): ValidationConfigurer<AnnotationsConfigurer<P>>;
}

export interface ValidationConfigurer<P> extends And<P> {}

export interface FieldConfigurer<P> extends And<P> {
  // TODO
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
