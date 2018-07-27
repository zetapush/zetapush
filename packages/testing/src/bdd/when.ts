import { userActionLogger, frontUserActionLogger, runInWorkerLogger } from '../utils/logger';
import { WeakClient } from '@zetapush/client';
import { WorkerRunner, WorkerRunnerEvents } from '@zetapush/worker';
import { ResolvedConfig, Service } from '@zetapush/common';
import { Context, ContextWrapper } from '../utils/types';

const transports = require('@zetapush/cometd/lib/node/Transports');
import { FactoryProvider } from 'injection-js';
import { Wrapper, TestWorkerInstanceFactory, TestWorkerInstance, TestDeclaration } from '../worker/test-instance';

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

export const runInWorker = (
  testOrContext: Context,
  services: Service[],
  workerDeclaration: (...instances: any[]) => void
) => {
  return new Promise((resolve, reject) => {
    const { zetarc } = new ContextWrapper(testOrContext).getContext();

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
      deps: services
    };

    const runner = new WorkerRunner(false, <ResolvedConfig>zetarc, transports, new TestWorkerInstanceFactory(), [
      factoryProvider
    ]);

    // listen to events in order to log information to help developer
    runner.on(WorkerRunnerEvents.BOOTSTRAPING, ({ client }) => {
      runInWorkerLogger.debug('Bootstraping worker...');
    });
    runner.on(WorkerRunnerEvents.UPLOADED, ({ recipe }) => runInWorkerLogger.debug('Worker uploaded', recipe.recipeId));
    runner.on(WorkerRunnerEvents.QUEUE_SERVICE_DEPLOYING, () => runInWorkerLogger.debug('Queue service deploying...'));
    runner.on(WorkerRunnerEvents.QUEUE_SERVICE_READY, ({ recipe }) =>
      runInWorkerLogger.debug(`Queue service ready on ${recipe.recipeId}`)
    );
    runner.on(WorkerRunnerEvents.CONNECTING, () => runInWorkerLogger.debug(`Connecting Worker...`));
    runner.on(WorkerRunnerEvents.CONNECTED, () => runInWorkerLogger.debug(`Worker connected`));
    runner.on(WorkerRunnerEvents.CREATED_SERVICES, ({ services }) =>
      runInWorkerLogger.debug(`Create services`, services)
    );
    runner.on(WorkerRunnerEvents.PLATFORM_SERVICES_READY, () => runInWorkerLogger.debug(`Platform services created`));
    runner.on(WorkerRunnerEvents.STARTING, () => {
      runInWorkerLogger.debug('Starting worker...');
    });
    runner.on(WorkerRunnerEvents.STARTED, ({ instance }: any) => {
      runInWorkerLogger.debug('Worker started');
      try {
        instanceWrapper.instance = instance;
        (<TestWorkerInstance>instance).directCall('ZetaTest', 'test');
        resolve();
      } catch (e) {
        reject(e);
      }
    });

    runner.on(WorkerRunnerEvents.UPLOAD_FAILED, ({ failure }) => {
      runInWorkerLogger.error('Worker upload failed');
      runner.destroy();
      reject(failure);
    });
    runner.on(WorkerRunnerEvents.START_FAILED, ({ failure }: any) => {
      runInWorkerLogger.error('Worker start failed');
      runner.destroy();
      reject(failure);
    });

    runner.run({ ZetaTest: TestDeclaration });
  });
};
