import { Service as PlatformService } from '../Core/index';

interface FunctionConstructor {
  /**
   * Creates a new function.
   * @param args A list of arguments the function accepts.
   */
  new (...args: string[]): Function;
  (...args: string[]): Function;
  readonly prototype: Function;
}

interface Type<T> extends Function {
  new (...args: any[]): T;
}

type Primitive = string | number | boolean;

export type ServiceOptions = {
  [property: string]: Primitive;
};

export function Options(options: ServiceOptions = {}) {
  return (Service: Type<PlatformService>) => {
    class ServiceWithOptions extends Service {
      static get DEPLOYMENT_OPTIONS() {
        return options;
      }
    }
    return ServiceWithOptions as any;
  };
}
