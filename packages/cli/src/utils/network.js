const { URL } = require('url');
const request = require('request');

const { log, debugObject } = require('./log');

const fetch = ({ anonymous = false, body, config, method = 'GET', pathname }) =>
  new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8'
    };
    if (!anonymous) {
      const { developerLogin, developerPassword } = config;
      headers['X-Authorization'] = JSON.stringify({
        username: developerLogin,
        password: developerPassword
      });
    }
    const { platformUrl } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/${pathname}`;
    const options = {
      body,
      headers,
      method,
      url
    };
    log(method, url, body);
    request(options, (failure, response, body) => {
      debugObject('fetch', { request: options }, { failure }, { response }, { body });
      if (failure) {
        log(method, url, failure);
        return reject({ failure, request: options });
      }
      if (response.statusCode !== 200) {
        log(method, url, response);
        return reject({
          response,
          statusCode: response.statusCode,
          body,
          request: options,
          config
        });
      }
      try {
        const parsed = JSON.parse(body);
        return resolve(parsed);
      } catch (failure) {
        log(method, url, failure);
        return reject({
          failure,
          statusCode: response.statusCode,
          body,
          request: options,
          config
        });
      }
    });
  });

module.exports = { fetch };
