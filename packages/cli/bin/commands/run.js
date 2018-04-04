const { uuid } = require('@zetapush/core');
const { ServerClient } = require('@zetapush/server');
const transports = require('@zetapush/cometd/lib/node/Transports');

const di = require('../utils/di');
const { log, error, todo, warn } = require('../utils/log');

const run = (Api, config) => {
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

  client
    .connect()
    .then(() => {
      log(`Connected`);
    })
    .then(() => {
      log(`Resolve Dependency Injection`);
      return di(client, Api);
    })
    .then((declaration) => {
      const DEPLOYMENT_IDS = Api.injected.map(
        (Type) => Type.DEFAULT_DEPLOYMENT_ID,
      );
      todo(`Auto Provisionning`, DEPLOYMENT_IDS);
      return declaration;
    })
    .then((declaration) => {
      const DEPLOYMENT_IDS = Api.injected.map(
        (Type) => Type.DEFAULT_DEPLOYMENT_ID,
      );
      todo(`Check Service Provisionning`, DEPLOYMENT_IDS);
      return declaration;
    })
    .then((declaration) => {
      log(`Register Server Task`);
      return client.subscribeTaskServer(declaration);
    })
    .catch((failure) => error('ZetaPush V3 Error', failure));
};

module.exports = run;
