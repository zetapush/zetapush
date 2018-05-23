const fs = require('fs');

const { error } = require('../utils/log');

/**
 * Load ZetaPush config file
 * @param {String} pathToConfigFile
 */
const loadZetaPushConfigFile = (pathToConfigFile) =>
  new Promise((resolve, reject) => {
    fs.readFile(pathToConfigFile, 'utf8', (failure, content) => {
      if (failure) {
        return reject(failure);
      }
      try {
        const config = JSON.parse(content);
        return resolve(config);
      } catch (failure) {
        return reject(failure);
      }
    });
  });

/**
 * Load ZetaPush config file
 * @param {String} pathToConfigFile
 * @param {Object} content
 */
const saveZetaPushConfigFile = (pathToConfigFile, content) =>
  new Promise((resolve, reject) => {
    fs.writeFile(
      pathToConfigFile,
      JSON.stringify(content, null, 2),
      (failure) => {
        if (failure) {
          return reject(failure);
        }
        return resolve(content);
      },
    );
  });

module.exports = { loadZetaPushConfigFile, saveZetaPushConfigFile };
