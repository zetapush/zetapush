import { Type } from '@zetapush/core';

import { AccountStatus, AccountStatusProvider } from '../../standard-user-workflow/api';
import { UuidGenerator, Uuid, Variables, Location, Token, TokenGenerator, TokenRepository } from '../api';
import { AxiosInstance } from 'axios';
import { UserRepository } from '../api/User';
import { ConfirmationUrlProvider, AccountConfirmationContext } from '../../standard-user-workflow/api/Confirmation';
import { Provider } from '@zetapush/core';
import { ResetPasswordUrlProvider, ResetPasswordContext } from '../../standard-user-workflow/api/LostPassword';

export interface And<P> {
  /**
   * Continue chaining to go back to parent configurer.
   *
   * @returns the parent configurer
   */
  and(): P;
}

// TODO: add this everywhere the user can choose an implementation (ex: mail through SMTP, OVH or Mailjet)
export interface Alternative<S> {
  enable(enable: boolean): S;
  enable(enable: () => boolean | Promise<boolean>): S;
}

export interface StandardUserWorkflowConfigurer {
  /**
   * Configure registration process of the end users in your application.
   *
   * By default the registration process is configured like this:
   * 1. End user registers himself to your application and provides account details
   * 2. An email with a link to confirm its account is sent to the end user
   * 3. The end user clicks on the link to confirm its account
   * 4. The account is confirmed and the user can now login into your application.
   *
   * This configurer lets you configure many aspects of this default process.
   *
   * Configure end users account fields used for registration
   * ========================================================
   *
   * Configure fields used for creating end user accounts using class
   * ----------------------------------------------------------------
   *
   * You can indicate which fields are used for account creation by
   * simply provide a class definition:
   * @example
   * ```
   * class MyEndUsersAccountCreationDetails {
   *   public username: string;
   *   public password: string;
   *   public confirmPassword: string;
   *   public email: string;
   * }
   *
   * .registration()
   *   .account()
   *     .fields()
   *       .scan(MyEndUsersAccountDetails)
   * ```
   *
   * Besides, you can benefit of TypeScript decorators to annotate
   * each field with validation constraints:
   * @example
   * ```
   * class MyEndUsersAccountCreationDetails {
   *   @Required()
   *   @Length(10, 20)
   *   public username: string;
   *   @Required()
   *   @Length(6, 20)
   *   public password: string;
   *   @Required()
   *   @SameAs('password')
   *   public confirmPassword: string;
   *   @IsEmail()
   *   @Required()
   *   public email: string;
   * }
   *
   * .registration()
   *   .account()
   *     .fields()
   *       .scan(MyEndUsersAccountDetails)
   * ```
   *
   *
   * Configure fields used for creating end user accounts manually
   * -------------------------------------------------------------
   *
   * TODO
   *
   * Configure initial account status
   * --------------------------------
   *
   * As said above, when account is created, the user must confirm it.
   * So by default, the account status is initially set to "WAITING_FOR_CONFIRMATION"
   * (`StandardAccountStatus.WaitingConfirmation`, {@link StandardAccountStatus}).
   *
   * For example, if you don't need confirmation, you can set initial status to "ACTIVE"
   * (`StandardAccountStatus.Active`, {@link StandardAccountStatus}):
   * @example
   * ```
   * .registration()
   *   .account()
   *     .initialStatus()
   *       .value(StandardAccountStatus.Active)
   * ```
   *
   * Configure account uuid generation
   * ---------------------------------
   *
   * When a end user account is created a unique technical identifier is generated.
   *
   * By default, a 20 characters uuid is generated. You can choose another uuid generator:
   * @example
   * ```
   * .registration()
   *   .account()
   *     .uuid()
   *       .generator(() => Math.random())
   * ```
   *
   * Configure OAuth accounts
   * ========================
   *
   * TODO
   *
   * Configure Google
   * ----------------
   *
   * TODO
   *
   * Configure Facebook
   * ------------------
   *
   * TODO
   *
   * Configure Github
   * ----------------
   *
   * TODO
   *
   * Configure any other OAuth provider
   * ----------------------------------
   *
   * TODO
   *
   * Configure account confirmation
   * ==============================
   *
   * TODO
   *
   * Configure welcome message
   * =========================
   *
   * TODO
   *
   */
  registration(): RegistrationConfigurer;

  login(): AuthenticationConfigurer;

  lostPassword(): LostPasswordConfigurer;
}

//==================== general ====================//

export interface UuidConfigurer<P> extends And<P> {
  generator(func: () => Promise<Uuid>): UuidConfigurer<P>;
  generator(provider: Provider): UuidConfigurer<P>;
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

  htmlTemplate(): EmailTemplateConfigurer<EmailConfigurer<P>>;

  textTemplate(): TextTemplateConfigurer<EmailConfigurer<P>>;
}

export interface SmtpEmailConfigurer<P> extends And<P>, Alternative<SmtpEmailConfigurer<P>> {
  host(smtpHost: string): SmtpEmailConfigurer<P>;
  port(smtpPort: number): SmtpEmailConfigurer<P>;
  username(smtpUsername: string): SmtpEmailConfigurer<P>;
  password(smtpPassword: string): SmtpEmailConfigurer<P>;
  ssl(enableSsl: boolean): SmtpEmailConfigurer<P>;
  starttls(enableTls: boolean): SmtpEmailConfigurer<P>;
}

export interface OvhEmailConfigurer<P> extends And<P>, Alternative<OvhEmailConfigurer<P>> {
  url(ovhUrl: string): OvhEmailConfigurer<P>;
  username(ovhUsername: string): OvhEmailConfigurer<P>;
  password(ovhPassword: string): OvhEmailConfigurer<P>;
}
export interface MailjetEmailConfigurer<P> extends And<P>, Alternative<MailjetEmailConfigurer<P>> {
  url(mailjetUrl: string): MailjetEmailConfigurer<P>;
  apiKeyPublic(mailjetApiKeyPublic: string): MailjetEmailConfigurer<P>;
  apiKeyPrivate(mailjetApiKeyPrivate: string): MailjetEmailConfigurer<P>;
  httpClient(axios: AxiosInstance): MailjetEmailConfigurer<P>;
}

export interface TemplateConfigurer<P, S extends TemplateConfigurer<P, S>> extends And<P> {
  template(location: Location): S;
  template(func: (variables: Variables) => string): S;
}

export interface TextTemplateConfigurer<P> extends TemplateConfigurer<P, TextTemplateConfigurer<P>> {}

export interface EmailTemplateConfigurer<P> extends TemplateConfigurer<P, EmailTemplateConfigurer<P>> {
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
  annotations(): AnnotationsConfigurer<ScanConfigurer<P>>;
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

  storage(tokenStorageClass: Type<TokenRepository>): TokenManagerConfigurer<P>;
  storage(tokenStorageInstance: TokenRepository): TokenManagerConfigurer<P>;
}

//==================== account registration ====================//

export interface RegistrationConfigurer extends And<StandardUserWorkflowConfigurer> {
  account(): AccountConfigurer;

  welcome(): RegistrationWelcomeConfigurer;

  confirmation(): RegistrationConfirmationConfigurer;
}

export interface AccountConfigurer extends And<RegistrationConfigurer> {
  uuid(): UuidConfigurer<AccountConfigurer>;

  initialStatus(): AccountStatusConfigurer;

  fields(): RegistrationFieldsConfigurer;

  storage(userStorageClass: Type<UserRepository>): AccountConfigurer;
  storage(userStorageInstance: UserRepository): AccountConfigurer;
}

export interface RegistrationFieldsConfigurer extends FieldsConfigurer<RegistrationConfigurer> {}

export interface AccountStatusConfigurer extends And<AccountConfigurer> {
  value(accountStatus: AccountStatus): AccountStatusConfigurer;

  provider(accountStatusProvider: AccountStatusProvider): AccountStatusConfigurer;
}

export interface RegistrationWelcomeConfigurer extends And<RegistrationConfigurer> {
  email(): EmailConfigurer<RegistrationWelcomeConfigurer>;

  sms(): SmsConfigurer<RegistrationWelcomeConfigurer>;
}

export interface RegistrationConfirmationConfigurer extends And<RegistrationConfigurer> {
  url(urlProvider: ConfirmationUrlProvider): RegistrationConfirmationConfigurer;
  url(func: (context: AccountConfirmationContext) => Promise<string>): RegistrationConfirmationConfigurer;
  url(confirmationUrl: string): RegistrationConfirmationConfigurer;

  email(): EmailConfigurer<RegistrationConfirmationConfigurer>;

  sms(): SmsConfigurer<RegistrationConfirmationConfigurer>;

  redirection(): SuccessFailureRedirectionConfigurer<RegistrationConfirmationConfigurer>;

  token(): TokenManagerConfigurer<RegistrationConfirmationConfigurer>;
}
//==================== account password reset ====================//

export interface LostPasswordConfigurer extends And<StandardUserWorkflowConfigurer> {
  reset(): ResetPasswordConfigurer;
}

export interface ResetPasswordConfigurer extends And<LostPasswordConfigurer> {
  ask(): AskResetPasswordConfigurer;
  confirm(): ConfirmResetPasswordConfigurer;
  token(): TokenManagerConfigurer<ResetPasswordConfigurer>;
}

export interface AskResetPasswordConfigurer extends And<ResetPasswordConfigurer> {
  email(): EmailConfigurer<AskResetPasswordConfigurer>;
  url(urlProvider: ResetPasswordUrlProvider): AskResetPasswordConfigurer;
  url(func: (context: ResetPasswordContext) => Promise<string>): AskResetPasswordConfigurer;
  url(askResetPasswordUrl: string): AskResetPasswordConfigurer;
}

export interface ConfirmResetPasswordConfigurer extends And<ResetPasswordConfigurer> {}

//==================== account authentication ====================//

export interface AuthenticationConfigurer extends And<StandardUserWorkflowConfigurer> {}

export interface LoginPasswordAuthenticationConfigurer {}
