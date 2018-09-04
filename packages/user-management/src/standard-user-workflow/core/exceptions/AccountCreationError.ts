import { AccountCreationDetails, AccountCreationError } from '../../api';

export class LoginAlreadyUsedError extends AccountCreationError {
  constructor(message: string, details: AccountCreationDetails, public login: string) {
    super(message, details);
  }
}
