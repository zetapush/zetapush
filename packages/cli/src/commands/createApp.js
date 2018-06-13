const { load, save } = require('../loader/config');
const { info, todo } = require('../utils/log');
const troubleshooting = require('../errors/troubleshooting');

const { createApplication } = require('../utils/createApplication');

/**
 * Create application on ZetaPush platform
 * @param {String} basepath
 * @param {Object} command
 */
const createApp = (basepath, command) =>
  load(basepath, command).then((config) => {
    if (config.appName) {
      info(`Using application defined in configuration: ${config.appName}`);
      return config;
    }
    return createApplication(config).then((credentials) =>
      save(basepath, credentials),
    );
  });

module.exports = createApp;
