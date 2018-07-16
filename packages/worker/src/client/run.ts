import * as path from 'path';
import * as os from 'os';
import { WorkerClient, Worker } from './worker';
import { ReflectiveInjector, Weak, Queue } from '@zetapush/platform';
const transports = require('@zetapush/cometd/lib/node/Transports');

import { compress } from '../utils/compress';
import {
  instantiate,
  WorkerDeclaration,
  Config,
  mkdir,
  checkQueueServiceDeployed,
  generateProvisioningFile,
  getDeploymentIdList,
  getRuntimeProvision,
  equals,
  fetch
} from '@zetapush/core';
import { upload, filter, BLACKLIST } from '../utils/upload';
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
  STARTING = 'starting',
  STARTED = 'started',

  RELOADING = 'reloading',
  RELOADED = 'reloaded',

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

export class WorkerRunner extends EventEmitter {
  private client?: WorkerClient;
  private currentDeclaration: WorkerDeclaration;
  private currentInstance?: WorkerInstance;

  constructor(private skipProvisioning: boolean, private skipBootstrap: boolean, private config: Config) {
    super();
  }

  /**
   *
   * @param {Object} client
   * @param {Object} config
   * @param {Object} declaration
   */
  private async start(client: WorkerClient, config: Config, declaration: WorkerDeclaration): Promise<WorkerInstance> {
    return Promise.resolve(instantiate(client, declaration, ReflectiveInjector)).then((declaration) =>
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
   * @fires WorkerRunnerEvents#STARTING
   * @fires WorkerRunnerEvents#STARTED
   * @fires WorkerRunnerEvents#START_FAILED
   * @fires WorkerRunnerEvents#RELOADING
   * @fires WorkerRunnerEvents#RELOADED
   * @fires WorkerRunnerEvents#RELOAD_FAILED
   */
  run(declaration: WorkerDeclaration) {
    console.log('###### B', this.config);
    const config = this.config;

    const client = new WorkerClient({
      ...config,
      transports
    });
    this.client = client;
    this.currentDeclaration = declaration;

    this.emit(WorkerRunnerEvents.BOOTSTRAPING, {
      client,
      config,
      declaration
    });

    // const onTerminalSignal = () => {
    //   warn(`Properly disconnect client`);
    //   client.disconnect().then(() => {
    //     warn(`Client properly disconnected`);
    //     process.exit(0);
    //   });
    // };

    // const TERMINATE_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    // TERMINATE_SIGNALS.forEach((signal) => {
    //   process.on(signal, () => {
    //     onTerminalSignal(signal);
    //   });
    // });

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

    // // Progress
    // const spinner = ora('Starting worker... \n');
    // spinner.start();
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
        // spinner.stop();
        // let previous = getDeploymentIdList(declaration);
        // WorkerLoader.events.on('reload', (reloaded: boolean) => {
        //   spinner.text = `Reloading worker... \n`;
        //   spinner.start();
        //   let next = getDeploymentIdList(reloaded);
        //   const deploymentListHasChange = !equals(previous, next);
        //   const tasks = [];
        //   if (deploymentListHasChange) {
        //     tasks.push(createServices(client, config, reloaded));
        //   }
        //   Promise.all(tasks)
        //     .then(() => {
        //       // Create a new worker instance
        //       const worker = instantiate(client, reloaded, ReflectiveInjector);
        //       instance.setWorker(worker);
        //       // Update previous deployment id list
        //       previous = next;
        //       // Stop spiner
        //       spinner.stop();
        //       info('Worker is up!');
        //     })
        //     .catch(() => {
        //       spinner.stop();
        //       warn('Fail to reload worker');
        //     });
        // });
        const checkBoostrap = () => {
          return new Promise((resolve, reject) => {
            if (!this.skipBootstrap) {
              instance.configure().then((res) => {
                if (res.success == false) {
                  reject(res.result);
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          });
        };
        return checkBoostrap()
          .then(() => {
            console.log('###### C', config);
            this.currentInstance = instance;
            this.emit(WorkerRunnerEvents.STARTED, {
              instance,
              client,
              config,
              declaration
            });
            // info('Worker is up!');
            // if (command.serveFront) {
            //   return createServer(command, config);
            // }
          })
          .catch((err) => {
            this.emit(WorkerRunnerEvents.START_FAILED, {
              failure: err,
              client,
              config,
              declaration
            });
          });
      })
      .catch((failure) => {
        // spinner.stop();
        // error('ZetaPush Celtia Error', failure);
        // troubleshooting.displayHelp(failure);
        // TODO: reaise error instead ?
        this.emit(WorkerRunnerEvents.START_FAILED, {
          failure,
          client,
          config,
          declaration
        });
      });
  }

  async reload(reloaded: WorkerDeclaration) {
    if (!this.client || !this.currentInstance) {
      throw new IllegalStateError(
        'No client or no current worker instance available. Maybe you try to reload a worker that is not running or maybe you forgot to call run() method'
      );
    }
    let previous = getDeploymentIdList(this.currentDeclaration, [Queue]);
    this.emit(WorkerRunnerEvents.RELOADING, {
      client: this.client,
      config: this.config,
      declaration: reloaded
    });
    let next = getDeploymentIdList(reloaded, [Queue]);
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
        const worker = instantiate(this.client, reloaded, ReflectiveInjector);
        this.currentInstance.setWorker(worker);
        // Update previous deployment id list
        this.currentDeclaration = reloaded;
        // previous = next;
        // // Stop spiner
        // spinner.stop();
        // info('Worker is up!');
        this.emit(WorkerRunnerEvents.RELOADED, {
          instance: this.currentInstance,
          client: this.client,
          config: this.config
        });
      })
      .catch((failure) => {
        // spinner.stop();
        // warn('Fail to reload worker');
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

  /**
   * Ask progression during deployment of services
   */
  private waitingQueueServiceDeployed(
    recipe: any,
    client: WorkerClient,
    config: Config,
    declaration: WorkerDeclaration
  ): Promise<boolean> {
    console.log('###### D', config);
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
    // log('Waiting Queue service deploying...');
    return checkQueueServiceDeployed(config, recipeId).then((recipeId: string) => {
      console.log('###### E', this.config);
      this.emit(WorkerRunnerEvents.QUEUE_SERVICE_READY, {
        recipe,
        client,
        config,
        declaration
      });
      return this.connectClientAndCreateServices(client, config, declaration);
    });
  }

  private createServices(client: WorkerClient, config: Config, declaration: WorkerDeclaration) {
    console.log('###### F', config);
    const api = client.createAsyncService({
      Type: Queue
    });

    const { items } = getRuntimeProvision(config, declaration, [Queue]);
    const services = items.map(({ item }) => item);

    // info(`Create services`, services);
    this.emit(WorkerRunnerEvents.CREATED_SERVICES, {
      services,
      client,
      config,
      declaration
    });
    console.log('###### F:services', services);

    return (<any>api).createServices({ services });
  }

  private connectClientAndCreateServices(
    client: WorkerClient,
    config: Config,
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
    // try {
    //   console.log('###### G', config);
    // this.emit(WorkerRunnerEvents.CONNECTING, {
    //   client,
    //   config,
    //   declaration,
    // });
    //   await client.connect();
    // this.emit(WorkerRunnerEvents.CONNECTED, {
    //   client,
    //   config,
    //   declaration,
    // });
    //   await this.createServices(client, config, declaration);
    //   this.emit(WorkerRunnerEvents.PLATFORM_SERVICES_READY, {
    //     client,
    //     config,
    //     declaration,
    //   });
    // } catch (e) {
    //   throw new WorkerConnectionError(
    //     'Failed to connect worker to platform',
    //     e,
    //   );
    // }
  }

  private checkServicesAlreadyDeployed(config: Config): Promise<boolean> {
    console.log('###### H', config);
    return fetch({
      config,
      method: 'GET',
      pathname: `orga/item/list/${config.appName}`
    }).then(({ content }) => content.length > 0);
  }

  private cookWithOnlyQueueService(
    client: WorkerClient,
    config: Config,
    declaration: WorkerDeclaration
  ): Promise<boolean> {
    this.emit(WorkerRunnerEvents.UPLOADING, {
      client,
      config,
      declaration
    });

    console.log('###### I', config);
    const ts = Date.now();
    const root = path.join(os.tmpdir(), String(ts));
    const rootArchive = `${root}.zip`;
    const app = path.join(root, 'app');

    const options = {
      filter: filter(BLACKLIST)
    };

    return mkdir(root)
      .then(() => generateProvisioningFile(app, config, [Worker, Weak]))
      .then(() => compress(root, { ...options, ...{ saveTo: rootArchive } }))
      .then(() =>
        upload(rootArchive, config)
          .then((recipe) => {
            this.emit(WorkerRunnerEvents.UPLOADED, {
              recipe,
              client,
              config,
              declaration
            });
            return this.waitingQueueServiceDeployed(recipe, client, config, declaration);
          })
          .catch((failure) => {
            this.emit(WorkerRunnerEvents.UPLOAD_FAILED, {
              failure,
              client,
              config,
              declaration
            });
            return false;
          })
      );

    // try {
    //   await mkdir(root);
    //   await generateProvisioningFile(app, config, [Worker, Weak]);
    //   await compress(root, { ...options, ...{ saveTo: rootArchive } });
    //   const recipe = await upload(rootArchive, config);
    //   await this.waitingQueueServiceDeployed(
    //     recipe,
    //     client,
    //     config,
    //     declaration,
    //   );
    //   // )
    //   // // TODO: raise error
    //   // .catch((failure: any) => error('Upload failed', failure)),
    //   // );
    // } catch (e) {
    //   throw new UploadError('Failed to upload worker declaration', e);
    // }
  }
}
