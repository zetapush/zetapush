import { SmartClient, Client } from '@zetapush/client';
import { ResolvedConfig, Service } from '@zetapush/common';
import { FactoryProvider } from '@zetapush/core';
import { WorkerRunner, WorkerRunnerEvents } from '@zetapush/worker';

import { userActionLogger, frontActionLogger, runInWorkerLogger } from '../utils/logger';
import { Context, ContextWrapper } from '../utils/types';
import {
  Wrapper,
  TestWorkerInstanceFactory,
  TestWorkerInstance,
  TestWorker,
  getTestNormalizer
} from '../worker/test-instance';
import { LocalDevEnvironmentProvider } from '@zetapush/common';
import { Credentials } from '@zetapush/client';

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

export const consoleAction = async (name: string, func: () => any) => {
  return await userAction(name + ' from console', func);
};

export const frontAction = (testOrContext: Context) => {
  return new UserAction(testOrContext);
};

export const runInWorker = (testOrContext: Context, workerDeclaration: (...instances: any[]) => void) => {
  return new Promise(async (resolve, reject) => {
    // TODO: everything should be in given (except runner.run())
    const context = new ContextWrapper(testOrContext).getContext();
    const { zetarc, dependencies, logLevel, moduleDeclaration, projectDir } = context;

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
        true, // Test must grab all traffic
        <ResolvedConfig>zetarc,
        transports,
        new LocalDevEnvironmentProvider(<ResolvedConfig>zetarc, 'test', projectDir || ''), // TODO: provide environment provider that suits to tests (one that can be constructed through given())
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

class Parent<P> {
  constructor(private parent: P) {}

  and() {
    return this.parent;
  }
}

class UserAction {
  private actionName: string = 'user action';
  private actionNameSuffix: string = ' from front';
  private credentials?: Credentials;
  private apiBuilder?: Api;

  constructor(private testOrContext: Context) {}

  name(actionName: string, suffix = ' from front') {
    this.actionName = actionName;
    this.actionNameSuffix = suffix;
    return this;
  }

  loggedAs(login: string, password: string): UserAction;
  loggedAs(credentials: Credentials): UserAction;
  loggedAs(loginOrCreds: any, password?: string): UserAction {
    if (typeof loginOrCreds === 'string') {
      this.credentials = { login: loginOrCreds, password: password || '' };
      return this;
    }
    this.credentials = loginOrCreds;
    return this;
  }

  api() {
    this.apiBuilder = new Api(this);
    return this.apiBuilder;
  }

  async execute(func?: (api: any, client: Client) => Promise<any>) {
    return await userAction(this.actionName + this.actionNameSuffix, async () => {
      let api;
      let client;
      try {
        const zetarc = new ContextWrapper(this.testOrContext).getContext().zetarc;
        client = new SmartClient({
          ...(<any>zetarc),
          transports
        });
        frontActionLogger.debug('Connecting to worker...');
        await client.disconnect();
        if (this.credentials) {
          await client.setCredentials(this.credentials);
        }
        await client.connect();
        frontActionLogger.debug('Connected to worker');
        if (!this.apiBuilder) {
          this.apiBuilder = new Api(this);
        }
        api = <any>this.apiBuilder.build(client);
        frontActionLogger.debug('Api instance created');
      } catch (e) {
        frontActionLogger.error("Connection from client failed. Cloud service won't be called", e);
        throw e;
      }
      try {
        if (func) {
          return await func(api, client);
        }
      } catch (e) {
        frontActionLogger.error(
          `>>> Front user action FAILED: ${this.actionName}`,
          new ContextWrapper(this.testOrContext).getContext(),
          e
        );
        throw e;
      }
    });
  }
}

class Api extends Parent<UserAction> {
  private apiNamespace?: string;
  private apiCallTimeout?: number;

  namespace(namespace: string) {
    this.apiNamespace = namespace;
    return this;
  }

  timeout(timeout: number) {
    this.apiCallTimeout = timeout;
    return this;
  }

  build(client: Client) {
    return client.createProxyTaskService({ timeout: this.apiCallTimeout, namespace: this.apiNamespace });
  }
}
