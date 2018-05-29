import { Authentication, Client, uuid } from '@zetapush/core';
import { Queue as Worker } from '@zetapush/platform';

import { timeoutify } from '../utils/async';

export class WorkerClient extends Client {
  constructor({
    apiUrl,
    sandboxId,
    forceHttps,
    transports,
    login,
    password,
    resource = `node_js_worker_${uuid()}`,
    timeout = 5000,
  }) {
    const authentication = () =>
      Authentication.developer({
        login,
        password,
      });
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
  subscribeTaskWorker(worker, deploymentId = Worker.DEFAULT_DEPLOYMENT_ID) {
    console.log('subscribeTaskWorker', worker, deploymentId);
    const queue = this.createService({
      deploymentId,
      listener: {
        dispatch: async ({ data: { request, taskId } }) => {
          const { data, requestId, owner } = request;
          const { name, namespace, parameters } = data;
          console.log('Worker::dispatch', {
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
              () => worker[namespace][name](parameters, context),
              this.timeout,
            );
            console.log('Worker::result', result);
            queue.done({
              result,
              taskId,
              requestId,
              success: true,
            });
          } catch (error) {
            console.log('Worker::error', error);
            queue.done({
              result: error,
              taskId,
              requestId,
              success: false,
            });
          }
        },
      },
      Type: Worker,
    });
    queue.register({
      capacity: 100,
    });
  }
}
