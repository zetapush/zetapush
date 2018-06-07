const path = require('path');
const os = require('os');

const compress = require('../utils/compress');
const DEFAULTS = require('../utils/defaults');
const { log, error } = require('../utils/log');
const { getProgression } = require('../utils/progression');
const { generateProvisioningFile } = require('../utils/provisioning');
const { upload, filter, BLACKLIST, mkdir } = require('../utils/upload');
const troubleshooting = require('../errors/troubleshooting');

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
    ? path.join(basepath, DEFAULTS.FRONT_FOLDER_PATH)
    : path.resolve(process.cwd(), basepath, DEFAULTS.FRONT_FOLDER_PATH);
  const workerSource = path.isAbsolute(basepath)
    ? basepath
    : path.resolve(process.cwd(), basepath);

  const options = {
    filter: filter(BLACKLIST),
  };

  return mkdir(root)
    .then(() =>
      compress(frontSource, { ...options, ...{ saveTo: frontArchive } }),
    )
    .then(() =>
      compress(workerSource, { ...options, ...{ saveTo: workerArchive } }),
    )
    .then(() => generateProvisioningFile(app, config))
    .then(() => compress(root, { ...options, ...{ saveTo: rootArchive } }))
    .then(() => rootArchive);
};

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

      getProgression(config, recipeId);
    })
    .catch((failure) => {
      error('Push failed', failure)
      troubleshooting.displayHelp(failure)
    });
};

module.exports = push;
