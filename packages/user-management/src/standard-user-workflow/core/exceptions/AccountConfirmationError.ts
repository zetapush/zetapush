import { Token } from '../../../common/api';
import { Account } from '../../api';
import { BaseError } from '../../../common/api/exception/BaseError';

export abstract class AccountConfirmationError extends BaseError {
  constructor(message: string, public account: Partial<Account>, public cause?: Error) {
    super(message);
  }
}

export class UpdateAccountStatusError extends AccountConfirmationError {
  constructor(message: string, account: Partial<Account>, cause: Error) {
    super(message, account, cause);
  }
}

export class NoAccountAssociatedToTokenError extends AccountConfirmationError {
  constructor(message: string, account: Partial<Account>, public token: Token) {
    super(message, account);
  }
}

export class TokenValidationError extends AccountConfirmationError {
  constructor(message: string, account: Partial<Account>, public token: Token, cause: Error) {
    super(message, account, cause);
  }
}

export class SendTokenError extends AccountConfirmationError {
  constructor(message: string, account: Partial<Account>, cause: Error) {
    super(message, account, cause);
  }
}
