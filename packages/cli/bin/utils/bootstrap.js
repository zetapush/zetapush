const path = require('path');
const cwd = require('resolve-cwd');
const read = require('read-pkg');

const { loadZetaPushConfigFile } = require('./config');
const { log, error } = require('./log');
/**
 * @typedef ZetaPushConfig
 * @property {String} platformUrl
 * @property {String} appName
 * @property {String} developerLogin
 * @property {String} developerPassword
 * @property {String} workerServiceId
 */

const validated = Symbol('validated');

/**
 * Validate object config
 */
const validateConfig = (config) => {
  if (isValidConfig(config)) {
    config[validated] = true;
  }
  return config;
};

/**
 * Remove falsy value from give map
 * @param {Object} map
 * @return {Object}
 */
const clean = (map) =>
  Object.entries(map)
    .filter(([property, value]) => Boolean(value))
    .reduce(
      (cleaned, [property, value]) => ((cleaned[property] = value), cleaned),
      {},
    );

/**
 * Merge target and inherited map into a new mapped object
 * @param {Object} target
 * @param {Object} inherited
 * @return {Object}
 */
const merge = (target, inherited) =>
  Object.assign({}, clean(target), clean(inherited));

/**
 * Validate ZetaPush config
 * @param {ZetaPushConfig} config
 * @return {boolean}
 */
const isValidConfig = (config = {}) =>
  config.appName && config.developerLogin && config.developerPassword;

/**
 * Load ZetaPush config from env variables
 * @param {ZetaPushConfig} inherited
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromEnv = (inherited) =>
  Promise.resolve(
    merge(
      {
        platformUrl: process.env.ZP_ZBO_URL,
        appName: process.env.ZP_SANDBOX_ID,
        developerLogin: process.env.ZP_USERNAME,
        developerPassword: process.env.ZP_PASSWORD,
        workerServiceId: process.env.ZP_WORKER_SERVICE_ID,
      },
      inherited,
    ),
  );

/**
 * Load ZetaPush config from cli arguments
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromCliArgs = (inherited, command) =>
  Promise.resolve(
    merge(
      {
        platformUrl: command.parent.apiUrl,
        appName: command.parent.appName,
        developerLogin: command.parent.developerLogin,
        developerPassword: command.parent.developerPassword,
        workerServiceId: command.parent.ZP_WORKER_SERVICE_ID,
      },
      inherited,
    ),
  );

/**
 * @param {ZetaPushConfig} inherited
 * @param {String} folder
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromConfigFile = (inherited, folder) =>
  loadZetaPushConfigFile(path.join(folder, '.zetarc'));

/**
 * Load ZetaPush config from package.json
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromPackage = (inherited, folder) =>
  read(folder).then(({ zetapush }) => merge(zetapush, inherited));

/**
 * Notify ZetaPush config loaded from a given source
 * @param {ZetaPushConfig} config
 * @param {String} source
 * @return {Promise<ZetaPushConfig>}
 */
const notifyLoadedConfig = (config, source = 'process.env') => {
  log(`Config loaded from ${source}`);
  return Promise.resolve(config);
};

/**
 * Notify ZetaPush config loaded from package.json
 * @throws {Error}
 */
const notifyInvalidConfig = () => {
  throw new Error('Unable to load deploy config');
};

/**
 * Load worker config from filepath
 * @param {String} folder
 * @param {Object} command
 * @return {Promise<{ Api: Function, zetapush: ZetaPushConfig}>}
 */
const bootstrap = (folder, command) => {
  const id = cwd(folder);
  const Api = require(id);
  return loadFromCliArgs({}, command)
    .then(
      (config) =>
        isValidConfig(config)
          ? notifyLoadedConfig(config, 'process.argv')
          : loadFromEnv(config),
    )
    .then(
      (config) =>
        isValidConfig(config)
          ? notifyLoadedConfig(config, 'process.env')
          : loadFromConfigFile(config, folder),
    )
    .then(
      (config) =>
        isValidConfig(config)
          ? notifyLoadedConfig(config, '.zetarc')
          : loadFromPackage(config, folder),
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
