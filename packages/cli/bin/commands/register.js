const path = require('path');
const request = require('request');
const { URL } = require('url');

const { log, error, warn } = require('../utils/log');
const {
  loadZetaPushConfigFile,
  saveZetaPushConfigFile,
} = require('../utils/config');

/**
 * Register an account on ZetaPush platform
 * @param {Object} config
 */
const registerAccount = (config) =>
  new Promise((resolve, reject) => {
    const { platformUrl } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/adm/organization/anonymous`;
    const options = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
      url,
      body: JSON.stringify({}),
    };
    request(options, (failure, response, body) => {
      if (failure) {
        return reject(failure);
      }
      if (response.statusCode !== 200) {
        return reject(response.statusCode);
      }
      try {
        const { login, password, businessId } = JSON.parse(body);
        return resolve({
          developerLogin: login,
          developerPassword: password,
          appName: businessId,
          envName: '',
          platformUrl,
        });
      } catch (failure) {
        return reject(failure);
      }
    });
  });

/**
 * Register an acount on ZetaPush Platform
 * @param {String} target
 * @param {Object} config
 */
const register = (target, config) => {
  log(`Execute command <register>`);

  const pathToConfigFile = path.join(target, '.zetarc');

  loadZetaPushConfigFile(pathToConfigFile)
    .catch(() => {
      warn(`ZetaPush config file not found`);
      return registerAccount(config.parent)
        .then((account) => saveZetaPushConfigFile(pathToConfigFile, account))
        .catch((failure) => {
          error('Register account fail', failure);
          return {
            from: pathToConfigFile,
            content: null,
          };
        });
    })
    .then((loaded) => log(`Config loaded from config file`, loaded));
};

module.exports = register;
