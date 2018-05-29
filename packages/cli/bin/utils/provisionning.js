const { log, error } = require('./log');
const fs = require('fs');

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

/**
 * Generate a normalized file use by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 */
const provisionning = (filepath, config, Api) =>
  new Promise((resolve, reject) => {
    const { injected = [] } = Api;
    const provision = mapInjectedToProvision(config, injected);
    const json = JSON.stringify(provision);
    fs.writeFile(filepath, json, (failure) => {
      if (failure) {
        reject(failure);
        return error('provisionning', failure);
      }
      resolve({ filepath, provision });
    });
  });

module.exports = provisionning;
