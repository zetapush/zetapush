import { RequestContext } from '@zetapush/core';
import { CloudServiceInstance } from '@zetapush/common';

export const inject = (instance: any, requestContext: RequestContext) =>
  new Proxy(instance, {
    get: (target: any, property: string): any => {
      if (property === 'requestContext') {
        return requestContext;
      } else if (property === 'requestContextId') {
        return requestContext.contextId;
      } else {
        const value = target[property];
        // Injected service
        if (CloudServiceInstance.is(value)) {
          return inject(value, requestContext);
        } else {
          return value;
        }
      }
    }
  });
