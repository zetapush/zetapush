const { load, save } = require('../loader/config');
const { info } = require('../utils/log');

const { createApplication } = require('../utils/createApplication');

/**
 * Create application on ZetaPush platform
 * @param {Object} command
 */
const createApp = (command) =>
  load(command).then((config) => {
    if (config.appName) {
      info(`Using application defined in configuration: ${config.appName}`);
      return config;
    }
    return createApplication(config).then((credentials) =>
      save(command, credentials),
    );
  });

module.exports = createApp;
