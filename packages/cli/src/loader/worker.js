// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modues/,
});

const EventEmitter = require('events');
const cwd = require('resolve-cwd');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

/**
 * @param {String} basepath
 */
const load = (basepath) => {
  const id = cwd(basepath);
  const worker = require(id);
  if (module.hot) {
    module.hot.accept(id, (/*filepath*/) => {
      const reloaded = require(id);
      dispatch(reloaded);
    });
  }
  return worker;
};

module.exports = { load, events };
