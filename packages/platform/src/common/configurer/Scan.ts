import { AbstractParent } from './AbstractParent';
import { Configurer, AnnotationsConfigurer, ScanConfigurer } from './grammar';
import { ValidationManager } from '../api/Validation';
import { Type } from '../../Metadata/Options';
import { DefaultAnnotationsConfigurer } from './Annotations';
import { ClassValidatorManager, NoOpValidationManager } from '../core/Validation';
import { generateValidationSchemaFromObject } from './Validation';

/**
 * Default scan configurer implementation
 * The build return a ValidationManager
 */
export class DefaultScanConfigurer<P> extends AbstractParent<P>
  implements Configurer<ValidationManager>, ScanConfigurer<P> {
  private annotationsBuilder: any;

  constructor(private parent: P, private model: Type<any>) {
    super(parent);
  }

  annotations(): AnnotationsConfigurer<ScanConfigurer<P>> {
    this.annotationsBuilder = new DefaultAnnotationsConfigurer(this, this.model);
    return this.annotationsBuilder;
  }

  // TODO: More flexible
  async build(): Promise<ValidationManager> {
    if (!this.annotationsBuilder) {
      return new NoOpValidationManager();
    } else {
      return this.annotationsBuilder.build();
    }
  }
}
