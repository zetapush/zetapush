const fs = require('fs');
const path = require('path');
const cosmiconfig = require('cosmiconfig');

const { log } = require('../utils/log');
const explorer = cosmiconfig('zeta');

const validated = Symbol('validated');

/**
 * Validate ZetaPush config
 * @param {ZetaPushConfig} config
 * @return {boolean}
 */
const isValid = (config = {}) =>
  config.appName && config.developerLogin && config.developerPassword;

/**
 * Check config is validated
 * @param {ZetaPushConfig} config
 * @return {boolean}
 */
const isValidated = (config = {}) => Boolean(config[validated]);

/**
 * Validate object config
 */
const validate = (config) => {
  if (isValid(config)) {
    config[validated] = true;
  }
  return config;
};

/**
 * Load ZetaPush config file
 * @param {String} basepath
 * @param {Object} content
 */
const save = (basepath, content) =>
  new Promise((resolve, reject) => {
    const filepath = path.join(basepath, '.zetarc');
    log('Save config file', filepath);
    fs.writeFile(filepath, JSON.stringify(content, null, 2), (failure) => {
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
const fromEnv = () => {
  log('Try to load conf from process.env');
  return Promise.resolve(
    validate({
      platformUrl: process.env.ZP_ZBO_URL,
      appName: process.env.ZP_SANDBOX_ID,
      developerLogin: process.env.ZP_USERNAME,
      developerPassword: process.env.ZP_PASSWORD,
      workerServiceId: process.env.ZP_WORKER_SERVICE_ID,
    }),
  );
};

/**
 * Load ZetaPush config from cli arguments
 * @return {Promise<ZetaPushConfig>}
 */
const fromCli = (command) => {
  log('Try to load conf from cli provess.argv');
  return Promise.resolve(
    validate({
      platformUrl: command.parent.apiUrl,
      appName: command.parent.appName,
      developerLogin: command.parent.developerLogin,
      developerPassword: command.parent.developerPassword,
      workerServiceId: command.parent.ZP_WORKER_SERVICE_ID,
    }),
  );
};

/**
 * Load ZetaPush config from file
 * @return {Promise<ZetaPushConfig>}
 */
const fromFile = (basepath) => {
  log('Try to load conf from filesystem');
  return explorer.search(basepath).then(({ config }) => validate(config));
};

/**
 * @param {String} basepath
 * @param {Object} command
 */
const load = (basepath, command) => {
  log('Load conf', basepath);
  return fromEnv()
    .then((config) => (isValidated(config) ? config : fromCli(command)))
    .then((config) => (isValidated(config) ? config : fromFile(basepath)));
};

module.exports = { load, save };
