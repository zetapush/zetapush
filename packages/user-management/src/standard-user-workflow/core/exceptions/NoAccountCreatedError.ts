import { AccountCreationError, AccountCreationDetails } from '../../api';

export class NoAccountCreatedError extends AccountCreationError {
  constructor(message: string, details: AccountCreationDetails) {
    super(message, details);
  }
}
