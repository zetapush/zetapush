import { writeFile } from 'fs';

import { log, error } from './utils/log';
import { analyze } from './di';
import { Service, Config, WorkerDeclaration } from './common-types';

/**
 * Get deployment service list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @param {Service[]} ignoredServices the list of services to ignore
 * @return {Function[]}
 */
export const getDeploymentServiceList = (
  declaration: WorkerDeclaration,
  ignoredServices: Array<Service>,
) => {
  // Ignore specific platform services
  const ignored = ignoredServices.map((Service) => Service.DEPLOYMENT_TYPE);
  const { platform } = analyze(declaration);
  return Array.from(
    new Set(
      platform.filter(
        (Service: Service) => ignored.indexOf(Service.DEPLOYMENT_TYPE) === -1,
      ),
    ),
  );
};

/**
 * Get deployment id list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @param {Service[]} ignoredServices the list of services to ignore
 * @return {string[]}
 */
export const getDeploymentIdList = (
  declaration: WorkerDeclaration,
  ignoredServices: Array<Service>,
) =>
  getDeploymentServiceList(declaration, ignoredServices).map(
    (Service: Service) => Service.DEPLOYMENT_TYPE,
  );

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 * @param {Service[]} services the services to bootstrap
 */
export const getBootstrapProvision = (
  config: Config,
  services: Array<Service>,
) => {
  return {
    businessId: config.appName,
    items: services.map((Service: Service) => ({
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
 * @param {Service[]} ignoredServices the list of services to ignore
 */
export const getRuntimeProvision = (
  config: Config,
  declaration: WorkerDeclaration,
  ignoredServices: Array<Service>,
) => {
  const services = getDeploymentServiceList(declaration, ignoredServices);
  log(`Provisioning`, ...services);
  return {
    businessId: config.appName,
    items: services.map((Service: Service) => ({
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
 * Generate a normalized file used by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 * @param {Service[]} services the services to bootstrap
 */
export const generateProvisioningFile = (
  filepath: string,
  config: Config,
  services: Array<Service>,
) =>
  new Promise((resolve, reject) => {
    const provision = getBootstrapProvision(config, services);
    const json = JSON.stringify(provision);
    writeFile(filepath, json, (failure) => {
      if (failure) {
        reject({ failure, config });
        return error('provisioning', failure);
      }
      resolve({ filepath, provision });
    });
  });
