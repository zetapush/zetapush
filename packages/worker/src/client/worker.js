import { Authentication, Client, uuid } from '@zetapush/core';
import { Queue as Worker } from '@zetapush/platform';

import { WorkerInstance } from '../utils/worker-instance.js';

export class WorkerClient extends Client {
  constructor({
    platformUrl,
    appName,
    forceHttps,
    transports,
    developerLogin,
    developerPassword,
    resource = `node_js_worker_${uuid()}`,
    timeout = 5000,
    capacity = 100,
  }) {
    const authentication = () =>
      Authentication.developer({
        login: developerLogin,
        password: developerPassword,
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
    console.log('subscribeTaskWorker', worker);
    const instance = new WorkerInstance({
      timeout: this.timeout,
      worker,
    });
    const queue = this.createService({
      deploymentId,
      listener: {
        async dispatch(task) {
          // Delegate task execution to worker instance
          const response = await instance.dispatch(task);
          // Notify platforme job is done
          queue.done(response);
        },
      },
      Type: Worker,
    });
    queue.register({
      capacity: this.capacity,
    });
    return instance;
  }
}
