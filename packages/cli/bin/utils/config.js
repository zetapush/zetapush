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
        reject(failure);
        return error('Load ZetaPush config file', failure);
      }
      try {
        const config = JSON.parse(content);
        resolve(config);
      } catch (failure) {
        reject(failure);
        return error('Invalid ZetaPush config file', failure);
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
          reject(failure);
          return error('Persist ZetaPush config file', failure);
        }
        resolve(content);
      },
    );
  });

module.exports = { loadZetaPushConfigFile, saveZetaPushConfigFile };
