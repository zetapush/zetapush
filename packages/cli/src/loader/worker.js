// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modues/,
});
// Core
const EventEmitter = require('events');
// Packages
const cwd = require('resolve-cwd');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

let last = Date.now();

/**
 * @param {Object} command
 */
const load = (command) => {
  const id = cwd(command.worker);
  console.log('load', id);
  let worker = require(id);
  if (module.hot) {
    module.hot.accept(id, (filepath) => {
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
};

module.exports = { load, events };
