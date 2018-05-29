const path = require('path');
const fs = require('fs');
const os = require('os');
const request = require('request');
const { URL } = require('url');
const ProgressBar = require('ascii-progress');

const { log, error } = require('../utils/log');
const compress = require('../utils/compress');
const { mapDeclarationToProvision } = require('../utils/provisionning');

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
 * Get Application live status
 * @param {Object} config
 */
const getLiveStatus = (config) =>
  new Promise((resolve, reject) => {
    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/business/live/${appName}`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method: 'GET',
      url,
    };
    // log('Get progresssion', url);
    request(options, (failure, response, body) => {
      if (failure) {
        reject(failure);
        return error('Get live status failed', failure);
      }
      if (response.statusCode !== 200) {
        reject(response.statusCode);
        return error('Get live status failed', response.statusCode, body);
      }
      // log('Get progresssion successful', body);
      try {
        const parsed = JSON.parse(body);
        const nodes = Object.values(parsed.nodes);
        const fronts = nodes.reduce((reduced, node) => {
          const contexts =
            node.liveData['jetty.local.static.files.contexts'] || [];
          return {
            ...reduced,
            ...contexts.reduce((acc, context) => {
              acc[context.name] = context.urls;
              return acc;
            }, {}),
          };
        }, {});
        resolve(fronts);
      } catch (failure) {
        reject(failure);
        return error('Get live status failed', failure);
      }
    });
  });

/**
 * Get deployment progression for a given recipe id (aka deployment token)
 * @param {Object} config
 * @param {String} recipeId
 */
const getProgress = (config, recipeId) =>
  new Promise((resolve, reject) => {
    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/status/${appName}/${recipeId}`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
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
 * @param {WorkerDeclaration} declaration
 */
const provisionning = (filepath, config, declaration) =>
  new Promise((resolve, reject) => {
    const provision = mapDeclarationToProvision(config, declaration);
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
 * @param {String} basepath
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const archive = (basepath, config, declaration) => {
  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const app = path.join(root, 'app');
  const rootArchive = `${root}.zip`;
  const workerArchive = path.join(root, `worker.zip`);
  const frontArchive = path.join(root, `front.zip`);

  const frontSource = path.isAbsolute(basepath)
    ? path.join(basepath, 'public')
    : path.resolve(process.cwd(), basepath, 'public');
  const workerSource = path.isAbsolute(basepath)
    ? basepath
    : path.resolve(process.cwd(), basepath);

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
      compress(
        frontSource,
        Object.assign({}, options, { saveTo: frontArchive }),
      ),
    )
    .then(() =>
      compress(
        workerSource,
        Object.assign({}, options, { saveTo: workerArchive }),
      ),
    )
    .then(() => provisionning(app, config, declaration))
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
    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/cook`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method: 'POST',
      url,
      formData: {
        businessId: appName,
        description: `Deploy on application ${appName}`,
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
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {Function} Worker
 */
const push = (args, basepath, config, declaration) => {
  log(`Execute command <push> ${basepath}`);
  basepath = path.isAbsolute(basepath)
    ? basepath
    : path.resolve(process.cwd(), basepath);
  archive(basepath, config, declaration)
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
                width: 20,
                schema: `:bar ${step.name}`,
                blank: '░'
              });
            }
            progress[step.id].update(step.progress / 100);
          });
          if (!finished) {
            setTimeout(check, 2500);
          } else {
            getLiveStatus(config)
              .then((fronts) => {
                log(`Application status`);
                Object.entries(fronts).forEach(([name, urls]) => {
                  log(
                    `Your frontend application ${name} is available at ${
                      urls[urls.length - 1]
                    }`,
                  );
                });
              })
              .catch((failure) =>
                error(`Unable to get Application status`, failure),
              );
          }
        } catch (ex) {
          error('Progression', ex);
        }
      })();
    })
    .catch((failure) => error('Push failed', failure));
};

module.exports = push;
