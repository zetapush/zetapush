// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modues/
});
// Core
const EventEmitter = require('events');
// Packages
const cwd = require('resolve-cwd');
const { trace } = require('@zetapush/common');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

let last = Date.now();

/**
 * @param {Object} command
 */
const load = (command) => {
  try {
    const id = cwd(command.worker);
    let worker = require(id);
    if (module.hot) {
      module.hot.accept(id, (filepath) => {
        // Ensure clear cache
        delete require.cache[require.resolve(filepath)];
        // Reload worker declaration
        worker = require(filepath);
        // Time tracking
        const now = Date.now();
        if (now - last > 5000) {
          // Dispatch event outside event loop
          dispatch(worker);
          // Update latest update
          last = now;
        }
      });
    }
    return worker;
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
