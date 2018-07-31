import { ValidationManager } from '../api/Validation';
import {
  AccountCreationManager,
  Account,
  AccountCreationDetails,
  AccountCreationError
} from '../../standard-user-workflow/api';
import { ValidationError } from 'class-validator';

export class ValidationAccountCreationManager implements AccountCreationManager {
  constructor(private validator: ValidationManager, private delegate: AccountCreationManager) {}

  createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account | null> {
    return new Promise<Account | null>((resolve, reject) => {
      try {
        this.validator.validate(accountCreationDetails);
      } catch (error) {
        if (error instanceof ValidationError) {
          reject(new AccountCreationError('VALIDATION_FAILED', error));
        } else {
          reject(new AccountCreationError('UNKNOWN_ERROR', error));
        }
      }
      resolve(this.delegate.createAccount(accountCreationDetails));
    });
  }
}
