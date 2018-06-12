const cwd = require('resolve-cwd');

/**
 * @param {Object} command
 */
const load = (command) => {
  const id = cwd(command.worker);
  const Worker = require(id);
  return Worker;
};

module.exports = { load };
