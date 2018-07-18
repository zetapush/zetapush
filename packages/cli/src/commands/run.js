const path = require('path');
const os = require('os');
const ora = require('ora');
const { WorkerClient } = require('@zetapush/worker');
const { Queue } = require('@zetapush/platform');
const transports = require('@zetapush/cometd/lib/node/Transports');

const troubleshooting = require('../errors/troubleshooting');
const WorkerLoader = require('../loader/worker');
const compress = require('../utils/compress');
const { instanciate } = require('../utils/di');
const { equals } = require('../utils/helpers');
const { createServer } = require('../utils/http-server');
const { log, error, warn, info } = require('../utils/log');
const { fetch } = require('../utils/network');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const {
  generateProvisioningFile,
  getDeploymentIdList,
  getRuntimeProvision,
} = require('../utils/provisioning');
const { checkQueueServiceDeployed } = require('../utils/progression');

/**
 *
 * @param {Object} client
 * @param {Object} config
 * @param {Object} declaration
 */
const start = (client, config, declaration) =>
  Promise.resolve(instanciate(client, declaration)).then((declaration) =>
    client.subscribeTaskWorker(declaration, config.workerServiceId),
  );

/**
 * Run Worker instance
 * @param {Object} command
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const run = (command, config, declaration) => {
  const client = new WorkerClient({
    ...config,
    transports,
  });

  const onTerminalSignal = () => {
    warn(`Properly disconnect client`);
    client.disconnect().then(() => {
      warn(`Client properly disconnected`);
      process.exit(0);
    });
  };

  const TERMINATE_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  TERMINATE_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      onTerminalSignal(signal);
    });
  });

  /**
   * Run worker and create services if necessary
   */
  const bootstrap = command.skipProvisioning
    ? connectClientAndCreateServices(client, config, declaration)
    : checkServicesAlreadyDeployed(config).then(
        (deployed) =>
          !deployed
            ? cookWithOnlyQueueService(client, config, declaration)
            : connectClientAndCreateServices(client, config, declaration),
      );

  // Progress
  const spinner = ora('Starting worker... \n');
  spinner.start();

  /**
   * Start worker
   */
  bootstrap
    .then(() => start(client, config, declaration))
    .then((instance) => {
      spinner.stop();
      let previous = getDeploymentIdList(declaration);
      WorkerLoader.events.on('reload', (reloaded) => {
        spinner.text = `Reloading worker... \n`;
        spinner.start();
        let next = getDeploymentIdList(reloaded);
        const deploymentListHasChange = !equals(previous, next);
        const tasks = [];
        if (deploymentListHasChange) {
          tasks.push(createServices(client, config, reloaded));
        }
        Promise.all(tasks)
          .then(() => {
            // Create a new worker instance
            const worker = instanciate(client, reloaded);
            instance.setWorker(worker);
            // Update previous deployment id list
            previous = next;
            // Stop spiner
            spinner.stop();
            info('Worker is up!');
          })
          .catch(() => {
            spinner.stop();
            warn('Fail to reload worker');
          });
      });
      const checkBoostrap = () => {
        return new Promise((resolve, reject) => {
          if (!command.skipProvisioning) {
            instance.configure().then((res) => {
              if (res.success == false) {
                throw new Error(res.result);
              }
              resolve();
            });
          } else {
            resolve();
          }
        });
      };
      checkBoostrap().then(() => {
        info('Worker is up!');
        if (command.serveFront) {
          createServer(command, config);
        }
      });
    })
    .catch((failure) => {
      spinner.stop();
      error('ZetaPush Celtia Error', failure);
      troubleshooting.displayHelp(failure);
    });
};

/**
 * Ask progression during deployment of services
 */
const waitingQueueServiceDeployed = (recipe, client, config, declaration) => {
  log('Uploaded', recipe.recipeId);
  const { recipeId } = recipe;
  if (recipeId === void 0) {
    return error('Missing recipeId', recipe);
  }
  log('Waiting Queue service deploying...');
  return checkQueueServiceDeployed(config, recipeId).then((recipeId) => {
    log(`Queue service ready on ${recipeId}`);
    return connectClientAndCreateServices(client, config, declaration);
  });
};

const createServices = (client, config, declaration) => {
  const api = client.createAsyncService({
    Type: Queue,
  });

  const { items } = getRuntimeProvision(config, declaration);
  const services = items.map(({ item }) => item);

  info(`Create services`, services);

  return api.createServices({ services });
};

const connectClientAndCreateServices = (client, config, declaration) =>
  client
    .connect()
    .then(() => log(`Connected`))
    .then(() => createServices(client, config, declaration))
    .then(() => log(`Platform services created`));

const checkServicesAlreadyDeployed = (config) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/item/list/${config.appName}`,
  }).then(({ content }) => content.length > 0);

const cookWithOnlyQueueService = (client, config, declaration) => {
  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const rootArchive = `${root}.zip`;
  const app = path.join(root, 'app');

  const options = {
    filter: filter(BLACKLIST),
  };

  return mkdir(root)
    .then(() => generateProvisioningFile(app, config))
    .then(() => compress(root, { ...options, ...{ saveTo: rootArchive } }))
    .then(() =>
      upload(rootArchive, config)
        .then((recipe) =>
          waitingQueueServiceDeployed(recipe, client, config, declaration),
        )
        .catch((failure) => error('Upload failed', failure)),
    );
};

module.exports = run;
