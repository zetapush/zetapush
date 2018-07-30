const { existsSync, readdirSync, lstatSync } = require('fs');
const { trace } = require('@zetapush/common');
const zip = require('zip-dir');

const compress = (folder, options = {}) =>
  new Promise((resolve, reject) => {
    if (!existsSync(folder) || !isDirectory(folder) || isEmpty(folder)) {
      trace('not a directory or directory is empty => skip zip');
      return resolve({ folder, options, buffer: null });
    }
    zip(folder, options, (failure, buffer) => {
      if (failure) {
        return reject(failure);
      }
      resolve({
        folder,
        options,
        buffer
      });
    });
  });

const isDirectory = (folder) => {
  return lstatSync(folder).isDirectory();
};

const isEmpty = (folder) => {
  var files = readdirSync(folder);
  return files.length === 0;
};

module.exports = { compress };
