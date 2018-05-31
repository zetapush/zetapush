const fs = require('fs');

const { Queue, Weak } = require('@zetapush/platform');

const { log, error } = require('./log');
const { analyze } = require('./di');

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 */
const getBootstrapProvision = (config) => {
  const type = Queue.DEPLOYMENT_TYPE;
  return {
    businessId: config.appName,
    items: [
      {
        name: type,
        item: {
          itemId: type,
          businessId: config.appName,
          deploymentId: `${type}_0`,
          description: `${type}(${type}:${type}_0)`,
          options: {
            queue_auth_id: 'developer',
          },
          forbiddenVerbs: [],
          enabled: true,
        },
      },
    ],
    calls: [],
  };
};

/**
 * Get provisioning from injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {WorkerDeclaration} declaration
 */
const getRuntimeProvision = (config, declaration) => {
  const { platform } = analyze(declaration);
  const items = Array.from(
    new Set([
      Weak.DEPLOYMENT_TYPE,
      ...platform.map((Service) => Service.DEPLOYMENT_TYPE),
    ]),
  );
  log(`Provisioning`, ...items);
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
 * @param {Object} declaration
 * @param {Boolean} bootstrap
 */
const generateProvisioningFile = (filepath, config, declaration, bootstrap) =>
  new Promise((resolve, reject) => {
    const provision = bootstrap
      ? getBootstrapProvision(config)
      : getRuntimeProvision(config, declaration);
    const json = JSON.stringify(provision);
    fs.writeFile(filepath, json, (failure) => {
      if (failure) {
        reject(failure);
        return error('provisioning', failure);
      }
      resolve({ filepath, provision });
    });
  });

module.exports = {
  generateProvisioningFile,
  getBootstrapProvision,
  getRuntimeProvision,
};
