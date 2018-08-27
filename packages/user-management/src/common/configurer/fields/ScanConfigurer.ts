import { Type } from '@zetapush/platform-legacy';
import { AbstractParent } from '../AbstractParent';
import { ScanConfigurer, AnnotationsConfigurer } from '../grammar';
import { ValidationManager, ValidationManagerInjectable } from '../../api';
import { DefaultAnnotationsConfigurer } from './AnnotationsConfigurer';
import { NoOpValidationManager } from '../../core';
import { Provider } from '@zetapush/core';
import { Configurer, SimpleProviderRegistry } from '../Configurer';

/**
 * Default scan configurer implementation
 * The build return a ValidationManager
 */
export class DefaultScanConfigurer<P> extends AbstractParent<P> implements Configurer, ScanConfigurer<P> {
  private annotationsBuilder: any;

  constructor(parent: P, private model: Type<any>) {
    super(parent);
  }

  annotations(): AnnotationsConfigurer<ScanConfigurer<P>> {
    this.annotationsBuilder = new DefaultAnnotationsConfigurer(this, this.model);
    return this.annotationsBuilder;
  }

  // TODO: More flexible
  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    if (!this.annotationsBuilder) {
      providerRegistry.registerClass(ValidationManagerInjectable, NoOpValidationManager);
    } else {
      await providerRegistry.registerConfigurer(this.annotationsBuilder);
    }
    return providerRegistry.getProviders();
  }
}
