import { WeakClient } from '@zetapush/client';
import { ResolvedConfig, Service } from '@zetapush/common';
import { FactoryProvider } from '@zetapush/core';
import { WorkerRunner, WorkerRunnerEvents } from '@zetapush/worker';

import { userActionLogger, frontUserActionLogger, runInWorkerLogger } from '../utils/logger';
import { Context, ContextWrapper } from '../utils/types';
import {
  Wrapper,
  TestWorkerInstanceFactory,
  TestWorkerInstance,
  TestWorker,
  getTestNormalizer
} from '../worker/test-instance';

const transports = require('@zetapush/cometd/lib/node/Transports');

export const userAction = async (name: string, func: () => any) => {
  try {
    userActionLogger.info(`>>> User action: ${name}`);
    const res = await func();
    userActionLogger.info(`>>> User action DONE: ${name}`);
    return res;
  } catch (e) {
    userActionLogger.error(`>>> User action FAILED: ${name}`, e);
    throw e;
  }
};

export const consoleUserAction = async (name: string, func: () => any) => {
  return await userAction(name + ' from console', func);
};

export const frontUserAction = async (
  name: string,
  testOrContext: Context,
  func: (api: any, client: WeakClient) => any
) => {
  return await userAction(name + ' from front', async () => {
    let api;
    let client;
    try {
      const zetarc = new ContextWrapper(testOrContext).getContext().zetarc;
      client = new WeakClient({
        ...(<any>zetarc),
        transports
      });
      frontUserActionLogger.debug('Connecting to worker...');
      await client.connect();
      frontUserActionLogger.debug('Connected to worker');
      api = (<any>client).createProxyTaskService();
      frontUserActionLogger.debug('Api instance created');
    } catch (e) {
      frontUserActionLogger.error("Connection from client failed. Cloud service won't be called", e);
      throw e;
    }
    try {
      return await func(api, client);
    } catch (e) {
      frontUserActionLogger.error(
        `>>> Front user action FAILED: ${name}`,
        new ContextWrapper(testOrContext).getContext(),
        e
      );
      throw e;
    }
  });
};

export const runInWorker = (testOrContext: Context, workerDeclaration: (...instances: any[]) => void) => {
  return new Promise(async (resolve, reject) => {
    // TODO: everything should be in given (except runner.run())
    const context = new ContextWrapper(testOrContext).getContext();
    const { zetarc, dependencies, logLevel, moduleDeclaration } = context;

    try {
      const resolvedDependencies = typeof dependencies === 'function' ? dependencies() : dependencies;

      // Worker instance will be available once started but Wrapper needs it now.
      // So we use a wrapper that will be filled later
      const instanceWrapper: any = {};
      // Provider is required to provide a Wrapper instance that can't be
      // created automagically. We need `deps` array.
      const factoryProvider: FactoryProvider = {
        provide: Wrapper,
        useFactory: (...deps: any[]): Wrapper => {
          return new Wrapper(workerDeclaration, deps, instanceWrapper);
        },
        deps: resolvedDependencies || []
      };

      const runner = new WorkerRunner(
        false,
        false,
        <ResolvedConfig>zetarc,
        transports,
        new TestWorkerInstanceFactory(),
        logLevel.cometd,
        await getTestNormalizer(factoryProvider, moduleDeclaration)
      );

      // listen to events in order to log information to help developer
      runner.on(WorkerRunnerEvents.BOOTSTRAPING, () => {
        runInWorkerLogger.debug('Bootstraping worker...');
      });
      runner.on(WorkerRunnerEvents.UPLOADED, ({ recipe }: any) =>
        runInWorkerLogger.debug('Worker uploaded', recipe.recipeId)
      );
      runner.on(WorkerRunnerEvents.QUEUE_SERVICE_DEPLOYING, () =>
        runInWorkerLogger.debug('Queue service deploying...')
      );
      runner.on(WorkerRunnerEvents.QUEUE_SERVICE_READY, ({ recipe }: any) =>
        runInWorkerLogger.debug(`Queue service ready on ${recipe.recipeId}`)
      );
      runner.on(WorkerRunnerEvents.CONNECTING, () => runInWorkerLogger.debug(`Connecting Worker...`));
      runner.on(WorkerRunnerEvents.CONNECTED, () => runInWorkerLogger.debug(`Worker connected`));
      runner.on(WorkerRunnerEvents.CREATED_SERVICES, ({ services }: any) =>
        runInWorkerLogger.debug(`Create services`, services)
      );
      runner.on(WorkerRunnerEvents.PLATFORM_SERVICES_READY, () => runInWorkerLogger.debug(`Platform services created`));
      runner.on(WorkerRunnerEvents.WORKER_CREATED, ({ instance }: { instance: TestWorkerInstance }) => {
        instanceWrapper.instance = instance;
      });
      runner.on(WorkerRunnerEvents.CONFIGURING_APP, () => {
        runInWorkerLogger.debug(`Configuring application (onApplicationBootstrap)...`);
      });
      runner.on(WorkerRunnerEvents.CONFIGURED_APP, () =>
        runInWorkerLogger.debug(`Application configured (onApplicationBootstrap)...`)
      );
      runner.on(WorkerRunnerEvents.STARTING, () => {
        runInWorkerLogger.debug('Starting worker...');
      });
      runner.on(WorkerRunnerEvents.STARTED, ({ instance }: { instance: TestWorkerInstance }) => {
        runInWorkerLogger.debug('Worker started');
        instance
          .directCall('ZetaTest', 'test')
          .then(() => resolve())
          .catch((e) => reject(e));
      });

      runner.on(WorkerRunnerEvents.UPLOAD_FAILED, ({ failure }: any) => {
        runInWorkerLogger.error('Worker upload failed');
        runner.destroy();
        reject(failure);
      });
      runner.on(WorkerRunnerEvents.CONFIGURE_APP_FAILED, () =>
        runInWorkerLogger.warn(`Application configuration failed (onApplicationBootstrap)...`)
      );
      runner.on(WorkerRunnerEvents.START_FAILED, ({ failure }: any) => {
        runInWorkerLogger.error('Worker start failed');
        runner.destroy();
        reject(failure);
      });

      context.workerRunner = runner;

      runner.run(TestWorker);
    } catch (e) {
      reject(e);
    }
  });
};
