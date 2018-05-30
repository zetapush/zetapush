const fs = require('fs');

const { log, error } = require('./log');
const { analyze } = require('./di');
/**
 * Map injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {WorkerDeclaration} declaration
 */
const mapDeclarationToProvision = (config, declaration, queueOnly) => {
  // Function to add options to Queue service
  const getServiceOptions = (type) =>
    type == 'queue' ? { queue_auth_id: 'developer' } : {};

  const { platform } = analyze(declaration);
  const items = Array.from(
    new Set([
      'queue',
      'weak',
      ...platform.map((Service) => Service.DEPLOYMENT_TYPE),
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
        options: getServiceOptions(type),
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
 * @param {Object} declaration
 */
const provisionning = (filepath, config, declaration, queueOnly) =>
  new Promise((resolve, reject) => {
    const provision = mapDeclarationToProvision(config, declaration, queueOnly);
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
