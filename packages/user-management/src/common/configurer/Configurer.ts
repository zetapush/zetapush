import { Provider, Type, ValueProvider, InjectionToken, Injector, ReflectiveInjector } from '@zetapush/core';
import { IllegalStateError, IllegalArgumentValueError } from '../api';
import { MissingMandatoryConfigurationError, ConfigurationValidationError } from './ConfigurerError';

/**
 * An effective configurer must implement this interface.
 *
 * It provides a getProviders method that provides a list of dependencies
 * to instantiate a concrete class used by the workflow.
 */
export interface Configurer {
  getProviders(): Promise<Provider[]>;
}

export type Class<T> = Type<T> | Function;
export interface Decorator<T> {
  providerOrDependencyToDecorate: Provider | T;
  dependencies: any[];
  decorate: (decoree: T, ...dependencies: any[]) => any;
}

export interface Validation {
  validate(providers: Provider[]): Error | undefined | null;
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
  if (scopedTokens.has(key)) {
    return scopedTokens.get(key)!;
  }
  const token = new InjectionToken<T>(key);
  scopedTokens.set(key, token);
  return token;
};

export const scopedDependency = <T>(scope: string | Scope, dep: Class<T>): InjectionToken<T> => {
  if (!dep) {
    throw new IllegalArgumentValueError(`You can't ask for a scoped dependency without its type`, 'dep', dep);
  }
  const name = (<Scope>scope).getKey ? (<Scope>scope).getKey() : scope;
  const key = `${name}<${extractName(dep)}>`;
  if (scopedTokens.has(key)) {
    return scopedTokens.get(key)!;
  }
  const token = new InjectionToken<T>(key);
  scopedTokens.set(key, token);
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

  registerValue(token: string, value: string): void;

  registerClass<T, C extends T>(provide: Class<T> | InjectionToken<T>, clazz?: Class<C>): void;

  required<T>(provides: Array<Class<T> | InjectionToken<T>>, error?: Error): void;
  required<T>(provide: Class<T> | InjectionToken<T>, error?: Error): void;

  getProviders(): Provider[];
}

export class SimpleProviderRegistry implements ProviderRegistry {
  private providers: Provider[] = [];
  private decorators: Decorator<any>[] = [];
  private validations: Validation[] = [];
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

  registerValue(token: string, value?: string): void {
    if (!value) {
      return;
    }
    this.providers.push({
      provide: new InjectionToken<string>(token),
      useValue: value
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

  required<T>(provide: Class<T> | InjectionToken<T>, error?: Error): void;
  required<T>(provides: Array<Class<T> | InjectionToken<T>>, error?: Error): void;
  required<T>(provide: any, error?: Error): void {
    this.validations.push(new RequiredClassOrToken(Array.isArray(provide) ? provide : [provide], error));
  }

  getProviders(): Provider[] {
    this.checkValid();
    this.applyDecorators();
    return this.providers;
  }

  private checkValid() {
    const errs = this.validations.map((v) => v.validate(this.providers)).filter((err) => !!err) as Error[];
    if (errs.length) {
      throw new ConfigurationValidationError(`The configuration of the worker is not valid`, errs);
    }
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

export class RequiredClassOrToken implements Validation {
  constructor(private provides: Array<Class<any> | InjectionToken<any>>, private err?: Error) {}

  validate(providers: Provider[]): Error | undefined | null {
    const tokens = providers.map((p) => (<any>p).provide || p);
    const containsAtLeastOneRequired = this.provides.some((p) => tokens.includes(p));
    if (!containsAtLeastOneRequired) {
      return (
        this.err || new MissingMandatoryConfigurationError(`Missing configuration for ${this.names(this.provides)}`)
      );
    }
  }

  private names(provides: Array<Class<any> | InjectionToken<any>>): string {
    if (provides.length == 1) {
      return this.name(provides[0]);
    }
    return this.provides.map(this.name).join(' or ');
  }

  private name(provide: Class<any> | InjectionToken<any>): string {
    if (provide instanceof InjectionToken) {
      return provide.toString();
    }
    if (provide.constructor && provide.constructor.name) {
      return provide.constructor.name;
    }
    if (provide.prototype && provide.prototype.constructor && provide.prototype.constructor.name) {
      return provide.prototype.constructor.name;
    }
    return provide.toString();
  }
}
