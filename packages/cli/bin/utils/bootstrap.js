const cwd = require('resolve-cwd');
const read = require('read-pkg');
const fs = require('fs');

const { log, error } = require('./log');

/**
 * @typedef ZetaPushConfig
 * @property {String} apiUrl
 * @property {String} sandboxId
 * @property {String} login
 * @property {String} password
 */

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
const isValidConfig = (config = {}, command) => {
  return (
    command == 'new' ||
    (config.apiUrl && config.sandboxId && config.login && config.password)
  );
};

/**
 * Load ZetaPush config from env variables
 * @param {ZetaPushConfig} inherited
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromEnv = (inherited) =>
  Promise.resolve(
    merge(
      {
        apiUrl: process.env.ZP_ZBO_URL,
        sandboxId: process.env.ZP_SANDBOX_ID,
        login: process.env.ZP_USERNAME,
        password: process.env.ZP_PASSWORD,
      },
      inherited,
    ),
  );

/**
 * Load ZetaPush config from cli arguments
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromCli = (inherited, command) =>
  Promise.resolve(
    merge(
      {
        apiUrl: command.parent.apiUrl,
        sandboxId: command.parent.sandboxId,
        login: command.parent.login,
        password: command.parent.password,
        frontOnly: command.parent.frontOnly,
      },
      inherited,
    ),
  );

/**
 * Load ZetaPush config from package.json
 * @return {Promise<ZetaPushConfig>}
 */
const loadFromPackage = (inherited, path) => {
  if (fs.existsSync(path + 'package.json')) {
    read(path).then(({ zetapush }) => merge(zetapush, inherited));
  }
};

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
 * @param {String} id
 * @param {Object} command
 * @return {Promise<{ Api: Function, zetapush: ZetaPushConfig}>}
 */
const bootstrap = (path, command) => {
  let id;
  let Api;

  if (fs.existsSync(path + 'package.json')) {
    id = cwd(path);
    Api = require(id);
  }

  return loadFromCli({}, command)
    .then(
      (config) =>
        isValidConfig(config, command.name())
          ? notifyLoadedConfig(config, 'process.argv')
          : loadFromEnv(config),
    )
    .then(
      (config) =>
        isValidConfig(config, command.name())
          ? notifyLoadedConfig(config, 'process.env')
          : loadFromPackage(config, path),
    )
    .then(
      (config) =>
        isValidConfig(config, command.name()) || command.name() == 'new'
          ? notifyLoadedConfig(config, 'package.json')
          : notifyInvalidConfig(config),
    )
    .then((zetapush) => ({
      Api,
      zetapush,
    }));
};

module.exports = bootstrap;
