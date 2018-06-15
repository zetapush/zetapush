const fs = require('fs');

const { Queue, Weak } = require('@zetapush/platform');

const { log, error } = require('./log');
const { analyze } = require('./di');

/**
 * Get deployment id list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @return {String[]}
 */
const getDeploymentIdList = (declaration) => {
  const { platform } = analyze(declaration);
  return Array.from(
    new Set(platform.map((Service) => Service.DEPLOYMENT_TYPE)),
  );
};

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 */
const getBootstrapProvision = (config) => {
  const types = [
    {
      type: Queue.DEPLOYMENT_TYPE,
      options: {
        queue_auth_id: 'developer',
      },
    },
    {
      type: Weak.DEPLOYMENT_TYPE,
    },
  ];
  return {
    businessId: config.appName,
    items: types.map(({ type, options = {} }) => ({
      name: type,
      item: {
        itemId: type,
        businessId: config.appName,
        deploymentId: `${type}_0`,
        description: `${type}(${type}:${type}_0)`,
        options,
        forbiddenVerbs: [],
        enabled: true,
      },
    })),
    calls: [],
  };
};

/**
 * Get provisioning from injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {WorkerDeclaration} declaration
 */
const getRuntimeProvision = (config, declaration) => {
  const list = getDeploymentIdList(declaration);
  log(`Provisioning`, ...list);
  return {
    businessId: config.appName,
    items: list.map((type) => ({
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
const generateProvisioningFile = (filepath, config) =>
  new Promise((resolve, reject) => {
    const provision = getBootstrapProvision(config);
    const json = JSON.stringify(provision);
    fs.writeFile(filepath, json, (failure) => {
      if (failure) {
        reject({ failure, config });
        return error('provisioning', failure);
      }
      resolve({ filepath, provision });
    });
  });

module.exports = {
  generateProvisioningFile,
  getBootstrapProvision,
  getDeploymentIdList,
  getRuntimeProvision,
};
