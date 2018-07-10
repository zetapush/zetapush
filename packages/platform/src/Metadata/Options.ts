import { Service as PlatformService } from '../Core/index';

export type Type<T> = { new (...args: any[]): T };

export type Primitive = string | number | boolean;

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
