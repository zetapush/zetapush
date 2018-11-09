import { Context } from '@zetapush/core';
import { timeoutify, trace, warn } from '@zetapush/common';
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
  clean(): Promise<void>;
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
  private cleaned: any[] = [];

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
      return {
        success: true,
        result: {}
      };
    } catch (e) {
      return e;
    } finally {
      this.bootstrapped = [];
    }
  }

  async clean() {
    try {
      // TODO: clean in reverse order ?
      for (let layerIndex in this.bootLayers) {
        for (let apiIndex in this.bootLayers[layerIndex]) {
          const api = this.bootLayers[layerIndex][apiIndex];
          await this.cleanup(api);
        }
      }
    } catch (e) {
      warn(`Failed to cleanup`, e);
    } finally {
      this.cleaned = [];
    }
  }

  private async bootstrap(instance: any) {
    if (typeof instance['onApplicationBootstrap'] === 'function' && this.bootstrapped.indexOf(instance) == -1) {
      try {
        await instance['onApplicationBootstrap']();
        this.bootstrapped.push(instance);
      } catch (err) {
        trace(`onApplicationBootstrap error on class ${this.getName(instance)} : ${err.toString()}`, err);
        throw {
          success: false,
          result: {
            code: 'EBOOTFAIL',
            message: `onApplicationBootstrap error on class ${this.getName(instance)} : ${err.toString()}`,
            context: {},
            location: instance.constructor.name
          }
        };
      }
    }
  }

  private async cleanup(instance: any) {
    if (typeof instance['onApplicationCleanup'] === 'function' && this.cleaned.indexOf(instance) == -1) {
      try {
        await instance['onApplicationCleanup']();
        this.cleaned.push(instance);
      } catch (err) {
        warn(`Failed to cleanup ${this.getName(instance)}`, err);
      }
    }
  }

  private getName(instance: any) {
    return instance.constructor.name;
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
      const injected = inject(tasker, context);
      // Delegate task to
      const result = await timeoutify(
        () => injected[name](...parameters),
        this.timeout,
        `while dispatching request to worker method ${name}`
      );
      return {
        result,
        success: true
      };
    } catch (e) {
      const { code = DEFAULT_ERROR_CODE, message } = e;
      trace(`Failed to dispatch request`, e);
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
