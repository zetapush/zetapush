import { WorkerClient, Worker, WorkerInstanceFactory } from './worker';
import { Provider } from '@zetapush/core';
import { Weak, Queue } from '@zetapush/platform-legacy';
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
  trace
} from '@zetapush/common';
import { EventEmitter } from 'events';
import { WorkerInstance } from '../utils/worker-instance';

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
  private currentInstance?: WorkerInstance;

  constructor(
    private skipProvisioning: boolean,
    private skipBootstrap: boolean,
    private config: ResolvedConfig,
    private transports: any[],
    private workerInstanceFactory?: WorkerInstanceFactory,
    private customProviders?: Provider[]
  ) {
    super();
  }

  /**
   *
   * @param {Object} client
   * @param {Object} config
   * @param {Object} declaration
   */
  private async start(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration
  ): Promise<WorkerInstance> {
    return Promise.resolve(instantiate(client, declaration, this.customProviders || [])).then((declaration) =>
      client.subscribeTaskWorker(declaration, config.workerServiceId)
    );
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
      const config = this.config;

      const clientConfig: any = config;
      const client = new WorkerClient(
        {
          ...clientConfig,
          transports: this.transports
        },
        this.workerInstanceFactory
      );
      this.client = client;
      this.currentDeclaration = declaration;

      this.emit(WorkerRunnerEvents.BOOTSTRAPING, {
        client,
        config,
        declaration
      });

      /**
       * Run worker and create services if necessary
       */
      const bootstrap = this.skipProvisioning
        ? this.connectClientAndCreateServices(client, config, declaration)
        : this.checkServicesAlreadyDeployed(config).then(
            (deployed: boolean) =>
              !deployed
                ? this.cookWithOnlyQueueService(client, config, declaration)
                : this.connectClientAndCreateServices(client, config, declaration)
          );

      this.emit(WorkerRunnerEvents.STARTING, {
        client,
        config,
        declaration
      });

      /**
       * Start worker
       */
      bootstrap
        .then(() => this.start(client, config, declaration))
        .then((instance) => {
          this.currentInstance = instance;
        })
        .then(() => this.checkApplicationBootstrap())
        .then(() => {
          if (!this.currentInstance) {
            throw new IllegalStateError(
              'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
            );
          }
          const instance = this.currentInstance;
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
    });
  }

  async reload(reloaded: WorkerDeclaration) {
    if (!this.client || !this.currentInstance) {
      throw new IllegalStateError(
        'No client or no current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }
    let previous = getDeploymentIdList(this.currentDeclaration, this.customProviders || [], [Queue]);
    this.emit(WorkerRunnerEvents.RELOADING, {
      client: this.client,
      config: this.config,
      declaration: reloaded
    });
    let next = getDeploymentIdList(reloaded, this.customProviders || [], [Queue]);
    const deploymentListHasChange = !equals(previous, next);
    const tasks = [];
    if (deploymentListHasChange) {
      tasks.push(this.createServices(this.client, this.config, reloaded));
    }
    return Promise.all(tasks)
      .then(() => {
        if (!this.currentInstance) {
          throw new IllegalStateError(
            'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
          );
        }
        // Create a new worker instance
        const worker = instantiate(this.client, reloaded, this.customProviders || []);
        this.currentInstance.setWorker(worker);
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
      });
  }

  destroy() {
    this.removeAllListeners();
  }

  private checkApplicationBootstrap() {
    return new Promise((resolve, reject) => {
      if (!this.currentInstance) {
        throw new IllegalStateError(
          'No current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
        );
      }
      const instance = this.currentInstance;
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
    declaration: WorkerDeclaration
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
      return this.connectClientAndCreateServices(client, config, declaration);
    });
  }

  private async createServices(client: WorkerClient, config: ResolvedConfig, declaration: WorkerDeclaration) {
    const api = client.createAsyncService({
      Type: Queue
    });

    const { items } = getRuntimeProvision(config, declaration, this.customProviders || [], [Queue]);
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
    declaration: WorkerDeclaration
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
      .then(() => this.createServices(client, config, declaration))
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

  private cookWithOnlyQueueService(
    client: WorkerClient,
    config: ResolvedConfig,
    declaration: WorkerDeclaration
  ): Promise<boolean> {
    this.emit(WorkerRunnerEvents.UPLOADING, {
      client,
      config,
      declaration
    });

    return generateProvisioningContent(config, [Worker, Weak])
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
            return this.waitingQueueServiceDeployed(recipe, client, config, declaration);
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
