import {
  ValidationError,
  ValidationErrorContext,
} from '../../../../common/api';

export class AccountCreationValidationError extends ValidationError {
  constructor(message: string, context: Array<ValidationErrorContext>) {
    super(message, context);
  }
}
