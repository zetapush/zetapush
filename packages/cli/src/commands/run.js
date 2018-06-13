const path = require('path');
const os = require('os');
const request = require('request');
const ora = require('ora');
const { URL } = require('url');
const { WorkerClient } = require('@zetapush/worker');
const { Queue } = require('@zetapush/platform');
const transports = require('@zetapush/cometd/lib/node/Transports');

const compress = require('../utils/compress');
const { on } = require('../loader/worker');
const { instanciate } = require('../utils/di');
const { log, error, warn, info } = require('../utils/log');
const { fetch } = require('./network');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const {
  generateProvisioningFile,
  getRuntimeProvision,
} = require('../utils/provisioning');
const { checkQueueServiceDeployed } = require('../utils/progression');

/**
 * Run Worker instance
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const run = (args, basepath, config, declaration) => {
  const client = new WorkerClient({
    ...config,
    transports,
  });

  // Progress
  const spinner = ora('Starting worker... \n');
  spinner.start();

  const onTerminalSignal = (signal) => {
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
  if (args.skipProvisioning) {
    createServicesAndRunWorker(client, config, declaration)
      .then(() => {
        log(`Resolve Dependency Injection`);
        return instanciate(client, declaration);
      })
      .then((declaration) => {
        return client.subscribeTaskWorker(declaration, config.workerServiceId);
      })
      .then((unregister) => {
        spinner.stop();
        info(`Worker is up !`);
      })
      .catch((failure) => error('ZetaPush Celtia Error', failure));
  } else {
    checkServicesAlreadyDeployed(config).then((deployed) => {
      if (!deployed) {
        log(`Queue service not already deployed`);
        cookWithOnlyQueueService(config, client, declaration, spinner);
      } else {
        // Queue service already exists
        createServicesAndRunWorker(client, config, declaration)
          .then(() => {
            log(`Resolve Dependency Injection`);
            return instanciate(client, declaration);
          })
          .then((declaration) => {
            return client.subscribeTaskWorker(
              declaration,
              config.workerServiceId,
            );
          })
          .then((unregister) => {
            spinner.stop();
            info(`Worker is up !`);
          })
          .catch((failure) => error('ZetaPush Celtia Error', failure));
      }
    });
  }
};

/**
 * Ask progression during deployment of services
 */
const waitingQueueServiceDeployed = (
  recipe,
  config,
  client,
  declaration,
  spinner,
) => {
  log('Uploaded', recipe.recipeId);
  const { recipeId } = recipe;
  if (recipeId === void 0) {
    return error('Missing recipeId', recipe);
  }
  log('Waiting Queue service deploying...');
  checkQueueServiceDeployed(config, recipeId).then((recipeId) => {
    log(`Queue service ready on ${recipeId}`);
    createServicesAndRunWorker(client, config, declaration)
      .then(() => {
        log(`Resolve Dependency Injection`);
        return instanciate(client, declaration);
      })
      .then((declaration) => {
        log(`Register Worker`);
        return client.subscribeTaskWorker(declaration, config.workerServiceId);
      })
      .then((unregister) => {
        spinner.stop();
        info(`Worker is up !`);
      })
      .catch((failure) => error('ZetaPush Celtia Error', failure));
  });
};

const createServicesAndRunWorker = async (client, config, declaration) => {
  await client.connect();
  log(`Connected`);

  const api = client.createAsyncService({
    Type: Queue,
  });

  const { items } = getRuntimeProvision(config, declaration);
  const services = items.map(({ item }) => item);

  await api.createServices({ services });
};

const checkServicesAlreadyDeployed = (config) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/item/list/${config.appName}`,
  }).then(({ content }) => content.length > 0);

const cookWithOnlyQueueService = (config, client, declaration, spinner) => {
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
    .then(() => {
      log(`Upload 'app' to create queue service`);
      upload(rootArchive, config)
        .then((recipe) => {
          waitingQueueServiceDeployed(
            recipe,
            config,
            client,
            declaration,
            spinner,
          );
        })
        .catch((failure) => error('Upload failed', failure));
    });
};

module.exports = run;
