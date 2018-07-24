export class ValidationError extends Error {
  constructor(message: string, context: Array<ValidationErrorContext>) {
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
