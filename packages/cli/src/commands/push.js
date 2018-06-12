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
 * @param {Object} command
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const archive = (command, config, declaration) => {
  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const app = path.join(root, 'app');
  const rootArchive = `${root}.zip`;
  const workerArchive = path.join(root, `worker.zip`);
  const frontArchive = path.join(root, `front.zip`);

  const options = {
    filter: filter(BLACKLIST),
  };

  return mkdir(root)
    .then(() =>
      compress(command.front, { ...options, ...{ saveTo: frontArchive } }),
    )
    .then(() =>
      compress(command.worker, { ...options, ...{ saveTo: workerArchive } }),
    )
    .then(() => generateProvisioningFile(app, config))
    .then(() => compress(root, { ...options, ...{ saveTo: rootArchive } }))
    .then(() => rootArchive);
};

/**
 * Bundle and upload user code on ZetaPush platform
 * @param {Object} command
 * @param {Object} config
 * @param {Function} Worker
 */
const push = (command, config, declaration) => {
  log(`Execute command <push> ${command.worker}`);
  archive(command, config, declaration)
    .then((archived) => upload(archived, config))
    .then((recipe) => {
      log('Uploaded', recipe.recipeId);
      const { recipeId } = recipe;
      if (recipeId === void 0) {
        return error('Missing recipeId', recipe);
      }
      log('Progression');
      getProgression(config, recipeId);
    })
    .catch((failure) => {
      error('Push failed', failure);
      troubleshooting.displayHelp(failure);
    });
};

module.exports = push;
