#!/usr/bin/env node

const { _ } = require('minimist')(process.argv.slice(2));
const cwd = require('resolve-cwd');
const read = require('read-pkg');
const { ServerClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');

/**
 * Alpha numeric dictionary
 */
const DICTIONARY = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Get random id
 * @return {string}
 */
const uuid = (entropy = 7, dictionary = DICTIONARY) => {
  const next = () =>
    dictionary.charAt(Math.floor(Math.random() * dictionary.length));
  return Array.from(Array(entropy)).reduce(
    (previous) => `${previous}${next()}`,
    '',
  );
};

/**
 * Resolve and inject dependencies
 * @param {ServerClient} client
 * @param {class} Api
 */
const di = (client, Api) => {
  const cache = new WeakMap();
  const factory = (Type) => {
    const service = cache.has(Type)
      ? cache.get(Type)
      : cache
          .set(
            Type,
            client.createAsyncService({
              Type,
            }),
          )
          .get(Type);
    return service;
  };
  const parameters = Api.injected.map((Type) => factory(Type));
  const instance = new Api(...parameters);
  return instance;
};

const run = (Api, config) => {
  const resource = `node_js_worker_${uuid()}`;

  config = {
    ...config,
    transports,
    resource,
  };

  console.log('[LOG] Config', config);

  const client = new ServerClient(config);

  const onTerminalSignal = (signal) => {
    console.log('[LOG] Properly disconnect client');
    client.disconnect().then(() => {
      console.log('[LOG] Client properly disconnected');
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
      console.log('[LOG] Connected');
    })
    .then(() => {
      console.log('[LOG] Register Server Task');
      const declaration = di(client, Api);
      client.subscribeTaskServer(declaration);
    })
    .catch((error) => console.error('[ERROR] ZetaPush V3 Error', error));
};

const moduleId = _.length === 1 ? `./${_[0]}` : '.';
const path = cwd(moduleId);
const Api = require(path);

read(moduleId).then(({ zetapush }) => run(Api, zetapush));
