import { timeoutify, WorkerDeclaration, WorkerDeclarationNormalizer } from '@zetapush/common';
import { Injectable, Module, Provider, FactoryProvider, Expose, Configurer, ModuleToImport } from '@zetapush/core';
import { inject, TaskDispatcherWorkerInstance, WorkerClientOptions, WorkerInstanceFactory } from '@zetapush/worker';

import { runInWorkerLogger, configureWorkerLogger } from '../utils/logger';

export class Wrapper {
  constructor(
    public workerDeclaration: (...instances: any[]) => void,
    public deps: any[],
    public instanceWrapper: any
  ) {}
}

export class GivenConfigurationRunError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}

@Injectable()
export class TestDeclarationWrapper {
  constructor(private wrapper: Wrapper) {}

  async test() {
    try {
      await this.wrapper.workerDeclaration(...this.wrapper.deps);
    } catch (e) {
      runInWorkerLogger.error('Failed to run function provided in runInWorker()', e);
      throw e;
    }
  }
}

export const getTestNormalizer = async (
  factoryProvider: FactoryProvider,
  moduleDeclaration?: () => Promise<Module>
): Promise<WorkerDeclarationNormalizer> => {
  let expose: Expose | undefined;
  let providers: Provider[] = [];
  let imports: ModuleToImport[] = [];
  let configurers: Configurer[] = [];
  if (moduleDeclaration) {
    const module = await moduleDeclaration();
    expose = module.expose;
    providers = module.providers || [];
    imports = module.imports || [];
    configurers = module.configurers || [];
  }
  return async (declaration: WorkerDeclaration): Promise<Module> => {
    return {
      expose: {
        ...(expose || {}),
        ...declaration
      },
      providers: [...providers, factoryProvider],
      imports: imports,
      configurers: configurers
    };
  };
};

export const TestWorker = {
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
