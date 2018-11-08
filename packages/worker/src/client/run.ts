import { WorkerClient, Worker, WorkerInstanceFactory } from './worker';
import { Environment } from '@zetapush/core';
import { Weak, Queue } from '@zetapush/platform-legacy';
import { ArtefactsConfig } from '@zetapush/common';
import {
  instantiate,
  WorkerDeclaration,
  ResolvedConfig,
  checkQueueServiceDeployed,
  getDeploymentIdList,
  getRuntimeProvision,
  equals,
  fetch,
  upload,
  createProvisioningArchive,
  generateProvisioningContent,
  debugObject,
  trace,
  WorkerDeclarationNormalizer,
  DependencyInjectionAnalysis,
  analyze
} from '@zetapush/common';
import { EventEmitter } from 'events';
import { WorkerInstance } from '../utils/worker-instance';
import { EnvironmentProvider } from '@zetapush/common';

export enum WorkerRunnerEvents {
  BOOTSTRAPING = 'bootstraping',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  UPLOAD_FAILED = 'upload-failed',
  QUEUE_SERVICE_DEPLOYING = 'queue-service-deploying',
  QUEUE_SERVICE_READY = 'queue-service-ready',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  PLATFORM_SERVICES_READY = 'platform-services-ready',
  CREATED_SERVICES = 'created-services',
  WORKER_CREATED = 'worker-created',
  CONFIGURING_APP = 'configuring-app',
  CONFIGURED_APP = 'configured-app',
  STARTING = 'starting',
  STARTED = 'started',

  RELOADING = 'reloading',
  RELOADED = 'reloaded',

  CONFIGURE_APP_FAILED = 'configure-app-failed',
  START_FAILED = 'start-failed',
  RELOAD_FAILED = 'reload-failed'
}

export class WorkerConnectionError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}

export class IllegalStateError extends Error {
  constructor(message: string) {
    super(message);
  }
}
export class InstantiationError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}
export class UploadError extends Error {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}

export class QueueServiceDeploymentError extends Error {
  constructor(message: string, public recipe: any) {
    super(message);
  }
}

export interface WorkerEventData {
  client: WorkerClient;
  config: ResolvedConfig;
  declaration: WorkerDeclaration;
}

export interface WorkerStartEventData extends WorkerEventData {
  instance: WorkerInstance;
}

export class WorkerRunner extends EventEmitter {
  private client?: WorkerClient;
  private currentDeclaration: WorkerDeclaration;
  private currentInstance?: Array<WorkerInstance>;
  private currentAnalysis: Array<DependencyInjectionAnalysis> = [];
  private artefactsConfig?: ArtefactsConfig;

  constructor(
    private skipProvisioning: boolean,
    private skipBootstrap: boolean,
    private grabAllTraffic: boolean,
    private config: ResolvedConfig,
    private transports: any[],
    private envProvider: EnvironmentProvider,
    private workerInstanceFactory?: WorkerInstanceFactory,
    private logLevel?: string,
    private customNormalizer?: WorkerDeclarationNormalizer
  ) {
    super();
  }

  /**
   *
   * @param {Object} client
   * @param {Object} config
   * @param {Object} analysis
   */
  private async start(
    client: WorkerClient,
    config: ResolvedConfig,
    analysis?: Array<DependencyInjectionAnalysis>
  ): Promise<Array<WorkerInstance>> {
    console.log('==> START START');

    if (!analysis || analysis.length == 0) {
      throw new IllegalStateError(
        'No dependency injection analysis available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }
    return instantiate(analysis).then((workers: Array<any>) => {
      console.log('==> START INSTANTIATE : ', workers);

      return Promise.all(workers.map((worker) => client.subscribeTaskWorker(worker.instance, worker.deploymentId)));
    });
  }

  /**
   * Run Worker instance
   * @param {WorkerDeclaration} declaration
   *
   * @fires WorkerRunnerEvents#BOOTSTRAPING
   * @fires WorkerRunnerEvents#UPLOADED
   * @fires WorkerRunnerEvents#QUEUE_SERVICE_DEPLOYING
   * @fires WorkerRunnerEvents#QUEUE_SERVICE_READY
   * @fires WorkerRunnerEvents#UPLOAD_FAILED
   * @fires WorkerRunnerEvents#CONNECTING
   * @fires WorkerRunnerEvents#CONNECTED
   * @fires WorkerRunnerEvents#PLATFORM_SERVICES_READY
   * @fires WorkerRunnerEvents#WORKER_CREATED
   * @fires WorkerRunnerEvents#CONFIGURING_APP
   * @fires WorkerRunnerEvents#CONFIGURED_APP
   * @fires WorkerRunnerEvents#STARTING
   * @fires WorkerRunnerEvents#STARTED
   * @fires WorkerRunnerEvents#CONFIGURE_APP_FAILED
   * @fires WorkerRunnerEvents#START_FAILED
   * @fires WorkerRunnerEvents#RELOADING
   * @fires WorkerRunnerEvents#RELOADED
   * @fires WorkerRunnerEvents#RELOAD_FAILED
   */
  run(declaration: WorkerDeclaration): Promise<WorkerStartEventData> {
    return new Promise((resolve, reject) => {
      console.log('==> IN RUN');
      const config = this.config;
      const clientConfig: any = config;
      const client = new WorkerClient(
        {
          ...clientConfig,
          transports: this.transports,
          grabAllTraffic: this.grabAllTraffic
        },
        this.workerInstanceFactory
      );
      if (this.logLevel) {
        client.setLogLevel(this.logLevel);
      }
      this.client = client;
      this.currentDeclaration = declaration;

      this.envProvider.get(client, this.getQueueApi(client)).then((env: Environment) => {
        console.log('==> AFTER PROVIDER');
        Promise.all(
          declaration.map((workerDeclaration: any) => {
            return analyze(client, workerDeclaration, env, this.customNormalizer).then(
              (analysis: DependencyInjectionAnalysis) => this.currentAnalysis.push(analysis)
            );
          })
        )
          .then(() => {
            this.emit(WorkerRunnerEvents.BOOTSTRAPING, { client, config, declaration });
          })
          .then(() => this.bootstrap(client, config, declaration, this.currentAnalysis))
          .then(() =>
            this.emit(WorkerRunnerEvents.STARTING, {
              client,
              config,
              declaration
            })
          )
          // start the worker
          .then(() => this.start(client, config, this.currentAnalysis))
          // save the instance of the worker
          .then((instances: Array<WorkerInstance>) => {
            this.currentInstance = instances;

            return Promise.all(
              instances.map((instance: WorkerInstance) => {
                this.emit(WorkerRunnerEvents.WORKER_CREATED, {
                  instance,
                  client,
                  config,
                  declaration
                });

                // call onApplicationBootstrap on all started instances
                this.checkApplicationBootstrap(instance)
                  .then(() => {
                    if (!this.currentInstance) {
                      throw new IllegalStateError(
                        'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
                      );
                    }
                    this.emit(WorkerRunnerEvents.STARTED, {
                      instance,
                      client,
                      config,
                      declaration
                    });
                    trace('Worker successfully started');
                    resolve({
                      instance,
                      client,
                      config,
                      declaration
                    });
                    // .catch((err) => {
                    //   this.emit(WorkerRunnerEvents.START_FAILED, {
                    //     failure: err,
                    //     client,
                    //     config,
                    //     declaration
                    //   });
                    // });
                  })
                  .catch((failure) => {
                    trace('Failed to start worker', failure);
                    // TODO: reaise error instead ?
                    this.emit(WorkerRunnerEvents.START_FAILED, {
                      failure,
                      client,
                      config,
                      declaration
                    });
                    reject({
                      failure,
                      client,
                      config,
                      declaration
                    });
                  });
              })
            );
          });
      });
    });
  }

  private bootstrap(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration,
    analysis?: Array<DependencyInjectionAnalysis>
  ): Promise<boolean> {
    console.log('==> START BOOTSTRAP');

    if (!analysis || analysis.length == 0) {
      throw new IllegalStateError(
        'No dependency injection analysis available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }

    const bootstrap = this.skipProvisioning
      ? this.connectClientAndCreateServices(client, config, declaration, analysis)
      : this.checkServicesAlreadyDeployed(config).then(
          (deployed: boolean) =>
            !deployed
              ? this.cookWithOnlyQueueServiceAndWorkers(client, config, declaration, analysis)
              : this.connectClientAndCreateServices(client, config, declaration, analysis)
        );

    return bootstrap;
  }

  async reload(reloaded: WorkerDeclaration) {
    if (!this.client || !this.currentInstance) {
      throw new IllegalStateError(
        'No client or no current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }
    if (!this.currentAnalysis) {
      throw new IllegalStateError(
        'No dependency injection analysis available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }
    let previous = getDeploymentIdList(this.currentAnalysis, [Queue]);
    this.emit(WorkerRunnerEvents.RELOADING, {
      client: this.client,
      config: this.config,
      declaration: reloaded
    });
    const env = await this.envProvider.get(this.client, this.getQueueApi(this.client));
    const newAnalysis = await analyze(this.client, reloaded, env, this.customNormalizer);
    this.currentAnalysis = [];
    this.currentAnalysis.push(newAnalysis);
    let next = getDeploymentIdList(this.currentAnalysis, [Queue]);
    const deploymentListHasChange = !equals(previous, next);
    const tasks = [];
    if (deploymentListHasChange) {
      tasks.push(this.createServices(this.client, this.config, reloaded, this.currentAnalysis));
    }
    return (
      Promise.all(tasks)
        // Create a new worker instance
        .then(() => instantiate(this.currentAnalysis))
        .then((worker) => {
          if (!this.currentInstance) {
            throw new IllegalStateError(
              'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
            );
          }
          Promise.all(
            this.currentInstance.map((instance) => {
              instance.setWorker(worker);
            })
          );

          // Update previous deployment id list
          this.currentDeclaration = reloaded;
          this.emit(WorkerRunnerEvents.RELOADED, {
            instance: this.currentInstance,
            client: this.client,
            config: this.config
          });
        })
        .catch((failure) => {
          // TODO: reaise error instead ?
          this.emit(WorkerRunnerEvents.RELOAD_FAILED, {
            failure,
            client: this.client,
            config: this.config,
            declaration: reloaded
          });
        })
    );
  }

  async destroy() {
    trace('runner.destroy()');
    if (this.currentInstance) {
      trace('cleaning worker instance...');
      await this.currentInstance.forEach(async (instance) => {
        await instance.clean();
      });
      trace('worker instance cleaned...');
    }
    this.removeAllListeners();
  }

  private checkApplicationBootstrap(instance: WorkerInstance) {
    return new Promise((resolve, reject) => {
      if (!this.currentInstance) {
        throw new IllegalStateError(
          'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
        );
      }
      const client = this.client;
      const config = this.config;
      const declaration = this.currentDeclaration;

      if (!this.skipBootstrap) {
        this.emit(WorkerRunnerEvents.CONFIGURING_APP, {
          instance,
          client,
          config,
          declaration
        });
        instance.configure().then((res) => {
          debugObject('bootstrap-configure', { res });
          if (res.success == false) {
            this.emit(WorkerRunnerEvents.CONFIGURE_APP_FAILED, {
              failure: res,
              client,
              config,
              declaration
            });
            reject(res.result);
          } else {
            this.emit(WorkerRunnerEvents.CONFIGURED_APP, {
              instance,
              client,
              config,
              declaration
            });
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
  /**
   * Ask progression during deployment of services
   */
  private waitingQueueServiceDeployed(
    recipe: any,
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration,
    analysis: Array<DependencyInjectionAnalysis>
  ): Promise<boolean> {
    const { recipeId } = recipe;
    if (recipeId === void 0) {
      throw new QueueServiceDeploymentError('Missing recipeId', recipe);
    }
    this.emit(WorkerRunnerEvents.QUEUE_SERVICE_DEPLOYING, {
      recipe,
      client,
      config,
      declaration
    });
    return checkQueueServiceDeployed(config, recipeId).then((recipeId: string) => {
      this.emit(WorkerRunnerEvents.QUEUE_SERVICE_READY, {
        recipe,
        client,
        config,
        declaration
      });
      return this.connectClientAndCreateServices(client, config, declaration, analysis);
    });
  }

  private getQueueApi(client: WorkerClient) {
    return client.createAsyncService({
      Type: Queue
    });
  }

  private async createServices(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration,
    analysis: Array<DependencyInjectionAnalysis>
  ) {
    const api = this.getQueueApi(client);
    const { items } = getRuntimeProvision(config, analysis, [Queue]);
    const services = items.map(({ item }) => item);

    this.emit(WorkerRunnerEvents.CREATED_SERVICES, {
      services,
      client,
      config,
      declaration
    });

    return await (<any>api).createServices({ services });
  }

  private connectClientAndCreateServices(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration,
    analysis: Array<DependencyInjectionAnalysis>
  ): Promise<boolean> {
    this.emit(WorkerRunnerEvents.CONNECTING, {
      client,
      config,
      declaration
    });
    return client
      .connect()
      .then(() =>
        this.emit(WorkerRunnerEvents.CONNECTED, {
          client,
          config,
          declaration
        })
      )
      .then(() => this.createServices(client, config, declaration, analysis))
      .then(() => {
        this.emit(WorkerRunnerEvents.PLATFORM_SERVICES_READY, {
          client,
          config,
          declaration
        });
        return true;
      });
  }

  private checkServicesAlreadyDeployed(config: ResolvedConfig): Promise<boolean> {
    return fetch({
      config,
      method: 'GET',
      pathname: `orga/item/list/${config.appName}`,
      debugName: 'checkServicesAlreadyDeployed'
    }).then(({ content }: { content: any[] }) => content.length > 0);
  }

  private cookWithOnlyQueueServiceAndWorkers(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration,
    analysis: Array<DependencyInjectionAnalysis>
  ): Promise<boolean> {
    this.emit(WorkerRunnerEvents.UPLOADING, {
      client,
      config,
      declaration
    });

    return generateProvisioningContent(config, [Worker, Weak], declaration, Worker)
      .then(({ json }: { json: string }) => createProvisioningArchive(json))
      .then((archive: string) =>
        upload(archive, config)
          .then((recipe: any) => {
            this.emit(WorkerRunnerEvents.UPLOADED, {
              recipe,
              client,
              config,
              declaration
            });
            return this.waitingQueueServiceDeployed(recipe, client, config, declaration, analysis);
          })
          .catch((failure: any) => {
            this.emit(WorkerRunnerEvents.UPLOAD_FAILED, {
              failure,
              client,
              config,
              declaration
            });
            return false;
          })
      );
  }
}
