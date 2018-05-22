const { uuid } = require('@zetapush/core');
const { ServerClient } = require('@zetapush/server');
const transports = require('@zetapush/cometd/lib/node/Transports');

const di = require('../utils/di');
const { log, error, todo, warn } = require('../utils/log');
const { mapInjectedToProvision } = require('../utils/provisionning');

const run = (type, target, config, Api) => {
  log(`Execute command <run> ${type} ${target}`);

  const resource = `node_js_worker_${uuid()}`;

  config = {
    ...config,
    transports,
    resource,
  };

  const client = new ServerClient(config);

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

  log(`Connect worker`);
  client
    .connect()
    .then(() => {
      log(`Connected`);
    })
    .then((declaration) => {
      const { injected = [] } = Api;
      const { items } = mapInjectedToProvision(config, injected);
      todo(`Check Service Provisionning`, items);
      return declaration;
    })
    .then(() => {
      log(`Resolve Dependency Injection`);
      return di(client, Api);
    })
    .then((declaration) => {
      log(`Register Server Task`);
      return client.subscribeTaskServer(declaration, config.workerServiceId);
    })
    .catch((failure) => error('ZetaPush V3 Error', failure));
};

module.exports = run;
