const path = require('path');
const read = require('read-package-json');

const DEFAULT_FRAGMENTS = {
  fronts: {
    front: './front'
  },
  workers: {
    worker: './worker'
  }
};

/**
 * Load project fragments
 * @param {Object} command
 */
const load = (command) =>
  new Promise((resolve, reject) => {
    read(path.resolve(command.project, 'package.json'), (error, package) => {
      if (error) {
        return reject(error);
      }
      const { zetapush = DEFAULT_FRAGMENTS } = package;
      resolve(zetapush);
    });
  });

module.exports = { load };
