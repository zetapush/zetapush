import { Injector, Type } from '@zetapush/core';

import { UuidConfigurer, Configurer } from './grammar';
import { UuidGenerator, Uuid } from '../api';
import { AbstractParent } from './AbstractParent';
import { MissingMandatoryConfigurationError, InstantiationError } from './ConfigurerError';
import { FuncCallUuidGenerator } from '../core/FuncCallUuidGenerator';

export class UuidGeneratorConfigurerImpl<P> extends AbstractParent<P>
  implements UuidConfigurer<P>, Configurer<UuidGenerator> {
  private generatorInstance?: UuidGenerator;
  private generatorClass?: Type<UuidGenerator>;
  private generatorFunc?: () => Promise<Uuid>;

  constructor(parentConfigurer: P, private injector: Injector) {
    super(parentConfigurer);
  }

  generator(func: () => Promise<Uuid>): UuidConfigurer<P>;
  generator(instance: UuidGenerator): UuidConfigurer<P>;
  generator(generatorClass: Type<UuidGenerator>): UuidConfigurer<P>;
  generator(instanceFuncOrClass: any): UuidConfigurer<P> {
    if (instanceFuncOrClass instanceof UuidGenerator) {
      this.generatorInstance = instanceFuncOrClass;
    } else if (instanceFuncOrClass.constructor) {
      this.generatorClass = instanceFuncOrClass;
    } else if (typeof instanceFuncOrClass === 'function') {
      this.generatorFunc = <() => Promise<Uuid>>instanceFuncOrClass;
    } else {
      this.generatorClass = instanceFuncOrClass;
    }
    return this;
  }

  async build(): Promise<UuidGenerator> {
    if (this.generatorInstance) {
      return this.generatorInstance;
    }
    if (this.generatorFunc) {
      return new FuncCallUuidGenerator(this.generatorFunc);
    }
    if (this.generatorClass) {
      return this.instiantiate(this.generatorClass);
    }
    throw new MissingMandatoryConfigurationError('No configuration provided for UUID generation');
  }

  private instiantiate(generatorClass: Type<UuidGenerator>): UuidGenerator {
    try {
      return this.injector.get(generatorClass, null) || new generatorClass();
    } catch (e) {
      throw new InstantiationError('Failed to instantiate UuidGenerator', e);
    }
  }
}
