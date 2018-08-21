import { ValidationError, ValidationErrorContext } from '../../../common/api';

export class AccountCreationValidationError extends ValidationError {
  context: Array<ValidationErrorContext>;

  constructor(message: string, context: Array<ValidationErrorContext>) {
    super(message, context);
    this.context = context;
  }
}
