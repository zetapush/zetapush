export abstract class AccountAuthenticationError extends Error {}

export class FailedGetUserProfileError extends AccountAuthenticationError {
  constructor(message: string, accountId: string) {
    super(message);
  }
}
