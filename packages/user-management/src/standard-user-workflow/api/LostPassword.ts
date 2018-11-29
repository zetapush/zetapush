import { Redirection } from './Redirection';
import { Variables, Token } from '../../common/api';
import { Account } from './Account';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { BaseError } from '@zetapush/common';

/**
 * Object that the user do send to reset his password.
 */
export interface AccountDetailsResetPassword {}

/**
 * From the email, the account of the user is retrieved and an email to
 * reset his password is sent.
 */
export interface LoginAccountDetailsResetPassword extends AccountDetailsResetPassword {
  login: string;
}

/**
 * Identicals passwords used when the user want to confirm
 * the reset of the password chosing a new couple of passwords
 */
export interface DetailsResetPassword {
  token: string;
  firstPassword: string;
  secondPassword: string;
}

/**
 * Manager to let the user ask to reset his password
 */
export interface AskResetPasswordManager {
  askResetPassword(accountDetailsResetPassword: AccountDetailsResetPassword): Promise<PendingAskResetPassword>;
}
export abstract class AskResetPasswordManagerInjectable implements AskResetPasswordManager {
  abstract askResetPassword(accountDetailsResetPassword: AccountDetailsResetPassword): Promise<PendingAskResetPassword>;
}

/**
 * Manager to let the user choose his new password
 */
export interface ConfirmResetPasswordManager {
  confirmResetPassword(detailsResetPassword: DetailsResetPassword): Promise<Account>;
}
export abstract class ConfirmResetPasswordManagerInjectable implements ConfirmResetPasswordManager {
  abstract confirmResetPassword(detailsResetPassword: DetailsResetPassword): Promise<Account>;
}

export interface ResetPasswordContext extends Variables {
  readonly account: Account;
  readonly token: Token;
  readonly properties: ConfigurationProperties;
  readonly zetapushContext: ZetaPushContext;
  readonly askResetPasswordUrl: string;
}

export interface PendingAskResetPassword {
  account: Account;
  token: string;
}

export interface ResetPasswordUrlProvider {
  getUrl(context: ResetPasswordContext): Promise<string>;
}
export abstract class ResetPasswordUrlProviderInjectable implements ResetPasswordUrlProvider {
  abstract getUrl(context: ResetPasswordContext): Promise<string>;
}

export class AskResetPasswordError extends BaseError {
  constructor(message: string, public details: AccountDetailsResetPassword, public cause?: Error) {
    super(message);
  }
}

export class PasswordAreNotIdenticalsError extends BaseError {
  constructor(message: string, public details: DetailsResetPassword, public cause?: Error) {
    super(message);
  }
}

export class ResetPasswordValidationTokenError extends BaseError {
  constructor(message: string, public details: DetailsResetPassword, public cause?: Error) {
    super(message);
  }
}
export class ResetPasswordChangerPasswordError extends BaseError {
  constructor(message: string, public details: DetailsResetPassword, public cause?: Error) {
    super(message);
  }
}

export class ChangerPasswordError extends BaseError {
  constructor(message: string, public accountId: string, public cause?: Error) {
    super(message);
  }
}
