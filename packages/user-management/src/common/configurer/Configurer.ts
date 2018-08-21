import { Provider, Type, ValueProvider, InjectionToken, Injector, ReflectiveInjector } from '@zetapush/core';
import { IllegalStateError, IllegalArgumentValueError } from '../api';

export interface Configurer {
  getProviders(): Promise<Provider[]>;
}

export type Class<T> = Type<T> | Function;
export interface Decorator<T> {
  providerOrDependencyToDecorate: Provider | T;
  dependencies: any[];
  decorate: (decoree: T, ...dependencies: any[]) => any;
}

export class Scope {
  constructor(private name: string, private parent?: Scope) {}

  push(name: string): Scope {
    return new Scope(name, this);
  }

  getKey(): string {
    return `${this.parent ? this.parent.getKey() + '.' : ''}${this.name}`;
  }
}

const scopedTokens = new Map<string, InjectionToken<any>>();

const extractName = (dep: Class<any> | Function | any): string => {
  if (dep.prototype && dep.prototype.constructor) {
    return dep.prototype.constructor.name;
  }
  if (dep.name) {
    return dep.name;
  }
  return dep.toString();
};

export const scoped = <T>(scope: Scope, provide: Class<T>): InjectionToken<T> => {
  if (!provide) {
    throw new IllegalArgumentValueError(`You can't create a scoped dependency without its type`, 'provide', provide);
  }
  const key = `${scope.getKey()}<${extractName(provide)}>`;
  const token = new InjectionToken<T>(key);
  scopedTokens.set(key, token);
  return token;
};

export const scopedDependency = <T>(name: string, dep: Class<T>): InjectionToken<T> => {
  if (!dep) {
    throw new IllegalArgumentValueError(`You can't ask for a scoped dependency without its type`, 'dep', dep);
  }
  const key = `${name}<${extractName(dep)}>`;
  const token = scopedTokens.get(key);
  if (!token) {
    throw new IllegalStateError(`No token registered for scope ${name}. Do you have called scoped() ?`);
  }
  return token;
};

export interface ProviderRegistry {
  registerConfigurer(...configurer: Array<Configurer | null | undefined>): Promise<void>;

  registerProvider(...provider: Array<Provider | null | undefined>): void;

  registerFactory<T>(
    provide: Class<T> | InjectionToken<T>,
    dependencies: any[],
    factory: (...dependencies: any[]) => T
  ): void;

  registerDecorator<T>(
    providerOrDependencyToDecorate: Provider | T | Error | null,
    dependencies: any[],
    decorate: (decoree: T, ...dependencies: any[]) => any
  ): void;

  registerInstance<T>(provide: Class<T> | InjectionToken<T>, instance: T): void;

  registerClass<T, C extends T>(provide: Class<T> | InjectionToken<T>, clazz?: Class<C>): void;

  getProviders(): Provider[];
}

export class SimpleProviderRegistry implements ProviderRegistry {
  private providers: Provider[] = [];
  private decorators: Decorator<any>[] = [];
  static counter = 0;

  async registerConfigurer(...configurer: Array<Configurer | null | undefined>): Promise<void> {
    if (!configurer) {
      return;
    }
    for (let c of configurer) {
      if (c) {
        this.addAll(await c.getProviders());
      }
    }
  }

  registerProvider(...provider: Array<Provider | null | undefined>): void {
    this.addAll(provider);
  }

  registerFactory<T>(
    provide: Class<T> | InjectionToken<T>,
    dependencies: any[],
    factory: (...dependencies: any[]) => T
  ): void {
    if (!provide) {
      throw new IllegalArgumentValueError(
        `You can't register a factory with null or undefined provide`,
        'provide',
        provide
      );
    }
    this.providers.push({
      provide,
      useFactory: factory,
      deps: dependencies
    });
  }

  registerDecorator<T>(
    providerOrDependencyToDecorate: Provider | T | Error | null,
    dependencies: any[],
    decorate: (decoree: T, ...dependencies: any[]) => any
  ): void {
    if (!providerOrDependencyToDecorate) {
      throw new IllegalStateError(`Can't decorate a 'null' provider`);
    }
    if (providerOrDependencyToDecorate instanceof Error) {
      throw providerOrDependencyToDecorate;
    }
    this.decorators.push({
      providerOrDependencyToDecorate,
      dependencies,
      decorate
    });
  }

  registerInstance<T>(provide: Class<T> | InjectionToken<T>, instance: T): void {
    if (!provide) {
      throw new IllegalArgumentValueError(
        `You can't register an instance with null or undefined provide`,
        'provide',
        provide
      );
    }
    this.providers.push({
      provide,
      useValue: instance
    });
  }

  registerClass<T, C extends T>(provide: Class<T> | InjectionToken<T>, clazz?: Class<C>): void {
    if (!provide) {
      throw new IllegalArgumentValueError(
        `You can't register a class with null or undefined provide`,
        'provide',
        provide
      );
    }
    this.providers.push({
      provide,
      useClass: <Type<any>>(clazz || provide)
    });
  }

  getProviders(): Provider[] {
    this.applyDecorators();
    return this.providers;
  }

  private applyDecorators() {
    for (let decorator of this.decorators) {
      this.applyDecorator(decorator);
    }
  }

  private applyDecorator<T>(decorator: Decorator<T>) {
    const { providerOrDependencyToDecorate, dependencies, decorate } = decorator;
    // TODO: handle TypeProvider correctly
    const provide = (<any>providerOrDependencyToDecorate).provide;
    const provideOrClass = provide || providerOrDependencyToDecorate;
    const decoreeToken = new InjectionToken<T>(
      `decorated-${extractName(provideOrClass)}-${++SimpleProviderRegistry.counter}`
    );

    // search into already registered providers to update them
    // already registered providers now provide the decorated class (marked by decoreeToken)
    for (let provider of this.providers) {
      if ((<any>provider).provide === provideOrClass) {
        (<any>provider).provide = decoreeToken;
      }
    }
    // update the original provider to provide the decorated class (marked by decoreeToken)
    if (provide) {
      (<any>providerOrDependencyToDecorate).provide = decoreeToken;
    }

    // add new provider for decorator class (use original provide)
    this.providers.push({
      provide: provideOrClass,
      useFactory: decorate,
      deps: [decoreeToken, ...dependencies]
    });
  }

  private addAll(providers: Array<Provider | null | undefined> | null | undefined) {
    if (!providers) {
      return;
    }
    for (let provider of providers) {
      if (provider) {
        this.providers.push(provider);
      }
    }
  }
}
