const path = require('path');
const fs = require('fs');
const os = require('os');
const request = require('request');
const FormData = require('form-data');
const { URL } = require('url');
const ProgressBar = require('ascii-progress');

const { log, error } = require('../utils/log');
const compress = require('../utils/compress');
const { mapInjectedToProvision } = require('../utils/provisionning');

/**
 * Common blacklisted pattern
 * @type {String[]}
 */
const BLACKLIST = ['node_modules', '.DS_Store', '.git'];

/**
 * Get a blacklist based filter function
 * @param {String[]} blacklist
 */
const filter = (blacklist) => (filepath, stat) =>
  blacklist.reduce(
    (filtered, check) => filtered && !filepath.includes(check),
    true,
  );

/**
 * Get deployment progression for a given recipe id (aka deployment token)
 * @param {Object} config
 * @param {String} recipeId
 */
const getProgress = (config, recipeId) =>
  new Promise((resolve, reject) => {
    const { protocol, hostname, port } = new URL(config.apiUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/status/${
      config.sandboxId
    }/${recipeId}`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: config.login,
          password: config.password,
        }),
      },
      method: 'GET',
      url,
    };
    // log('Get progresssion', url);
    request(options, (failure, response, body) => {
      if (failure) {
        reject(failure);
        return error('Get progresssion failed', failure);
      }
      if (response.statusCode !== 200) {
        reject(response.statusCode);
        return error('Get progresssion failed', response.statusCode, body);
      }
      // log('Get progresssion successful', body);
      resolve(JSON.parse(body));
    });
  });

/**
 * Generate a normalized file use by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 */
const provisionning = (filepath, config, Api) =>
  new Promise((resolve, reject) => {
    const { injected = [] } = Api;
    const provision = mapInjectedToProvision(config, injected);
    const json = JSON.stringify(provision);
    fs.writeFile(filepath, json, (failure) => {
      if (failure) {
        reject(failure);
        return error('provisionning', failure);
      }
      resolve({ filepath, provision });
    });
  });

/**
 * Generate an archive (.zip file) used by upload process
 * @param {String} target
 * @param {Object} config
 * @param {Function} Api
 */
const archive = (target, config, Api) => {
  target = path.isAbsolute(target)
    ? target
    : path.resolve(process.cwd(), target);

  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const app = path.join(root, 'app');
  const rootArchive = `${root}.zip`;
  const workerArchive = path.join(root, `worker-${config.sandboxId}.zip`);

  const options = {
    each: (filepath) => log('Zipping', filepath),
    filter: filter(BLACKLIST),
  };

  const mkdir = () =>
    new Promise((resolve, reject) => {
      fs.mkdir(root, (failure) => {
        if (failure) {
          return reject(failure);
        }
        resolve(root);
      });
    });

  return mkdir()
    .then(() =>
      compress(target, Object.assign({}, options, { saveTo: workerArchive })),
    )
    .then(() => provisionning(app, config, Api))
    .then(() =>
      compress(root, Object.assign({}, options, { saveTo: rootArchive })),
    )
    .then(() => rootArchive);
};

/**
 * Upload user code archive on ZetaPush platform
 * @param {String} archived
 * @param {Object} config
 */
const upload = (archived, config) =>
  new Promise((resolve, reject) => {
    log(`Uploading`, archived);
    const { protocol, hostname, port } = new URL(config.apiUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/cook`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: config.login,
          password: config.password,
        }),
      },
      method: 'POST',
      url,
      formData: {
        businessId: config.sandboxId,
        description: `Deploy on sandbox ${config.sandboxId}`,
        file: fs.createReadStream(archived),
      },
    };
    log('Upload archive', url);
    request(options, (failure, response, body) => {
      if (failure) {
        error('Upload failed:', failure);
        return reject(failure);
      }
      if (response.statusCode !== 200) {
        try {
          const { code, context } = JSON.parse(body);
          if (code === 'ALREADY_DEPLOYING' && typeof context === 'object') {
            log(`Uploading`, archived);
            context.recipeId = context.progressToken;
            return resolve(context);
          }
        } catch (exception) {
          error('Upload body parsing:', exception);
        }
        error('Upload failed:', response.statusCode, body);
        return reject({ body, statusCode: response.statusCode });
      }
      return resolve(JSON.parse(body));
    });
  });

/**
 * Bundle and upload user code on ZetaPush platform
 * @param {String} target
 * @param {Object} config
 * @param {Function} Api
 */
const push = (target, config, Api) => {
  log(`Execute command <push> ${target}`);
  target = path.isAbsolute(target)
    ? target
    : path.resolve(process.cwd(), target);
  archive(target, config, Api)
    .then((archived) => upload(archived, config))
    .then((recipe) => {
      log('Uploaded', recipe.recipeId);
      const { recipeId } = recipe;
      if (recipeId === void 0) {
        return error('Missing recipeId', recipe);
      }
      log('Progression');
      const progress = {};
      (async function check() {
        try {
          const { progressDetail } = await getProgress(config, recipeId);
          const { steps, finished } = progressDetail;
          steps.forEach((step) => {
            if (!progress[step.id]) {
              progress[step.id] = new ProgressBar({
                total: 100,
                schema: `[:bar] :current/:total :percent :elapseds ${
                  step.name
                }`,
              });
            }
            progress[step.id].update(step.progress / 100);
          });
          if (!finished) {
            setTimeout(check, 2500);
          }
        } catch (ex) {
          error('Progression', ex);
        }
      })();
    })
    .catch((failure) => error('Push failed', failure));
};

module.exports = push;
