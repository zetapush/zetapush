const { URL } = require('url');
const request = require('request');

const { log, error } = require('./log');

const fetch = ({ body, config, method = 'GET', pathname }) =>
  new Promise((resolve, reject) => {
    const { developerLogin, developerPassword, platformUrl } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/${pathname}`;
    const options = {
      body,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method,
      url,
    };
    log(method, url, body);
    request(options, (failure, response, body) => {
      if (failure) {
        error(method, url, failure);
        return reject(failure);
      }
      if (response.statusCode !== 200) {
        error(method, url, response);
        return reject(response);
      }
      try {
        const parsed = JSON.parse(body);
        return resolve(parsed);
      } catch (failure) {
        error(method, url, failure);
        return reject(failure);
      }
    });
  });

module.exports = { fetch };
