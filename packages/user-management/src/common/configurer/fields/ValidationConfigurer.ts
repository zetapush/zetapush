import * as ClassValidator from 'class-validator';
import { Type } from '@zetapush/platform-legacy';
import { AbstractParent } from '../AbstractParent';
import { ValidationConfigurer } from '../grammar';
import { ValidationManager, ValidationMetadata, ValidationManagerInjectable } from '../../api';
import { ClassValidatorManager } from '../../core';
import { Configurer, SimpleProviderRegistry } from '../Configurer';
import { Provider } from '@zetapush/core';

/**
 * ValidationConfigurer implementation using the "class-validator" library
 */
export class ClassValidatorValidationConfigurer<P> extends AbstractParent<P>
  implements Configurer, ValidationConfigurer<P> {
  constructor(parent: P, private model: Type<any>) {
    super(parent);
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerFactory(
      ValidationManagerInjectable,
      [],
      () => new ClassValidatorManager(generateValidationSchemaFromObject(this.model))
    );
    return providerRegistry.getProviders();
  }
}

export function generateValidationSchemaFromObject(object: Function): ClassValidator.ValidationSchema {
  const metadataStorage = ClassValidator.getFromContainer(ClassValidator.MetadataStorage);
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
): ClassValidator.ValidationSchema {
  const validationSchema: ClassValidator.ValidationSchema = {
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
  ClassValidator.registerSchema(validationSchema);

  return validationSchema;
}
