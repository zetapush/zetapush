import { TokenGeneratorConfigurer, Configurer } from '../grammar';
import { TokenGenerator, Uuid } from '../../api';
import { AbstractParent } from '../AbstractParent';
import { Injector } from '../../../../../common/node_modules/injection-js';
import { MissingMandatoryConfigurationError, InstantiationError } from '../ConfigurerError';
import { FuncCallUuidGenerator } from '../../core/uuid/FuncCallUuidGenerator';
import { Type } from '../../../../../platform/lib';
import { FuncCallTokenGenerator } from '../../core/token/FuncCallTokenGenerator';
import { ExpirableTokenGenerator } from '../../core';

export class TokenGeneratorConfigurerImpl<P> extends AbstractParent<P>
  implements TokenGeneratorConfigurer<P>, Configurer<TokenGenerator> {
  private generatorInstance?: TokenGenerator;
  private generatorClass?: Type<TokenGenerator>;
  private generatorFunc?: () => Promise<Uuid>;
  private validityDuration?: number;

  constructor(parentConfigurer: P, private injector: Injector) {
    super(parentConfigurer);
  }

  validity(duration: number): TokenGeneratorConfigurer<P> {
    this.validityDuration = duration;
    return this;
  }

  generator(func: () => Promise<Uuid>): TokenGeneratorConfigurer<P>;
  generator(instance: TokenGenerator): TokenGeneratorConfigurer<P>;
  generator(generatorClass: Type<TokenGenerator>): TokenGeneratorConfigurer<P>;
  generator(instanceFuncOrClass: any): TokenGeneratorConfigurer<P> {
    if ((<TokenGenerator>instanceFuncOrClass).generate) {
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

  async build(): Promise<TokenGenerator> {
    let generator;
    if (this.generatorInstance) {
      generator = this.generatorInstance;
    }
    if (this.generatorFunc) {
      generator = new FuncCallTokenGenerator(this.generatorFunc);
    }
    if (this.generatorClass) {
      generator = this.instiantiate(this.generatorClass);
    }
    if (!generator) {
      throw new MissingMandatoryConfigurationError('No configuration provided for token generation');
    }
    if (this.validityDuration) {
      generator = new ExpirableTokenGenerator(generator, this.validityDuration);
    }
    return generator;
  }

  private instiantiate(generatorClass: Type<TokenGenerator>): TokenGenerator {
    try {
      return this.injector.get(generatorClass, null) || new generatorClass();
    } catch (e) {
      throw new InstantiationError('Failed to instantiate TokenGenerator', e);
    }
  }
}
