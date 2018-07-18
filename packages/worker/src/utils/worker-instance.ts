import { TaskRequest } from '@zetapush/platform';

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
    console.log('Layers : ', this.bootLayers);
    for (let namespace in this.worker) {
      if (
        typeof this.worker[namespace][Symbol.for('onApplicationBootstrap')] ===
        'undefined'
      ) {
        continue;
      }
      try {
        await this.worker[namespace][Symbol.for('onApplicationBootstrap')]();
      } catch (error) {
        return {
          success: false,
          result: error,
        };
      }
    }
    return {
      success: true,
      result: 'ok',
    };
  }

  async dispatch({ data: { request, taskId } }: TaskRequest) {
    const { data, requestId, owner } = request;
    const { name, namespace, parameters } = data;
    console.log('WorkerInstance::dispatch', {
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
        () => this.worker[namespace][name](parameters, context),
        this.timeout,
      );
      console.log('WorkerInstance::result', result);
      return {
        result,
        taskId,
        requestId,
        success: true,
      };
    } catch ({ code = DEFAULT_ERROR_CODE, message }) {
      console.error('WorkerInstance::error', { code, message });
      return {
        result: { code, message },
        taskId,
        requestId,
        success: false,
      };
    }
  }
  setWorker(worker: any) {
    console.log('WorkerInstance::setWorker', worker);
    this.worker = worker;
  }
}
