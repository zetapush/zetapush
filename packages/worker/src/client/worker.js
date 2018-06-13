import { Authentication, Client, uuid } from '@zetapush/core';
import { Queue as Worker } from '@zetapush/platform';

import { timeoutify } from '../utils/async.js';

export class WorkerClient extends Client {
  constructor({
    platformUrl,
    appName,
    forceHttps,
    transports,
    login,
    password,
    resource = `node_js_worker_${uuid()}`,
    timeout = 5000,
    capacity = 100,
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
      platformUrl,
      appName,
      forceHttps,
      authentication,
      resource,
      transports,
    });
    /**
     * @access private
     * @type {number}
     */
    this.capacity = capacity;
    /**
     * @access private
     * @type {number}
     */
    this.timeout = timeout;
  }
  /**
   * Subscribe a task worker
   * @param {Object} worker
   * @param {String} deploymentId
   * @return {() => void}
   */
  subscribeTaskWorker(worker, deploymentId = Worker.DEFAULT_DEPLOYMENT_ID) {
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
      capacity: this.capacity,
    });
    return () => queue.unregister();
  }
}
