import { Authentication, Client, uuid } from '@zetapush/client';
import {
  Queue as Worker,
  QueueTask,
  ConfigureTask,
  TaskRequest,
} from '@zetapush/platform';
import { LogLevel, Logs, Context } from '@zetapush/platform';

import { WorkerInstance } from '../utils/worker-instance';

const DEFAULT_NAMESPACE = '';

interface ListenerMessage<T> {
  data: T;
  channel: string;
}

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
      bootLayers: worker.bootLayers,
    });
    const logs = this.createService<Logs>({
      Type: Logs,
    });
    const queue = this.createService<Worker>({
      deploymentId,
      listener: {
        dispatch: async ({ data: task }: ListenerMessage<QueueTask>) => {
          const { request, taskId } = task;
          if (request && taskId) {
            // Get request context for task request
            const context = this.getRequestContext(request, logs, deploymentId);
            // Delegate task execution to worker instance
            const response = await instance.dispatch(request, context);
            // Notify platforme job is done
            queue.done({
              ...response,
              taskId,
              contextId: request.contextId,
              requestId: request.requestId,
            });
          } else {
            // Unable to dispatch task
          }
        },
        async configure(task: TaskRequest) {
          const res = await instance.configure();
          queue.done({
            result: res.result,
            taskId: task.data.taskId,
            success: res.success,
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
  private getRequestContext(
    request: TaskRequest,
    logs: Logs,
    deploymentId: string,
  ): Context {
    const { contextId, data, owner = '', originator } = request;
    const { name } = data;
    const namespace = () =>
      data.namespace === DEFAULT_NAMESPACE ? 'default' : data.namespace;
    // Base log options
    const options = {
      contextId,
      custom: {},
      owner: originator ? originator.owner : '',
      resource: originator ? originator.resource : '',
      logger: `${deploymentId}.${namespace()}.${name}`,
    };
    const logger = Object.freeze({
      trace(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.TRACE,
        });
      },
      debug(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.DEBUG,
        });
      },
      info(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.INFO,
        });
      },
      warn(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.WARN,
        });
      },
      error(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.ERROR,
        });
      },
    });
    return Object.freeze({
      contextId,
      owner,
      logger,
    });
  }
}
