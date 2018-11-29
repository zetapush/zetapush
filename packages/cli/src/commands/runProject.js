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
    .then((config) => console.log('run-project', config))
    .then(() => /** TODO: Construire une liste prédictible des ports à utiliser pour chaque worker et front */ config)
    .then(() => /** TODO: Résoudre le graphe d'injection de dépendance pour chaque worker */ config)
    .then(() => /** TODO: Provisioning unique de l'ensemble des workers */ config)
    .then(() => /** TODO: Register workers */ config)
    .then(() => /** TODO: Bootstrap */ config)
    .then(() => /** TODO: Start fronts */ config);

module.exports = runProject;
