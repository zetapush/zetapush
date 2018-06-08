const { URL } = require('url');
const request = require('request');

const { log, error } = require('./log');

const fetch = ({ anonymous = false, body, config, method = 'GET', pathname }) =>
  new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    if (!anonymous) {
      const { developerLogin, developerPassword } = config;
      headers['X-Authorization'] = JSON.stringify({
        username: developerLogin,
        password: developerPassword,
      });
    }
    const { platformUrl } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/${pathname}`;
    const options = {
      body,
      headers,
      method,
      url,
    };
    log(method, url, body);
    request(options, (failure, response, body) => {
      if (failure) {
        return reject(failure);
      }
      if (response.statusCode !== 200) {
        return reject(response);
      }
      try {
        const parsed = JSON.parse(body);
        return resolve(parsed);
      } catch (failure) {
        return reject(failure);
      }
    });
  });

module.exports = { fetch };
