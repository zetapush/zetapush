const path = require('path');
const fs = require('fs');
const os = require('os');
const compress = require('../utils/compress');
const { uuid } = require('@zetapush/core');
const { WorkerClient } = require('@zetapush/worker');
const transports = require('@zetapush/cometd/lib/node/Transports');

const { instanciate } = require('../utils/di');
const { log, error, todo, warn } = require('../utils/log');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const provisionning = require('../utils/provisionning');
const { getLiveStatus, getRunProgression } = require('../utils/progression');

/**
 * Run Worker instance
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const run = (args, basepath, config, declaration) => {
  const clientConfig = {
    apiUrl: config.platformUrl,
    login: config.developerLogin,
    password: config.developerPassword,
    sandboxId: config.appName,
    transports,
  };

  const client = new WorkerClient(clientConfig);

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

  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const rootArchive = `${root}.zip`;
  const app = path.join(root, 'app');

  const options = {
    each: (filepath) => log('Zipping', filepath),
    filter: filter(BLACKLIST),
  };

  log(`Connect to worker with config`, clientConfig);

  // Check if we need to deploy services
  if (args.skipProvisioning) {
    log(`Skip provisioning`);
    connectAndSubscribeClient(client, config, declaration);
  } else {
    // Deploy all needed services
    mkdir(root).then(() => {
      provisionning(app, config, declaration).then(() => {
        compress(
          root,
          Object.assign({}, options, { saveTo: rootArchive }),
        ).then((res) => {
          log(`Upload 'app' to create services`);
          upload(rootArchive, config)
            .then((recipe) => {
              waitingServicesDeployed(recipe, config, client, declaration);
            })
            .catch((failure) => error('Upload failed', failure));
        });
      });
    });
  }
};

/**
 * Ask progression during deploy of services
 */
function waitingServicesDeployed(recipe, config, client, declaration) {
  log('Uploaded', recipe.recipeId);
  const { recipeId } = recipe;
  if (recipeId === void 0) {
    return error('Missing recipeId', recipe);
  }
  log('Progression');
  getRunProgression(config, recipeId)
    .then((recipeId) => {
      log(`Server is running on ${recipeId}`);
      connectAndSubscribeClient(client, config, declaration);
    })
    .catch((err) => {
      error(`Failed running server`, err);
    });
}

const connectAndSubscribeClient = (client, config, declaration) => {
  client
    .connect()
    .then(() => {
      log(`Connected`);
    })
    .then(() => {
      log(`Resolve Dependency Injection`);
      return instanciate(client, declaration);
    })
    .then((declaration) => {
      log(`Register Worker`);
      return client.subscribeTaskWorker(declaration, config.workerServiceId);
    })
    .catch((failure) => error('ZetaPush Celtia Error', failure));
};

module.exports = run;
