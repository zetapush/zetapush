import { AbstractParent } from '../AbstractParent';
import { UuidGenerator, Uuid, UuidGeneratorInjectable } from '../../api';
import { UuidConfigurer } from '../grammar';
import { FuncCallUuidGenerator } from '../../core';
import { MissingMandatoryConfigurationError, InstantiationError } from '../ConfigurerError';
import { Type } from '@zetapush/platform-legacy';
import { InstanceHelper } from '../InstanceHelper';
import { Provider } from '@zetapush/core';
import { SimpleProviderRegistry, Configurer } from '../Configurer';

export class UuidGeneratorConfigurerImpl<P> extends AbstractParent<P> implements UuidConfigurer<P>, Configurer {
  private generatorInstanceHelper: InstanceHelper<UuidGenerator, Uuid>;

  constructor(parentConfigurer: P) {
    super(parentConfigurer);
    this.generatorInstanceHelper = new InstanceHelper(UuidGeneratorInjectable, FuncCallUuidGenerator);
  }

  generator(func: () => Promise<Uuid>): UuidConfigurer<P>;
  generator(instance: UuidGenerator): UuidConfigurer<P>;
  generator(generatorClass: Type<UuidGenerator>): UuidConfigurer<P>;
  generator(instanceFuncOrClass: any): UuidConfigurer<P> {
    this.generatorInstanceHelper.register(instanceFuncOrClass);
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();
    providerRegistry.registerProvider(this.generatorInstanceHelper.getProvider());
    return providerRegistry.getProviders();
  }
}
