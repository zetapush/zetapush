import { AbstractParent } from '../AbstractParent';
import { ScanConfigurer, AnnotationsConfigurer, FieldsConfigurer, FieldConfigurer } from '../grammar';
import { Type } from '@zetapush/platform-legacy';
import { ValidationManager, ValidationManagerInjectable } from '../../api';
import { DefaultScanConfigurer } from './ScanConfigurer';
import { NoOpValidationManager } from '../../core';
import { Configurer, SimpleProviderRegistry } from '../Configurer';
import { Provider } from '@zetapush/core';

/**
 * Default fields configurer implémentation
 * The build return a ValidationManager (without any validation process)
 */
export class DefaultFieldsConfigurer<P> extends AbstractParent<P> implements Configurer, FieldsConfigurer<P> {
  private scanBuilder: any;

  constructor(parent: P) {
    super(parent);
  }

  scan(model: Type<any>): ScanConfigurer<FieldsConfigurer<P>> {
    if (!this.scanBuilder) {
      this.scanBuilder = new DefaultScanConfigurer(this, model);
    }
    return this.scanBuilder();
  }

  field(name: string) /*: FieldConfigurer<FieldsConfigurer<P>>*/ {
    // TODO: To implements
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    if (!this.scanBuilder) {
      providerRegistry.registerClass(ValidationManagerInjectable, NoOpValidationManager);
    } else {
      await providerRegistry.registerConfigurer(this.scanBuilder);
    }
    return providerRegistry.getProviders();
  }
}
