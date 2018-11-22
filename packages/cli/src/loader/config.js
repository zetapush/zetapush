// Native
const fs = require('fs');
const path = require('path');
// Packages
const cosmiconfig = require('cosmiconfig');
// Local
const { DEFAULTS, log, error, warn, trace, encrypt, decrypt } = require('@zetapush/common');
const { getDeveloperPassword, getDeveloperLogin } = require('../utils/security');
const explorer = cosmiconfig('zeta');

/**
 * Check if ZetaPush config is valid
 * @param {ZetaPushConfig} config
 * @return {boolean}
 */
const isValid = (config = {}) => config.platformUrl && config.developerLogin && config.developerPassword;

/**
 * Check if the .zetarc file is valid from his path
 * @param {string} json
 */
const checkZetarcValidJson = (json) => {
  try {
    JSON.parse(json);
  } catch (e) {
    throw {
      code: `ZETARC_NOT_VALID`,
      message: `The .zetarc file is an invalid JSON, please check it`,
      cause: e
    };
  }
};

/**
 * Load ZetaPush config file
 * @param {Object} command
 * @param {Object} content
 */
const save = (command, content) =>
  new Promise((resolve, reject) => {
    const clean = (dirty, defaults) => {
      return Object.entries(dirty).reduce((cleaned, [property, value]) => {
        if (defaults[property] !== value) {
          cleaned[property] = value;
        }
        return cleaned;
      }, {});
    };
    const filepath = path.join(command.worker, '.zetarc');
    // Encrypt content before
    const encryted = encrypt(content);
    // Do not persist defaults config value
    const cleaned = clean(encryted, { ...DEFAULTS, npmRegistry: DEFAULTS.NPM_REGISTRY_URL });
    log('Save config file', filepath);
    fs.writeFile(filepath, JSON.stringify(cleaned, null, 2), (failure) => {
      if (failure) {
        return reject(failure);
      }
      return resolve(content);
    });
  });

/**
 * Load ZetaPush config from env variables
 * @return {Promise<ZetaPushConfig>}
 */
const fromEnv = async () => {
  trace('Try to load conf from process.env');
  return Promise.resolve({
    platformUrl: process.env.ZP_ZBO_URL,
    appName: process.env.ZP_SANDBOX_ID,
    developerLogin: process.env.ZP_USERNAME,
    developerPassword: process.env.ZP_PASSWORD,
    workerServiceId: process.env.ZP_WORKER_SERVICE_ID,
    npmRegistry: process.env.NPM_REGISTRY,
    TS_NODE_SKIP_IGNORE: process.env.TS_NODE_SKIP_IGNORE
  });
};

/**
 * Load ZetaPush config from cli arguments
 * @return {Promise<ZetaPushConfig>}
 */
const fromCli = async (command) => {
  trace('Try to load conf from cli process.argv');
  return Promise.resolve({
    platformUrl: command.parent.platformUrl,
    appName: command.parent.appName,
    developerLogin: command.parent.developerLogin,
    developerPassword: command.parent.developerPassword,
    workerServiceId: command.parent.ZP_WORKER_SERVICE_ID,
    npmRegistry: command.registry,
    TS_NODE_SKIP_IGNORE: command.skipIgnore
  });
};

/**
 * Default ZetaPush configuration
 * @return {Promise<ZetaPushConfig>}
 */
const fromDefault = async () => {
  trace('Using default values');
  return Promise.resolve({
    platformUrl: DEFAULTS.PLATFORM_URL,
    npmRegistry: DEFAULTS.NPM_REGISTRY_URL,
    TS_NODE_SKIP_IGNORE: DEFAULTS.TS_NODE_SKIP_IGNORE
  });
};

/**
 * Load ZetaPush config from file
 * @param {Object} command
 * @return {Promise<ZetaPushConfig>}
 */
const fromFile = async (command) => {
  trace('Try to load conf from filesystem', command.worker);
  return explorer
    .search(command.worker)
    .then((result) => {
      trace('Configuration loaded from file', command.worker, result);
      return (result && result.config) || {};
    })
    .then((config) => decrypt(config))
    .catch((e) => {
      warn('Failed to load conf from filesystem', command.worker);
      return {};
    });
};

let isTsLoaderRegistered = false;

/**
 * @param {Object} command
 * @param {Boolean} required
 */
const load = async (command, required = true) => {
  log(`Load and merge configuration with this priority order:
      1) command line arguments
      2) environment variables
      3) from file defined in ${command.worker}/.zetarc`);
  let config;

  // Check if the .zetarc file is valid
  checkZetarcValidJson(path.join(command.worker, `.zetarc`));

  try {
    config = merge(await fromCli(command), await fromEnv(), await fromFile(command), await fromDefault());
    trace('merged config', config);
    if (!config.developerLogin) {
      config.developerLogin = await getDeveloperLogin();
    }
    if (!config.developerPassword) {
      config.developerPassword = await getDeveloperPassword();
    }
    if (isValid(config)) {
      trace('config is valid', config);
      return save(command, config);
    }
  } catch (e) {
    error('Error while loading and merging configuration', e);
    throw {
      code: 'CONFIG_LOAD_ERROR',
      message: 'Error while loading and merging configuration',
      cause: e
    };
  }
  trace('config is not valid', config);
  if (required) {
    error('Missing required information');
    throw {
      code: 'CONFIG_MISSING_REQUIRED_INFO',
      message: 'Missing required information',
      config
    };
  }
};

const merge = (...objs) => {
  let merged = {};
  for (let obj of objs) {
    for (let key in obj) {
      if (!merged[key]) {
        merged[key] = obj[key];
      }
    }
  }
  return merged;
};

module.exports = { load, save };
