import {
  getFromContainer,
  MetadataStorage,
  ValidationSchema,
  registerSchema,
} from 'class-validator';

export interface ValidationMetadata {
  groups: Array<any>;
  always: boolean;
  each: boolean;
  type: string;
  target: string | Function;
  propertyName: string;
  constraints: Array<any>;
  constraintCls: any;
  validationTypeOptions: any;
}

/**
 * Scan annotation to generate ValidationMetadata object
 */
export class ScanAnnotations {
  scan(object: Function): ValidationSchema {
    const nameSchema = object.name + '_' + new Date().getTime();
    const metadataStorage = getFromContainer(MetadataStorage);
    const validationMetadata = metadataStorage.getTargetValidationMetadatas(
      object,
      '',
      undefined,
    );
    return convertValidationMetadataToValidationSchema(
      nameSchema,
      validationMetadata,
    );
  }
}

/**
 * Create the ValidationSchema about ValidationMetadata
 * @param name name of the schema
 * @param validationMetadatas Input validation metadata
 */
export function convertValidationMetadataToValidationSchema(
  name: string,
  validationMetadatas: Array<ValidationMetadata>,
): ValidationSchema {
  const validationSchema: ValidationSchema = {
    name,
    properties: {},
  };

  validationMetadatas.forEach((validationMetadata) => {
    if (
      !validationSchema.properties.hasOwnProperty(
        validationMetadata.propertyName,
      )
    ) {
      validationSchema.properties[validationMetadata.propertyName] = [
        {
          type: validationMetadata.type,
          constraints: validationMetadata.constraints,
          each: validationMetadata.each,
          groups: validationMetadata.groups,
          always: validationMetadata.always,
        },
      ];
    } else {
      validationSchema.properties[validationMetadata.propertyName].push({
        type: validationMetadata.type,
        constraints: validationMetadata.constraints,
        each: validationMetadata.each,
        groups: validationMetadata.groups,
        always: validationMetadata.always,
      });
    }
  });

  // Register the Schema
  registerSchema(validationSchema);

  return validationSchema;
}
