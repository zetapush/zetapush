const cwd = require('resolve-cwd');
const read = require('read-pkg');

const { log, error } = require('./log');

/**
 * @typedef ZetaPushConfig
 * @property {String} apiUrl
 * @property {String} sandboxId
 * @property {String} login
 * @property {String} password
 */

/**
 * Validate ZetaPush config
 * @param {ZetaPushConfig} config
 * @return {boolean}
 */
const isValidConfig = (config = {}) =>
  config.apiUrl && config.sandboxId && config.login && config.password;

/**
 * Load ZetaPush config from env variables
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromEnv = () =>
  Promise.resolve({
    apiUrl: process.env.ZETAPUSH_API_URL,
    sandboxId: process.env.ZETAPUSH_SANDBOX_ID,
    login: process.env.ZETAPUSH_LOGIN,
    password: process.env.ZETAPUSH_PASSWORD,
  });

/**
 * Load ZetaPush config from package.json
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromPackage = (path) => read(path).then(({ zetapush }) => zetapush);

/**
 * Load ZetaPush config from package.json
 * @return {Promise<ZetaPushConfig>}
 */
const notifyLoadedConfig = (config, source = 'process.env') => {
  log(`Config loaded from ${source}`);
  return Promise.resolve(config);
};

/**
 * Ra
 * @throws {Error}
 */
const notifyInvalidConfig = () => {
  throw new Error('Unable to load deploy config');
};

/**
 * Load worker config from filepath
 * @param {String} id
 * @return {Promise<{ Api: Function, zetapush: ZetaPushConfig}>}
 */
const bootstrap = (path) => {
  const id = cwd(path);
  const Api = require(id);
  return loadFromEnv()
    .then(
      (config) =>
        isValidConfig(config)
          ? notifyLoadedConfig(config, 'process.env')
          : loadFromPackage(path),
    )
    .then(
      (config) =>
        isValidConfig(config)
          ? notifyLoadedConfig(config, 'package.json')
          : notifyInvalidConfig(config),
    )
    .then((zetapush) => ({
      Api,
      zetapush,
    }));
};

module.exports = bootstrap;
