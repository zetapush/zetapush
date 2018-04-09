const request = require('request');
const path = require('path');
const fs = require('fs');
const os = require('os');
const zip = require('zip-dir');
const FormData = require('form-data');
const concat = require('concat-stream');
const { URL } = require('url');
const ProgressBar = require('ascii-progress');

const { log, error } = require('../utils/log');

const progression = {};

const getProgress = (config, recipeId) =>
  new Promise((resolve, reject) => {
    log('getProgress', config, recipeId);
    const url = new URL(config.apiUrl);
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: config.login,
          password: config.password,
        }),
      },
      method: 'GET',
      url: `${url.protocol}//${url.hostname}:${
        url.port
      }/zbo/orga/recipe/status/${config.sandboxId}/${recipeId}`,
    };
    request(options, (err, response, body) => {
      if (err) {
        reject(err);
        return error('Get Progress failed:', err);
      }
      log('Progress successful', body);
      resolve(JSON.parse(body));
    });
  });

const run = (target, config) => {
  target = path.isAbsolute(target)
    ? target
    : path.resolve(process.cwd(), target);
  log(`Push your code`, target);
  const saveToFilePath = path.join(os.tmpdir(), `${config.sandboxId}.zip`);
  const options = {
    each: (path) => log('Zip Element', path),
    filter: (path, stat) => !path.includes('node_modules'),
    saveTo: saveToFilePath,
  };
  const progress = new ProgressBar({
    width: 20,
  });
  zip(target, options, (err, buffer) => {
    log(`Zip your code`, saveToFilePath);
    if (err) {
      return error('zip', err);
    }
    const url = new URL(config.apiUrl);
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: config.login,
          password: config.password,
        }),
      },
      method: 'POST',
      url: `${url.protocol}//${url.hostname}:${url.port}/zbo/orga/recipe/cook`,
      formData: {
        businessId: config.sandboxId,
        description: config.sandboxId,
        file: fs.createReadStream(saveToFilePath),
      },
    };
    request(options, (err, response, body) => {
      if (err) {
        return error('Upload failed:', err);
      }
      if (response.statusCode !== 200) {
        return error('Upload failed:', response.statusCode, body);
      }
      log('Upload successful', body);
      const { recipeId } = JSON.parse(body);
      (async function check() {
        const { checks, deploys, success, finished } = await getProgress(
          config,
          recipeId,
        );
        progress.tick(1);
        if (!finished) {
          setTimeout(check, 1000);
        }
      })();
    });
  });
};

module.exports = run;
