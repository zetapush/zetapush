const fs = require('fs');
const path = require('path');

/**
 * Load package.json configuration
 * @param {Object} command
 */
export const readConfigFromPackageJson = () => {
  const content = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')).toString());
  const workerConfig = content.workers;
  const frontConfig = content.fronts;
  const workers: any = {};
  const fronts: any = {};

  // Workers
  if (workerConfig) {
    Object.keys(workerConfig).forEach((key) => {
      if (typeof workerConfig[key] === 'string') {
        // Case of we have the path of the worker in the configuration
        workers[key] = workerConfig[key];
      } else {
        workers[key] = workerConfig[key].path;
      }
    });
  }

  // Fronts
  if (frontConfig) {
    Object.keys(frontConfig).forEach((key) => {
      if (typeof frontConfig[key] === 'string') {
        // Case of we have the path of the front in the configuration
        fronts[key] = frontConfig[key];
      } else {
        fronts[key] = frontConfig[key].path;
      }
    });
  }

  return { workers, fronts };
};
