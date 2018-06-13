// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modues/,
});

const EventEmitter = require('events');
const debounce = require('lodash.debounce');
const cwd = require('resolve-cwd');

const on = new EventEmitter();

const dispatch = debounce((worker) => on.emit('reload', worker), 150);

/**
 * @param {String} basepath
 */
const load = (basepath) => {
  const id = cwd(basepath);
  const worker = require(id);
  if (module.hot) {
    module.hot.accept(id, () => {
      const reloaded = require(id);
      dispatch(reloaded);
    });
  }
  return worker;
};

module.exports = { load, on };
