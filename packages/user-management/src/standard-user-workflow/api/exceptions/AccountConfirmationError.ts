export abstract class AccountConfirmationError extends Error {}

export class FailedRetrieveUserAccount extends AccountConfirmationError {
  constructor(message: string, accountId: string) {
    super(message);
  }
}
