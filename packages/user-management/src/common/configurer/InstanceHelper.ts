import { Type } from '@zetapush/platform-legacy';
import { InstantiationError } from './ConfigurerError';
import { Provider } from '@zetapush/core';

interface FunctionWrapper<T, R> {
  new (func: () => Promise<R>): T;
}

export class InstanceHelper<T, R> {
  private instance?: T;
  private func?: () => Promise<R>;
  private clazz?: Type<T>;

  constructor(
    private provide: any,
    private funcCallWrapper: FunctionWrapper<T, R> | null,
    private errorFactory?: (instanceFuncOrClass: any) => Error
  ) {}

  register(func: () => Promise<R>): void;
  register(instance: T): void;
  register(clazz: Type<T>): void;
  register(instanceFuncOrClass: any): void {
    if (isInstance(instanceFuncOrClass)) {
      this.instance = instanceFuncOrClass;
    } else if (isClass(instanceFuncOrClass)) {
      this.clazz = instanceFuncOrClass;
    } else if (this.funcCallWrapper && isFunction(instanceFuncOrClass)) {
      this.func = instanceFuncOrClass;
    } else if (this.errorFactory) {
      throw this.errorFactory(instanceFuncOrClass);
    }
  }

  getProvider(): Provider | null {
    if (this.instance) {
      return {
        provide: this.provide,
        useValue: this.instance
      };
    }
    if (this.funcCallWrapper && this.func) {
      return {
        provide: this.provide,
        useValue: new this.funcCallWrapper(this.func)
      };
    }
    if (this.clazz) {
      return {
        provide: this.provide,
        useClass: this.clazz
      };
    }
    return null;
  }
}

export const isInstance = (instance: any): boolean => {
  return typeof instance === 'object' && !instance.prototype;
};

export const isClass = (clazz: any): boolean => {
  return typeof clazz === 'function' && /^class\s/.test(Function.prototype.toString.call(clazz));
};

export const isFunction = (func: any): boolean => {
  return typeof func === 'function';
};
