const cwd = require('resolve-cwd');

const load = (basepath) => {
  const id = cwd(basepath);
  const Worker = require(id);
  return Worker;
};

module.exports = { load };
