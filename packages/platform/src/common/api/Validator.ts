import { ValidationMetadata } from '../core/ScanAnnotations';
import { getFromContainer, Validator, ValidationSchema, validate } from 'class-validator';
import { AccountCreationValidationError } from '../../user-management/standard-user-workflow/api/exceptions';
import { ConstraintValidationError, ValidationErrorContext } from './exception';

export interface ValidationManager {
  validate(object: Object, validationSchemas: ValidationSchema): void;
}

export class ValidationAccountCreationManager implements ValidationManager {
  async validate(object: Object, validationSchema: ValidationSchema) {
    const errors = await validate(validationSchema.name, object);

    if (errors.length > 0) {
      const validationErrorContext: Array<ValidationErrorContext> = [];

      errors.forEach((error) => {
        const constraintsErrors: Array<ConstraintValidationError> = [];

        Object.keys(error.constraints).forEach((property) => {
          constraintsErrors.push({
            constraintName: property,
            errorMessage: error.constraints[property]
          });
        });

        validationErrorContext.push({
          watchedObject: object,
          targetClass: error.target ? error.target.constructor : 'unknown',
          targetProperty: error.property,
          constraints: constraintsErrors
        });
      });

      throw new AccountCreationValidationError('ACCOUNT_CREATION_VALIDATION_ERROR', validationErrorContext);
    }
  }
}
