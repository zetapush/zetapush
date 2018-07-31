import { Injectable, Inject, timeoutify, DEFAULT_INJECTOR_INSTANCE } from '@zetapush/common';
import { WorkerClientOptions, WorkerInstanceFactory, TaskDispatcherWorkerInstance } from '@zetapush/worker';
import { runInWorkerLogger } from '../utils/logger';
import { inject } from '@zetapush/worker';
require('reflect-metadata');

export class Wrapper {
  constructor(
    public workerDeclaration: (...instances: any[]) => void,
    public deps: any[],
    public instanceWrapper: any
  ) {}
}

@Injectable()
export class TestDeclaration {
  constructor(private wrapper: Wrapper) {}

  async test() {
    await this.wrapper.workerDeclaration(
      ...this.wrapper.deps,
      this.wrapper.instanceWrapper.instance.worker[DEFAULT_INJECTOR_INSTANCE]
    );
  }
}

export class TestWorkerInstanceFactory implements WorkerInstanceFactory {
  create(worker: any, deploymentId: string, options: WorkerClientOptions): TestWorkerInstance {
    return new TestWorkerInstance({
      timeout: options.timeout,
      worker,
      bootLayers: worker.bootLayers
    });
  }
}

export class TestWorkerInstance extends TaskDispatcherWorkerInstance {
  constructor({ timeout, worker, bootLayers }: { timeout: number; worker: any; bootLayers: any }) {
    super({ timeout, worker, bootLayers });
  }

  async directCall(namespace: string, name: string, ...parameters: any[]) {
    try {
      // Wrap request context
      const context = {
        contextId: 'ZetaTest',
        owner: 'ZetaTest'
      };
      // Api instance
      const tasker = this.worker[namespace];
      // Inject context in a proxified worker namespace
      const injected = inject(tasker, context.contextId);
      // Delegate task to
      const result = await timeoutify(() => injected[name](parameters, context), this.timeout);
      runInWorkerLogger.debug('WorkerInstance::result', result);
      return {
        result,
        success: true
      };
    } catch (e) {
      runInWorkerLogger.warn('WorkerInstance::error', e);
      throw e;
    }
  }
}
