import { AbstractParent } from '../AbstractParent';
import { ValidationManager, ValidationManagerInjectable } from '../../api/Validation';
import { ClassValidatorManager, NoOpValidationManager } from '../../core/validation/ValidationManager';
import { generateValidationSchemaFromObject, ClassValidatorValidationConfigurer } from './ValidationConfigurer';
import { ValidationConfigurer, AnnotationsConfigurer } from '../grammar';
import { Type } from '@zetapush/platform-legacy';
import { Configurer, SimpleProviderRegistry } from '../Configurer';
import { Provider } from '@zetapush/core';

/**
 * Default annotations configurer implementation
 * The build return a ValidationManager
 */
export class DefaultAnnotationsConfigurer<P> extends AbstractParent<P> implements Configurer, AnnotationsConfigurer<P> {
  private validationBuilder!: ValidationConfigurer<AnnotationsConfigurer<P>>;

  constructor(parent: P, private model: Type<any>) {
    super(parent);
  }

  validation(): ValidationConfigurer<AnnotationsConfigurer<P>> {
    this.validationBuilder = new ClassValidatorValidationConfigurer(this, this.model);
    return this.validationBuilder;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    if (!this.validationBuilder) {
      providerRegistry.registerClass(ValidationManagerInjectable, NoOpValidationManager);
    } else {
      providerRegistry.registerFactory(ValidationManagerInjectable, [], () => {
        return new ClassValidatorManager(generateValidationSchemaFromObject(this.model));
      });
    }
    return providerRegistry.getProviders();
  }
}
