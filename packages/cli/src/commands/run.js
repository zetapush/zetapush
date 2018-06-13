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
const { log, error, warn, info, todo } = require('../utils/log');
const { fetch } = require('../utils/network');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const {
  generateProvisioningFile,
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
  const bootstrap = args.skipProvisioning
    ? connectClientAndCreateServices(config, client, declaration)
    : checkServicesAlreadyDeployed(config).then(
        (deployed) =>
          !deployed
            ? cookWithOnlyQueueService(config, client, declaration)
            : connectClientAndCreateServices(client, config, declaration),
      );

  /**
   * Start worker
   */
  bootstrap
    .then(() => start(client, config, declaration))
    .then((instance) => {
      spinner.stop();
      WorkerLoader.events.on('reload', (reloaded) => {
        const worker = instanciate(client, reloaded);
        todo('Support new injected platforme services');
        instance.setWorker(worker);
        info('Update worker instance');
      });
      info('Worker is up!');
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
const waitingQueueServiceDeployed = (recipe, config, client, declaration) => {
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

const connectClientAndCreateServices = async (client, config, declaration) => {
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

const cookWithOnlyQueueService = (config, client, declaration) => {
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
          waitingQueueServiceDeployed(recipe, config, client, declaration),
        )
        .catch((failure) => error('Upload failed', failure)),
    );
};

module.exports = run;
