import { TokenManagerConfigurer } from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { Type, Provider } from '@zetapush/core';
import { MissingMandatoryConfigurationError, InstantiationError } from '../ConfigurerError';
import { FuncCallTokenGenerator } from '../../core/token/FuncCallTokenGenerator';
import { ExpirableTokenGenerator } from '../../core';
import { GdaTokenRepository } from '../../core/token/GdaTokenRepository';
import { TokenManagerImpl } from '../../core/token/TokenManagerImpl';
import {
  Uuid,
  TokenGenerator,
  TokenManager,
  TokenRepository,
  Token,
  TokenRepositoryInjectable,
  TokenGeneratorInjectable,
  TokenManagerInjectable,
  IllegalArgumentValueError,
  IllegalStateError
} from '../../api';
import { InstanceHelper, isInstance, isClass } from '../InstanceHelper';
import { Configurer, SimpleProviderRegistry } from '../Configurer';

export class TokenManagerConfigurerImpl<P> extends AbstractParent<P> implements TokenManagerConfigurer<P>, Configurer {
  private generatorInstanceHelper: InstanceHelper<TokenGenerator, Token>;
  private validityDuration?: number;
  private tokenStorageHelper: InstanceHelper<TokenRepository, any>;

  constructor(parentConfigurer: P) {
    super(parentConfigurer);
    this.generatorInstanceHelper = new InstanceHelper(TokenGeneratorInjectable, FuncCallTokenGenerator);
    this.tokenStorageHelper = new InstanceHelper(
      TokenRepositoryInjectable,
      null,
      (tokenStorageInstanceOrClass) =>
        new IllegalArgumentValueError(
          `Can't use provided storage as a TokenRepository`,
          'tokenStorageInstanceOrClass',
          tokenStorageInstanceOrClass
        )
    );
  }

  storage(tokenStorageClass: Type<TokenRepository>): TokenManagerConfigurer<P>;
  storage(tokenStorageInstance: TokenRepository): TokenManagerConfigurer<P>;
  storage(tokenStorageInstanceOrClass: any): TokenManagerConfigurer<P> {
    this.tokenStorageHelper.register(tokenStorageInstanceOrClass);
    return this;
  }

  validity(durationInMillis: number): TokenManagerConfigurer<P> {
    this.validityDuration = durationInMillis;
    return this;
  }

  generator(func: () => Promise<Uuid>): TokenManagerConfigurer<P>;
  generator(instance: TokenGenerator): TokenManagerConfigurer<P>;
  generator(generatorClass: Type<TokenGenerator>): TokenManagerConfigurer<P>;
  generator(instanceFuncOrClass: any): TokenManagerConfigurer<P> {
    this.generatorInstanceHelper.register(instanceFuncOrClass);
    return this;
  }

  async getProviders(): Promise<Provider[]> {
    const providerRegistry = new SimpleProviderRegistry();

    providerRegistry.registerProvider(this.tokenStorageHelper.getProvider());
    providerRegistry.registerProvider(this.generatorInstanceHelper.getProvider());

    if (this.validityDuration) {
      providerRegistry.registerDecorator<TokenGenerator>(
        this.generatorInstanceHelper.getProvider() ||
          new MissingMandatoryConfigurationError('No configuration provided for token generation'),
        [],
        (generator: TokenGenerator) => new ExpirableTokenGenerator(generator, this.validityDuration!)
      );
    }

    providerRegistry.registerFactory(
      TokenManagerInjectable,
      [TokenGeneratorInjectable, TokenRepositoryInjectable],
      (generator: TokenGenerator, repository: TokenRepository) => new TokenManagerImpl(generator, repository)
    );

    return providerRegistry.getProviders();
  }
}
