import { Injectable, Inject, timeoutify, DEFAULT_INJECTOR_INSTANCE } from '@zetapush/common';
import { WorkerClientOptions, WorkerInstanceFactory, TaskDispatcherWorkerInstance } from '@zetapush/worker';
import { runInWorkerLogger } from '../utils/logger';
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
        owner: 'ZetaTest'
      };
      const result = await timeoutify(() => this.worker[namespace][name](parameters, context), this.timeout);
      runInWorkerLogger.debug('WorkerInstance::result', result);
      return {
        result,
        taskId: 'ZetaTest',
        requestId: 'ZetaTest',
        success: true
      };
    } catch (e) {
      let { code = 'ZETA_TEST_API_ERROR', message } = e;
      if (e && e.constructor && e.constructor.name == 'ExpectationFailed') {
        code = 'JASMINE_EXPECTATION_FAILED';
        message = new (<any>global).jasmine.ExceptionFormatter().message(e);
      }
      runInWorkerLogger.error('WorkerInstance::error', { code, message });
      return {
        result: { code, message },
        taskId: 'ZetaTest',
        requestId: 'ZetaTest',
        success: false
      };
    }
  }
}
