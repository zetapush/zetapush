const { load, save } = require('../loader/config');
const { info, todo } = require('../utils/log');

const { createApplication } = require('../utils/createApplication');

/**
 * Create application on ZetaPush platform
 * @param {String} basepath
 * @param {Object} command
 */
const createApp = (basepath, command) =>
  load(basepath, command)
    .then((config) => {
      if (config.appName) {
        info(`Application already exists: ${config.appName}`);
        return config;
      }
      return createApplication(config).then((credentials) =>
        save(basepath, credentials),
      );
    })
    .catch((failure) => todo('Catch createApp errors', failure));

module.exports = createApp;
