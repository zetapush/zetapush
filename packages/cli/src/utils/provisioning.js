const fs = require('fs');

const { Queue, Weak } = require('@zetapush/platform');

const { log, error } = require('./log');
const { analyze } = require('./di');

class Worker extends Queue {
  static get DEPLOYMENT_OPTIONS() {
    return {
      queue_auth_id: 'developer',
    };
  }
}

/**
 * Get deployment service list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @return {Function[]}
 */
const getDeploymentServiceList = (declaration) => {
  // Ignore specific platform services
  const ignored = [Queue].map((Service) => Service.DEPLOYMENT_TYPE);
  const { platform } = analyze(declaration);
  return Array.from(
    new Set(
      platform.filter(
        (Service) => ignored.indexOf(Service.DEPLOYMENT_TYPE) === -1,
      ),
    ),
  );
};

/**
 * Get deployment id list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @return {string[]}
 */
const getDeploymentIdList = (declaration) =>
  getDeploymentServiceList(declaration).map(
    (Service) => Service.DEPLOYMENT_TYPE,
  );

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 */
const getBootstrapProvision = (config) => {
  const services = [Worker, Weak];
  return {
    businessId: config.appName,
    items: services.map((Service) => ({
      name: Service.DEPLOYMENT_TYPE,
      item: {
        itemId: Service.DEPLOYMENT_TYPE,
        businessId: config.appName,
        deploymentId: `${Service.DEPLOYMENT_TYPE}_0`,
        description: `${Service.DEPLOYMENT_TYPE}`,
        options: Service.DEPLOYMENT_OPTIONS || {},
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
  const services = getDeploymentServiceList(declaration);
  log(`Provisioning`, ...services);
  return {
    businessId: config.appName,
    items: services.map((Service) => ({
      name: Service.DEPLOYMENT_TYPE,
      item: {
        itemId: Service.DEPLOYMENT_TYPE,
        businessId: config.appName,
        deploymentId: `${Service.DEPLOYMENT_TYPE}_0`,
        description: `${Service.DEPLOYMENT_TYPE}`,
        options: Service.DEPLOYMENT_OPTIONS || {},
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
