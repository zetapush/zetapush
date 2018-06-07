const { uuid } = require('@zetapush/core');

const { fetch } = require('./network');

/**
 * Get prefered cluster
 * @param {Object} config
 */
const getPreferedCluster = (config) =>
  fetch({ config, pathname: 'orga/cluster/list' }).then((clusters) => {
    const [cluster] = clusters.filter(({ preferred }) => Boolean(preferred));
    return cluster;
  });
/**
 * Get developer profile info
 * @param {Object} config
 */
const whoami = (config) => fetch({ config, pathname: 'auth/whoami' });
/**
 * Create business application
 * @param {Object} config
 * @param {Object} orga
 * @param {Object} cluster
 */
const create = (config, orga, cluster) =>
  fetch({
    config,
    method: 'POST',
    pathname: 'orga/business/create',
    body: JSON.stringify({
      orgaId: orga.id,
      cluster: cluster.id,
      name: `app@${uuid()}`,
      description: 'app',
    }),
  });

const createApplication = (config) =>
  Promise.all([whoami(config), getPreferedCluster(config)])
    .then(([me, cluster]) => create(config, me.orga, cluster))
    .then((application) => ({
      ...config,
      appName: application.businessId,
      envName: '',
    }));

module.exports = { createApplication };
