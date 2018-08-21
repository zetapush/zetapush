import { timeoutify, DEFAULT_INJECTOR_INSTANCE } from '@zetapush/common';
import { Injectable, Configure, Injector, Bootstrappable } from '@zetapush/core';
import { inject, TaskDispatcherWorkerInstance, WorkerClientOptions, WorkerInstanceFactory } from '@zetapush/worker';

import { runInWorkerLogger, configureWorkerLogger } from '../utils/logger';
import { ConfigurationFunction } from '../utils/types';

export class Wrapper {
  constructor(
    public workerDeclaration: (...instances: any[]) => void,
    public deps: any[],
    public instanceWrapper: any
  ) {}

  getInjector() {
    return this.instanceWrapper.instance.worker[DEFAULT_INJECTOR_INSTANCE];
  }
}

export class GivenConfigurationRunError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}
// export class TestConfigurationWrapper {
//   constructor(private configuration: ConfigurationFunction, private deps: any[], private instanceWrapper: any) {}

//   // TODO: not really the good time (constructed dependencies could also declare onApplicationBoostrap)
//   // async onApplicationBootstrap() {
//   //   await this.build();
//   // }

//   // TODO: automatically called by di ?
//   // TODO: provide list of providers to di ?
//   async build() {
//     try {
//       await this.configuration(...this.deps);
//     } catch (e) {
//       configureWorkerLogger.error('Failed to run function provided in given().worker().configuration()', e);
//       throw new GivenConfigurationRunError('Failed to run function provided in given().worker().configuration()', e);
//     }
//   }
// }

@Injectable()
export class TestDeclarationWrapper {
  constructor(private wrapper: Wrapper) {}

  async test() {
    try {
      await this.wrapper.workerDeclaration(this.wrapper.getInjector(), ...this.wrapper.deps);
    } catch (e) {
      runInWorkerLogger.error('Failed to run function provided in runInWorker()', e);
      throw e;
    }
  }
}

export const TestWorker = {
  // ZetaTestConfiguration: TestConfigurationWrapper,
  ZetaTest: TestDeclarationWrapper
};

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
