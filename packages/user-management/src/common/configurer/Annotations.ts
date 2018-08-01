import { AbstractParent } from './AbstractParent';
import { ValidationManager } from '../api/Validation';
import { ClassValidatorManager, NoOpValidationManager } from '../core/Validation';
import { generateValidationSchemaFromObject, ClassValidatorValidationConfigurer } from './Validation';
import { Configurer, ValidationConfigurer, AnnotationsConfigurer } from './grammar';
import { Type } from '@zetapush/platform';

/**
 * Default annotations configurer implementation
 * The build return a ValidationManager
 */
export class DefaultAnnotationsConfigurer<P> extends AbstractParent<P>
  implements Configurer<ValidationManager>, AnnotationsConfigurer<P> {
  private validationBuilder!: ValidationConfigurer<AnnotationsConfigurer<P>>;

  constructor(private parent: P, private model: Type<any>) {
    super(parent);
  }

  validation(): ValidationConfigurer<AnnotationsConfigurer<P>> {
    this.validationBuilder = new ClassValidatorValidationConfigurer(this, this.model);
    return this.validationBuilder;
  }

  async build(): Promise<ValidationManager> {
    if (!this.validationBuilder) {
      return new NoOpValidationManager();
    } else {
      return new ClassValidatorManager(generateValidationSchemaFromObject(this.model));
    }
  }
}
