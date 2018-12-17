const { info } = require('@zetapush/common');
const { setLogsConfiguration, getCurrentLogsConfig } = require('../utils/log');
const { load } = require('../loader/config');

const config = (command) =>
  load(command).then((config) => {
    var pathArray = config.platformUrl.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var platformUrl = protocol + '//' + host;

    if (command.get) {
      // We get to display current config
      info(`Get current configuration for application : ${config.appName}`);

      getCurrentLogsConfig(config.appName, config.developerLogin, config.developerPassword, platformUrl).then(
        (result) => {
          info(`Current logs config : \n`, result.data);
        }
      );
    } else {
      if (config.appName) {
        info(`Set configuration for application : ${config.appName}`);

        setLogsConfiguration(config.appName, config.developerLogin, config.developerPassword, command.logs, platformUrl)
          .then((result) => {
            if (result.status === 200) {
              info(`Logs configured with ${command.logs} mode`);
            }
          })
          .catch((err) => {
            info(`Your application has not been configured. Check if it's really deployed`, err);
          });
      } else {
        info(`No application is specified`);
      }
    }
  });

module.exports = config;
