const request = require('request');
const { URL } = require('url');

const { load, save } = require('../loader/config');
const { log } = require('../utils/log');

/**
 * Register an account on ZetaPush platform
 * @param {Object} config
 */
const registerAccount = (config) =>
  new Promise((resolve, reject) => {
    log('Register developer account');
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
 * @param {String} basepath
 * @param {Object} command
 *
 */
const register = (basepath, command) =>
  load(basepath, command).catch(() =>
    registerAccount(command.parent).then((account) => save(basepath, account)),
  );

module.exports = register;
