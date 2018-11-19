import { Context } from '@zetapush/core';
import { Authentication, Client, uuid, ConnectionStatusListener } from '@zetapush/client';
import { Queue, QueueTask, TaskRequest } from '@zetapush/platform-legacy';
import { LogLevel, Logs } from '@zetapush/platform-legacy';
import { WorkerInstance, TaskDispatcherWorkerInstance } from '../utils/worker-instance';

const DEFAULT_NAMESPACE = '';
interface ListenerMessage<T> {
  data: T;
  channel: string;
}

export interface WorkerClientOptions {
  platformUrl: string;
  appName: string;
  forceHttps: boolean;
  transports: any[];
  developerLogin: string;
  developerPassword: string;
  resource: string;
  timeout: number;
  capacity: number;
  grabAllTraffic: boolean;
}

export class Worker extends Queue {
  static get DEPLOYMENT_OPTIONS() {
    return {
      queue_auth_id: 'developer'
    };
  }
}

export interface WorkerInstanceFactory {
  create(worker: any, deploymentId: string, options: WorkerClientOptions): WorkerInstance;
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
   * A factory used to instantiate a WorkerInstance
   */
  private workerInstanceFactory?: WorkerInstanceFactory;
  /**
   * Options given to the worker client
   */
  private options: WorkerClientOptions;
  /**
   * Queue service of this worker client
   */
  private queue?: Worker;
  /**
   * WorkerClient constructor
   */
  constructor(
    {
      platformUrl,
      appName,
      forceHttps,
      transports,
      developerLogin,
      developerPassword,
      resource = `node_js_worker_${uuid()}`,
      timeout = 60 * 1000,
      capacity = 100,
      grabAllTraffic = false
    }: WorkerClientOptions,
    workerInstanceFactory?: WorkerInstanceFactory
  ) {
    /**
     * Call Client constructor with specific parameters
     */
    super({
      platformUrl,
      appName,
      forceHttps,
      authentication: () =>
        Authentication.developer({
          login: developerLogin,
          password: developerPassword
        }),
      resource,
      transports
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
    /**
     * @access private
     * @type {Function}
     */
    this.workerInstanceFactory = workerInstanceFactory;
    this.options = {
      platformUrl,
      appName,
      forceHttps,
      transports,
      developerLogin,
      developerPassword,
      resource,
      timeout,
      capacity,
      grabAllTraffic
    };

    this.addConnectionStatusListener(<any>{
      onConnectionEstablished: () => {
        this.registerWorker();
      }
    });
  }

  async registerWorker() {
    if (this.queue) {
      try {
        this.queue.register({
          capacity: this.capacity,
          routing: {
            exclusive: this.options.grabAllTraffic
          }
        });
      } catch (ex) {
        const exception = {
          code: 'WORKER_INSTANCE_REGISTER_FAILED',
          message: 'Unable to correctly register worker instance',
          cause: ex
        };
        throw exception;
      }
    }
  }

  /**
   * Subscribe a task worker
   */
  async subscribeTaskWorker(worker: any, deploymentId = Worker.DEFAULT_DEPLOYMENT_ID) {
    const instance = this.newWorkerInstance(worker, deploymentId);
    const logs = this.createService<Logs>({
      Type: Logs
    });
    this.queue = this.createAsyncService<Worker>({
      deploymentId,
      listener: {
        dispatch: async ({ data: task }: ListenerMessage<QueueTask>) => {
          const { request, taskId } = task;
          if (request && taskId) {
            // Get request context for task request
            const context = this.getRequestContext(request, logs, deploymentId);
            const namespace = () => (request.data.namespace === DEFAULT_NAMESPACE ? 'default' : request.data.namespace);

            // Trace call Start with params
            logs.log({
              contextId: request.contextId,
              level: LogLevel.TRACE,
              data: request,
              logger: `${deploymentId}.apiCall.in`
            });

            // Delegate task execution to worker instance
            const response = await instance.dispatch(request, context);

            // Trace call End with response
            logs.log({
              contextId: request.contextId,
              level: LogLevel.TRACE,
              data: response,
              logger: `${deploymentId}.apiCall.out`
            });

            // Notify platforme job is done
            if (!this.queue) {
              throw `Queue service doesn't exists`;
            }
            this.queue.done({
              ...response,
              taskId,
              contextId: request.contextId,
              requestId: request.requestId
            });
          } else {
            // Unable to dispatch task
          }
        },
        async configure(task: TaskRequest) {
          const res = await instance.configure();
          this.queue.done({
            result: res.result,
            taskId: task.data.taskId,
            success: res.success
          });
        }
      },
      Type: Worker
    });

    this.registerWorker();
    return instance;
  }
  private getRequestContext(request: TaskRequest, logs: Logs, deploymentId: string): Context {
    const { contextId, data, owner = '', originator } = request;
    const { name } = data;
    const namespace = () => (data.namespace === DEFAULT_NAMESPACE ? 'default' : data.namespace);
    // Base log options
    const options = {
      contextId,
      custom: {},
      owner: originator ? originator.owner : '',
      resource: originator ? originator.resource : '',
      logger: `${deploymentId}.${namespace()}.${name}`
    };
    const logger = Object.freeze({
      trace(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.TRACE
        });
      },
      debug(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.DEBUG
        });
      },
      info(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.INFO
        });
      },
      warn(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.WARN
        });
      },
      error(...messages: any[]) {
        logs.log({
          ...options,
          data: { messages },
          level: LogLevel.ERROR
        });
      }
    });
    return Object.freeze({
      contextId,
      owner,
      logger
    });
  }

  private newWorkerInstance(worker: any, deploymentId: string) {
    if (!this.workerInstanceFactory) {
      return new TaskDispatcherWorkerInstance({
        timeout: this.timeout,
        worker,
        bootLayers: worker.bootLayers
      });
    }
    return this.workerInstanceFactory.create(worker, deploymentId, this.options);
  }
}
