import { CloudServiceInstance } from '@zetapush/common';

export const inject = (instance: any, contextId?: string) =>
  new Proxy(instance, {
    get: (target: any, property: string): any => {
      if (property === 'contextId') {
        return contextId;
      } else {
        const value = target[property];
        // Injected service
        if (CloudServiceInstance.is(value)) {
          return inject(value, contextId);
        } else {
          return value;
        }
      }
    }
  });
