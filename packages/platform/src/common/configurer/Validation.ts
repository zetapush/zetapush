import { AbstractParent } from './AbstractParent';
import { Configurer, ValidationConfigurer } from './grammar';
import { ValidationManager, ValidationMetadata } from '../api/Validation';
import { Type } from '../../Metadata/Options';
import { ValidationSchema, getFromContainer, MetadataStorage, registerSchema } from 'class-validator';
import { ClassValidatorManager } from '../core/Validation';

/**
 * ValidationConfigurer implementation using the "class-validator" library
 */
export class ClassValidatorValidationConfigurer<P> extends AbstractParent<P>
  implements Configurer<ValidationManager>, ValidationConfigurer<P> {
  private validationManager: ValidationManager;

  constructor(parent: P, private model: Type<any>) {
    super(parent);
  }

  async build(): Promise<ValidationManager> {
    this.validationManager = new ClassValidatorManager(generateValidationSchemaFromObject(this.model));
    return this.validationManager;
  }
}

export function generateValidationSchemaFromObject(object: Function): ValidationSchema {
  const metadataStorage = getFromContainer(MetadataStorage);
  const validationMetadata = metadataStorage.getTargetValidationMetadatas(object, '', undefined);

  return convertValidationMetadataToValidationSchema(object, validationMetadata);
}

/**
 * Create the ValidationSchema about ValidationMetadata
 * @param name name of the schema
 * @param validationMetadatas Input validation metadata
 */
export function convertValidationMetadataToValidationSchema(
  object: Function,
  validationMetadatas: Array<ValidationMetadata>
): ValidationSchema {
  const validationSchema: ValidationSchema = {
    name: object.name + '_' + new Date().getTime(),
    properties: {}
  };

  validationMetadatas.forEach((validationMetadata) => {
    // Avoid double
    if (validationMetadata.target !== object) {
      return;
    }

    if (!validationSchema.properties.hasOwnProperty(validationMetadata.propertyName)) {
      validationSchema.properties[validationMetadata.propertyName] = [
        {
          type: validationMetadata.type,
          constraints: validationMetadata.constraints,
          each: validationMetadata.each,
          groups: validationMetadata.groups,
          always: validationMetadata.always
        }
      ];
    } else {
      validationSchema.properties[validationMetadata.propertyName].push({
        type: validationMetadata.type,
        constraints: validationMetadata.constraints,
        each: validationMetadata.each,
        groups: validationMetadata.groups,
        always: validationMetadata.always
      });
    }
  });

  // Register the Schema
  registerSchema(validationSchema);

  return validationSchema;
}
