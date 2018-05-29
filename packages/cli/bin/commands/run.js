const path = require('path');
const fs = require('fs');
const os = require('os');
const compress = require('../utils/compress');
const { uuid } = require('@zetapush/core');
const { ServerClient } = require('@zetapush/server');
const transports = require('@zetapush/cometd/lib/node/Transports');

const di = require('../utils/di');
const { log, error, todo, warn } = require('../utils/log');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const provisionning = require('../utils/provisionning');
const { getLiveStatus, getRunProgression } = require('../utils/progression');

/**
 * Run Worker instance
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {Function} Worker
 */
const run = (args, basepath, config, Worker) => {
  const resource = `node_js_worker_${uuid()}`;

  const clientConfig = {
    apiUrl: config.platformUrl,
    login: config.developerLogin,
    password: config.developerPassword,
    sandboxId: config.appName,
    transports,
    resource,
  };

  const client = new ServerClient(clientConfig);

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

  // Deploy all needed services
  mkdir(root).then(() => {
    provisionning(app, config, Worker).then(() => {
      compress(root, Object.assign({}, options, { saveTo: rootArchive })).then(
        (res) => {
          log(`Upload 'app' to create services`);
          upload(rootArchive, config)
            .then((recipe) => {
              waitingServicesDeployed(recipe, config, client, Worker);
            })
            .catch((failure) => error('Upload failed', failure));
        },
      );
    });
  });
};

/**
 * Create the 'app' file that describe the services
 */
function createTempoAppFile(provision, root) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(root, 'app');
    const json = JSON.stringify(provision);
    fs.mkdirSync(root);

    fs.writeFile(filepath, json, (failure) => {
      if (failure) {
        reject(failure);
        return error('provisionning', failure);
      }
      log(`Path app`, filepath);
      resolve({ filepath, provision });
    });
  });
}

/**
 * Ask progression during deploy of services
 */
function waitingServicesDeployed(recipe, config, client, worker) {
  log('Uploaded', recipe.recipeId);
  const { recipeId } = recipe;
  if (recipeId === void 0) {
    return error('Missing recipeId', recipe);
  }
  log('Progression');
  getRunProgression(config, recipeId)
    .then((recipeId) => {
      log(`Server is running on ${recipeId}`);

      client
        .connect()
        .then(() => {
          log(`Connected`);
        })
        .then(() => {
          log(`Resolve Dependency Injection`);
          return di(client, worker);
        })
        .then((declaration) => {
          log(`Register Server Task`);
          return client.subscribeTaskServer(
            declaration,
            config.workerServiceId,
          );
        })
        .catch((failure) => error('ZetaPush Celtia Error', failure));
    })
    .catch((err) => {
      error(`Failed running server`, err);
    });
}

module.exports = run;
