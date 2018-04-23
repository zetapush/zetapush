import { Authentication, Client, uuid } from '@zetapush/core';
import { Queue } from '@zetapush/platform';

import { timeoutify } from '../utils/async';

export class ServerClient extends Client {
  constructor({
    apiUrl,
    sandboxId,
    forceHttps,
    transports,
    login,
    password,
    timeout = 5000,
  }) {
    const authentication = () =>
      Authentication.developer({
        login,
        password,
      });
    const resource = uuid();
    /**
     * Call Client constructor with specific parameters
     */
    super({
      apiUrl,
      sandboxId,
      forceHttps,
      authentication,
      resource,
      transports,
    });
    /**
     * @access private
     * @type {number}
     */
    this.timeout = timeout;
  }
  subscribeTaskServer(Worker, deploymentId = Queue.DEFAULT_DEPLOYMENT_ID) {
    console.log('subscribeTaskServer', Worker, deploymentId);
    const queue = this.createService({
      deploymentId,
      listener: {
        dispatch: async ({ data: { request, taskId } }) => {
          console.log('dispatch', { request, taskId });
          const { data, requestId, owner } = request;
          const { name, namespace, parameters } = data;
          console.log('Queue::dispatch', {
            name,
            namespace,
            parameters,
            requestId,
            taskId,
          });
          try {
            // Wrap request context
            const context = {
              owner,
            };
            const result = await timeoutify(
              () => Worker[name](parameters, context),
              this.timeout,
            );
            console.log('result', result);
            queue.done({
              result,
              taskId,
              requestId,
              success: true,
            });
          } catch (error) {
            console.log('error', error);
            queue.done({
              result: error,
              taskId,
              requestId,
              success: false,
            });
          }
        },
      },
      Type: Queue,
    });
    queue.register({
      capacity: 100,
    });
  }
}
