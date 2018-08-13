import { Context, bootstrapRegistry } from '@zetapush/core';
import { timeoutify } from '@zetapush/common';
import { TaskRequest } from '@zetapush/platform-legacy';

import { inject } from './context';

/**
 * Default error code
 */
const DEFAULT_ERROR_CODE = 'API_ERROR';

export interface WorkerInstance {
  setWorker(worker: any): void;
  dispatch(request: TaskRequest, context: Context): Promise<{ result: any; success: boolean }>;
  configure(): Promise<{ result: any; success: boolean }>;
}

export class TaskDispatcherWorkerInstance implements WorkerInstance {
  /**
   * Worker instance timeout
   */
  protected timeout: number;
  /**
   * Worker implementation
   */
  protected worker: any;
  /**
   * Bootstraps layers
   */
  private bootLayers: any;
  /**
   * Store instances that have been bootstrapped to prevent
   * calling onApplicationBootstrap several times
   */
  private bootstrapped: any[] = [];

  /**
   *
   */
  constructor({ timeout, worker, bootLayers }: { timeout: number; worker: any; bootLayers: any }) {
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
    try {
      for (let layerIndex in this.bootLayers) {
        for (let apiIndex in this.bootLayers[layerIndex]) {
          const api = this.bootLayers[layerIndex][apiIndex];
          await this.bootstrap(api);
        }
      }
      // bootstrap instances lately registered with @Bootstrappable decorator
      for (let instance of bootstrapRegistry.getInstances()) {
        await this.bootstrap(instance);
      }
      return {
        success: true,
        result: {}
      };
    } catch (e) {
      return e;
    } finally {
      // no more useful
      bootstrapRegistry.clear();
      this.bootstrapped = [];
    }
  }

  private async bootstrap(instance: any) {
    if (typeof instance['onApplicationBootstrap'] === 'function' && this.bootstrapped.indexOf(instance) == -1) {
      try {
        await instance['onApplicationBootstrap']();
        this.bootstrapped.push(instance);
      } catch (error) {
        throw {
          success: false,
          result: {
            code: 'EBOOTFAIL',
            message: 'onApplicationBootstrap error on class ' + instance.constructor.name + ' : ' + error.toString(),
            context: {},
            location: instance.constructor.name
          }
        };
      }
    }
  }

  async dispatch(request: TaskRequest, context: Context) {
    const { data } = request;
    const { name, namespace, parameters } = data;
    try {
      if (name === 'onApplicationBootstrap') {
        // Forbidden
        throw new Error(`Forbidden external call: ${name}`);
      }
      if (typeof this.worker[namespace] === 'undefined') {
        // Namespace
        throw new Error(`Invalid namespace : ${namespace}`);
      }
      if (typeof this.worker[namespace][name] !== 'function') {
        // Namespace
        throw new Error(`Invalid namespace method: ${namespace}${name}`);
      }
      // Api instance
      const tasker = this.worker[namespace];
      // Inject context in a proxified worker namespace
      const injected = inject(tasker, context.contextId);
      // Delegate task to
      const result = await timeoutify(() => injected[name](parameters, context), this.timeout);
      return {
        result,
        success: true
      };
    } catch ({ code = DEFAULT_ERROR_CODE, message }) {
      return {
        result: { code, message },
        success: false
      };
    }
  }

  setWorker(worker: any) {
    this.worker = worker;
  }
}
