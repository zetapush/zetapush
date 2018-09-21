const path = require('path');
const os = require('os');
const fs = require('fs');

const { upload, filter, BLACKLIST, log, error, mkdir, trace } = require('@zetapush/common');
const { Queue } = require('@zetapush/platform-legacy');
const { displayHelp } = require('@zetapush/troubleshooting');

const { compress } = require('../utils/compress-folder');
const { generateProvisioningFile } = require('../utils/provisioning');
const { getProgression } = require('../utils/progression');

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
  const workerArchive = path.join(root, `${Queue.DEFAULT_DEPLOYMENT_ID}.zip`);
  const frontArchive = path.join(root, `front.zip`);
  trace(`zipping worker (${workerArchive}) and front (${frontArchive}) into ${rootArchive}...`);

  const options = {
    filter: filter(BLACKLIST)
  };

  return mkdir(root)
    .then(() => compress(command.front, { ...options, ...{ saveTo: frontArchive } }))
    .then(() => compress(command.worker, { ...options, ...{ saveTo: workerArchive } }))
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
    .then((rootArchive) => upload(fs.createReadStream(rootArchive), config))
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
      displayHelp(failure);
    });
};

module.exports = push;
