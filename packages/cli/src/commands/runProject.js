const fragments = require('../loader/fragments');
const { load } = require('../loader/worker');

/**
 *
 * @param {Object} command
 * @param {Object} config
 */
const runFronts = (command, config) => {};

/**
 *
 * @param {Object} command
 * @param {Object} config
 */
const runWorkers = (command, config) => {};

/**
 *
 * @param {Object} command
 * @param {Object} config
 */
const runProject = (command, config) =>
  fragments
    .load(command)
    .then((fragments) => ({ ...config, ...fragments }))
    .then(({ workers, ...config }) =>
      Promise.all(Object.values(workers).map((worker) => load({ ...command, worker })))
        .then((loaded) =>
          Object.entries(workers).map(([id, folder], index) => ({
            id,
            folder,
            declaration: loaded[index]
          }))
        )
        .then((resolved) => ({
          ...config,
          workers: resolved
        }))
    )
    .then((config) => console.log('run-project', config));

module.exports = runProject;
