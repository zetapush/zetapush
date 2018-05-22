const path = require('path');
const request = require('request');
const { URL } = require('url');

const { log, error } = require('../utils/log');
const {
  loadZetaPushConfigFile,
  saveZetaPushConfigFile,
} = require('../utils/config');

/**
 * Create an account on ZetaPush platform
 * @param {Object} config
 */
const createAccount = (config) =>
  new Promise((resolve, reject) => {
    const { platformUrl } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/adm/organization/anonymous`;
    log(`will request ${url}`);
    const options = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
      url,
      body: JSON.stringify({}),
    };
    // log('Get progresssion', url);
    request(options, (failure, response, body) => {
      if (failure) {
        reject(failure);
        return error('Create account failed', failure);
      }
      if (response.statusCode !== 200) {
        reject(response.statusCode);
        return error('Create account failed', response.statusCode, body);
      }
      try {
        const { login, password, businessId } = JSON.parse(body);
        resolve({
          developerLogin: login,
          developerPassword: password,
          appName: businessId,
          envName: '',
          platformUrl,
        });
      } catch (failure) {
        reject(failure);
        return error('Create account failed', failure);
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
    .catch(() =>
      createAccount(config.parent)
        .then((account) => saveZetaPushConfigFile(pathToConfigFile, account))
        .catch((failure) => {
          error('createAccount', failure);
          return {
            from: pathToConfigFile,
            content: null,
          };
        }),
    )
    .then((loaded) => log(`Config loaded from config file`, loaded));
};

module.exports = register;
