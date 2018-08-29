import { BaseError } from '@zetapush/common';

export class ValidationError extends BaseError {
  constructor(message: string, public context: Array<ValidationErrorContext>) {
    super(message);
  }
}

export interface ValidationErrorContext {
  watchedObject: Object;
  targetClass: Function | string;
  constraints: Array<ConstraintValidationError>;
  targetProperty: string;
}

export interface ConstraintValidationError {
  constraintName: string;
  errorMessage: string;
}
