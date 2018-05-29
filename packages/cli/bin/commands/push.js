const path = require('path');
const fs = require('fs');
const os = require('os');
const request = require('request');
const { URL } = require('url');
const ProgressBar = require('ascii-progress');

const compress = require('../utils/compress');
const provisionning = require('../utils/provisionning');
const { log, error } = require('../utils/log');
const { getProgression, getLiveStatus } = require('../utils/progression');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');

/**
 * Generate an archive (.zip file) used by upload process
 * @param {String} basepath
 * @param {Object} config
 * @param {Function} Api
 */
const archive = (basepath, config, Api) => {
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

  return mkdir(root)
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
    .then(() => provisionning(app, config, Api))
    .then(() =>
      compress(root, Object.assign({}, options, { saveTo: rootArchive })),
    )
    .then(() => rootArchive);
};

/**
 * Bundle and upload user code on ZetaPush platform
 * @param {Object} args
 * @param {String} basepath
 * @param {Object} config
 * @param {Function} Worker
 */
const push = (args, basepath, config, Api) => {
  log(`Execute command <push> ${basepath}`);
  basepath = path.isAbsolute(basepath)
    ? basepath
    : path.resolve(process.cwd(), basepath);
  archive(basepath, config, Api)
    .then((archived) => upload(archived, config))
    .then((recipe) => {
      log('Uploaded', recipe.recipeId);
      const { recipeId } = recipe;
      if (recipeId === void 0) {
        return error('Missing recipeId', recipe);
      }
      log('Progression');
      const progress = {};

      getProgression(config, recipeId);
    })
    .catch((failure) => error('Push failed', failure));
};

module.exports = push;
