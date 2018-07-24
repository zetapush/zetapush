import { ValidationManager } from '../api/Validation';
import { ValidationSchema, validate } from 'class-validator';
import { ValidationErrorContext, ConstraintValidationError, ValidationError } from '../api';

/**
 * ValidationManager implementation with "class-validator" library
 */
export class ClassValidatorManager implements ValidationManager {
  constructor(private validationSchema: ValidationSchema) {}

  async validate(object: Object) {
    const errors = await validate(this.validationSchema.name, object);

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

      throw new ValidationError('VALIDATION_ERROR', validationErrorContext);
    }
  }
}

/**
 * ValidationManager implementation without any validation
 */
export class NoOpValidationManager implements ValidationManager {
  constructor(private validationSchema?: ValidationSchema) {}

  async validate(object?: Object) {
    // Do nothing because all is valid in this case
  }
}
