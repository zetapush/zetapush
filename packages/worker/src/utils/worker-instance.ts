import { QueueTask, Context, TaskRequest } from '@zetapush/platform';
import { timeoutify } from './async';

/**
 * Default error code
 */
const DEFAULT_ERROR_CODE = 'API_ERROR';

export class WorkerInstance {
  /**
   * Worker instance timeout
   */
  private timeout: number;
  /**
   * Worker implementation
   */
  private worker: any;
  /**
   * Bootstraps layers
   */
  private bootLayers: any;

  /**
   *
   */
  constructor({
    timeout,
    worker,
    bootLayers,
  }: {
    timeout: number;
    worker: any;
    bootLayers: any;
  }) {
    /**
     * @access private
     * @type {number}
     */
    this.timeout = timeout;
    /**
     * @access private
     * @type {Object}
     */
    this.worker = worker;
    /**
     * @access private
     * @type {Listà}
     */
    this.bootLayers = bootLayers;
  }

  async configure() {
    for (let layerIndex in this.bootLayers) {
      for (let apiIndex in this.bootLayers[layerIndex]) {
        const api = this.bootLayers[layerIndex][apiIndex];
        if (typeof api['onApplicationBootstrap'] === 'function') {
          try {
            await api['onApplicationBootstrap']();
          } catch (error) {
            return {
              success: false,
              result: {
                code: 'EBOOTFAIL',
                message:
                  'onApplicationBootstrap error on class ' +
                  api.constructor.name +
                  ' : ' +
                  error.toString(),
                context: {},
                location: api.constructor.name,
              },
            };
          }
        }
      }
    }
    return {
      success: true,
      result: {},
    };
  }

  async dispatch(request: TaskRequest, context: Context) {
    const { data, owner } = request;
    const { name, namespace, parameters } = data;
    try {
      if (name === 'onApplicationBootstrap') {
        // Forbidden
        throw new Error('Forbidden external call : ' + name);
      }
      const result = await timeoutify(
        () => this.worker[namespace][name](parameters, context),
        this.timeout,
      );
      return {
        result,
        success: true,
      };
    } catch ({ code = DEFAULT_ERROR_CODE, message }) {
      console.error('WorkerInstance::error', { code, message });
      return {
        result: { code, message },
        success: false,
      };
    }
  }
  setWorker(worker: any) {
    console.log('WorkerInstance::setWorker', worker);
    this.worker = worker;
  }
}
