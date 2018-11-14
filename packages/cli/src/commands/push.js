const path = require('path');
const os = require('os');
const fs = require('fs');

const { upload, log, error, archive, info } = require('@zetapush/common');
const { displayHelp } = require('@zetapush/troubleshooting');
const { Worker } = require('@zetapush/worker');

const { getProgression } = require('../utils/progression');

/**
 * Bundle and upload user code on ZetaPush platform
 * @param {Object} command
 * @param {Object} config
 * @param {Function} Worker
 */
const push = (command, config, declaration) => {
  log(`Execute command <push> ${command.worker}`);
  info(`Bundle your application components`);
  archive(command, config, declaration, Worker).then(([rootArchive, workersNumber]) => {
    upload(fs.createReadStream(rootArchive), config)
      .then((recipe) => {
        log('Uploaded', recipe.recipeId);
        const { recipeId } = recipe;
        if (recipeId === void 0) {
          return error('Missing recipeId', recipe);
        }
        log('Progression');
        getProgression(config, recipeId, workersNumber);
      })
      .catch((failure) => {
        error('Push failed', failure);
        displayHelp(failure);
      });
  });
};

module.exports = push;
