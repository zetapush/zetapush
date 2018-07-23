import { ValidationManager } from '../api/Validation';
import {
  AccountCreationManager,
  AccountCreationDetails,
  Account,
  AccountCreationError
} from '../../user-management/standard-user-workflow/api';
import { ValidationError } from 'class-validator';

export class ValidationAccountCreationManager implements AccountCreationManager {
  constructor(private validator: ValidationManager, private delegate: AccountCreationManager) {}

  createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account> {
    try {
      this.validator.validate(accountCreationDetails);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new AccountCreationError('VALIDATION_FAILED', error);
      } else {
        throw new AccountCreationError('UNKNOWN_ERROR', error);
      }
    }
    return this.delegate.createAccount(accountCreationDetails);
  }
}
