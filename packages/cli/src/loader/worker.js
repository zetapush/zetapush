const fs = require('fs');
const path = require('path');

// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modules/
});
// Core
const EventEmitter = require('events');
// Packages
const cwd = require('resolve-cwd');
const { trace, readConfigFromPackageJson } = require('@zetapush/common');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

const renameWorker = (worker, name) => {
  Object.defineProperty(worker, name, Object.getOwnPropertyDescriptor(worker, Object.keys(worker)[0]));
  delete worker[Object.keys(worker)[0]];
  return worker;
};

let last = Date.now();

/**
 * @param {Object} command
 */
const load = (command) => {
  const workers = [];

  try {
    // Handle the case of we have many workers specified in the CLI
    if (command.workers) {
      const workersUsed = command.workers.split(',');
      const { workers: configWorkers } = readConfigFromPackageJson();

      if (Object.keys(configWorkers).length > 0) {
        workersUsed.forEach((worker) => {
          const id = cwd(configWorkers[worker]);
          workers.push(renameWorker(require(id), worker));
        });
      } else {
        throw `Failed to load workers configuration. Check your package.json file.`;
      }
    }
    // Handle the basic case
    else {
      if (fs.existsSync(path.join(process.cwd(), command.worker))) {
        const id = cwd(path.resolve(command.worker));
        workers.push(renameWorker(require(id), command.worker));
      } else {
        const { workers: configWorkers } = readConfigFromPackageJson();

        if (Object.keys(configWorkers).length > 0) {
          const id = cwd(configWorkers[command.worker]);
          workers.push(renameWorker(require(id), command.worker));
        } else {
          const id = cwd(process.cwd());
          console.log('==> ID : ', id);
          workers.push(id);
        }
      }
    }
    console.log('==> WORKERS : ', workers);

    // const id = cwd(command.worker);
    // let worker = require(id);
    // if (module.hot) {
    //   module.hot.accept(id, (filepath) => {
    //     // Ensure clear cache
    //     delete require.cache[require.resolve(filepath)];
    //     // Reload worker declaration
    //     worker = require(filepath);
    //     // Time tracking
    //     const now = Date.now();
    //     if (now - last > 5000) {
    //       // Dispatch event outside event loop
    //       dispatch(worker);
    //       // Update latest update
    //       last = now;
    //     }
    //   });
    // }
    return workers;
  } catch (e) {
    trace('Failed to load worker code', e);
    throw e;
    // throw new WorkerLoadError('Failed to load worker code', e);
  }
};

class WorkerLoadError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

module.exports = { load, events, WorkerLoadError };
