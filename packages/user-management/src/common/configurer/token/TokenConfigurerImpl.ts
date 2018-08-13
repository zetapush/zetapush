import { Configurer, TokenManagerConfigurer } from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { Injector } from 'injection-js';
import { MissingMandatoryConfigurationError, InstantiationError } from '../ConfigurerError';
import { FuncCallUuidGenerator } from '../../core/uuid/FuncCallUuidGenerator';
import { Type } from '@zetapush/platform-legacy';
import { FuncCallTokenGenerator } from '../../core/token/FuncCallTokenGenerator';
import { ExpirableTokenGenerator } from '../../core';
import { DefaultStorageTokenManager } from '../../core/token/DefaultStorageTokenManager';
import { TokenManagerImpl } from '../../core/token/TokenManagerImpl';
import { Uuid, TokenGenerator, TokenManager, TokenStorageManager } from '../../api';
import { Gda, GdaConfigurer } from '@zetapush/platform-legacy';

export class TokenManagerConfigurerImpl<P> extends AbstractParent<P>
  implements TokenManagerConfigurer<P>, Configurer<TokenManager> {
  private generatorInstance?: TokenGenerator;
  private generatorClass?: Type<TokenGenerator>;
  private generatorFunc?: () => Promise<Uuid>;
  private validityDuration?: number;
  private tokenStorageManager?: TokenStorageManager;

  constructor(parentConfigurer: P, private injector: Injector) {
    super(parentConfigurer);
  }

  storage(tokenStorageManager?: TokenStorageManager): TokenManagerConfigurer<P> {
    this.tokenStorageManager = tokenStorageManager;
    return this;
  }

  validity(duration: number): TokenManagerConfigurer<P> {
    this.validityDuration = duration;
    return this;
  }

  generator(func: () => Promise<Uuid>): TokenManagerConfigurer<P>;
  generator(instance: TokenGenerator): TokenManagerConfigurer<P>;
  generator(generatorClass: Type<TokenGenerator>): TokenManagerConfigurer<P>;
  generator(instanceFuncOrClass: any): TokenManagerConfigurer<P> {
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

  async build(): Promise<TokenManager> {
    let generator;
    let storage;

    if (this.tokenStorageManager) {
      storage = this.tokenStorageManager;
    } else {
      storage = this.createDefaultStorage();
    }

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

    return new TokenManagerImpl(generator, storage);
  }

  private createDefaultStorage() {
    try {
      const gda = this.injector.get(Gda);
      const gdaConfigurer = this.injector.get(GdaConfigurer);
      return new DefaultStorageTokenManager(gda, gdaConfigurer);
    } catch (e) {
      throw new InstantiationError('Failed to instantiate DefaultStorageTokenManager', e);
    }
  }

  private instiantiate(generatorClass: Type<TokenGenerator>): TokenGenerator {
    try {
      return this.injector.get(generatorClass, null) || new generatorClass();
    } catch (e) {
      throw new InstantiationError('Failed to instantiate TokenGenerator', e);
    }
  }
}
