import { BaseError } from '@zetapush/common';

export abstract class AccountAuthenticationError extends BaseError {}

export class FailedGetUserProfileError extends AccountAuthenticationError {
  constructor(message: string, accountId: string) {
    super(message);
  }
}

export class RequiredAccountIdError extends AccountAuthenticationError {
  constructor(message: string) {
    super(message);
  }
}
