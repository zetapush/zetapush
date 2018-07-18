import { Authentication, Client, uuid } from '@zetapush/client';
import { Queue as Worker, TaskRequest } from '@zetapush/platform';

import { WorkerInstance } from '../utils/worker-instance';

interface WorkerClientOptions {
  platformUrl: string;
  appName: string;
  forceHttps: boolean;
  transports: any[];
  developerLogin: string;
  developerPassword: string;
  resource: string;
  timeout: number;
  capacity: number;
}

export class WorkerClient extends Client {
  /**
   * Worker capacity
   */
  private capacity: number;
  /**
   * Worker task timeout
   */
  private timeout: number;
  /**
   * WorkerClient constructor
   */
  constructor({
    platformUrl,
    appName,
    forceHttps,
    transports,
    developerLogin,
    developerPassword,
    resource = `node_js_worker_${uuid()}`,
    timeout = 60 * 1000,
    capacity = 100,
  }: WorkerClientOptions) {
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
   */
  subscribeTaskWorker(
    worker: any,
    deploymentId = Worker.DEFAULT_DEPLOYMENT_ID,
  ) {
    const instance = new WorkerInstance({
      timeout: this.timeout,
      worker,
    });
    const queue = this.createService<Worker>({
      deploymentId,
      listener: {
        async dispatch(task: TaskRequest) {
          // Delegate task execution to worker instance
          const response = await instance.dispatch(task);
          // Notify platforme job is done
          queue.done(response);
        },
        async configure(task: TaskRequest) {
          // Return a synchronous succcessfull done result
          queue.done({
            result: {},
            taskId: task.data.taskId,
            success: true,
          });
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
