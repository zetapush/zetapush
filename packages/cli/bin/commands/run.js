const { uuid } = require('@zetapush/core');
const { WorkerClient } = require('@zetapush/worker');
const transports = require('@zetapush/cometd/lib/node/Transports');

const { instanciate } = require('../utils/di');
const { log, error, todo, warn } = require('../utils/log');
const { mapDeclarationToProvision } = require('../utils/provisionning');

/**
 * Run Worker instance
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const run = (args, basepath, config, declaration) => {
  const resource = `node_js_worker_${uuid()}`;

  const clientConfig = {
    apiUrl: config.platformUrl,
    login: config.developerLogin,
    password: config.developerPassword,
    sandboxId: config.appName,
    transports,
    resource,
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

  log(`Connect to worker with config`, clientConfig);
  client
    .connect()
    .then(() => {
      log(`Connected`);
    })
    .then(() => {
      todo(`Check Service Provisionning`, declaration);
      return declaration;
    })
    .then(() => {
      log(`Resolve Dependency Injection`);
      return instanciate(client, declaration);
    })
    .then((instance) => {
      log(`Register Server Task`);
      return client.subscribeTaskServer(instance, config.workerServiceId);
    })
    .catch((failure) => error('ZetaPush Celtia Error', failure));
};

module.exports = run;
