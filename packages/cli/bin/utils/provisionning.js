const { log } = require('./log');

/**
 * Map injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {Service[]} injected
 */
const mapInjectedToProvision = (config, injected = []) => {
  const items = Array.from(
    new Set([
      'queue',
      'weak',
      ...injected.map((Service) => Service.DEPLOYMENT_TYPE),
    ]),
  );
  log(`Provisionning`, ...items);
  return {
    businessId: config.appName,
    items: items.map((type) => ({
      name: type,
      item: {
        itemId: type,
        businessId: config.appName,
        deploymentId: `${type}_0`,
        description: `${type}(${type}:${type}_0)`,
        options: {},
        forbiddenVerbs: [],
        enabled: true,
      },
    })),
    calls: [],
  };
};

module.exports = { mapInjectedToProvision };
