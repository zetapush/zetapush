import { log, error } from '../utils/log';
import { DependencyInjectionAnalysis } from './di';
import { Service, ResolvedConfig, ArtefactsConfig, WorkerDeclaration } from '../common-types';
import { writeFile } from 'fs';
import { isNode } from '../utils/environment';
import { Declaration } from 'estree';

const JSZip = require('jszip');
const path = require('path');
const os = require('os');

/**
 * Get deployment service list from injected service to provisioning items
 * @param {DependencyInjectionAnalysis} analysis
 * @param {Service[]} ignoredServices the list of services to ignore
 * @return {Function[]}
 */
export const getDeploymentServiceList = (
  analysis: Array<DependencyInjectionAnalysis>,
  ignoredServices: Array<Service>
) => {
  // Ignore specific platform services
  const ignored = ignoredServices.map((Service) => Service.DEPLOYMENT_TYPE);
  const platforms = analysis.map(({ platformServices }) => platformServices);
  const deploymentServiceList: Array<any> = [];

  platforms.forEach((platform) => {
    deploymentServiceList.concat(
      Array.from(new Set(platform.filter((Service: Service) => ignored.indexOf(Service.DEPLOYMENT_TYPE) === -1)))
    );
  });
  return deploymentServiceList;
};

/**
 * Get deployment id list from injected service to provisioning items
 * @param {Array<DependencyInjectionAnalysis>} analysis
 * @param {Service[]} ignoredServices the list of services to ignore
 * @return {string[]}
 */
export const getDeploymentIdList = (analysis: Array<DependencyInjectionAnalysis>, ignoredServices: Array<Service>) =>
  getDeploymentServiceList(analysis, ignoredServices).map((Service: Service) => Service.DEPLOYMENT_TYPE);

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 * @param {Service[]} services the services to bootstrap
 */
export const getBootstrapProvisionForPushContext = (
  config: ResolvedConfig,
  declaration: WorkerDeclaration,
  type: Service
) => {
  const keys: Array<string> = [];
  declaration.forEach((elt: any) => {
    keys.push(...Object.keys(elt));
  });

  return {
    businessId: config.appName,
    items: keys.map((worker: any) => ({
      name: worker,
      item: {
        itemId: type.DEPLOYMENT_TYPE,
        businessId: config.appName,
        deploymentId: worker,
        description: worker,
        options: type.DEPLOYMENT_OPTIONS || {},
        forbiddenVerbs: [],
        enabled: true
      }
    })),
    calls: [],
    envVariables: {
      NPM_REGISTRY: config.npmRegistry,
      TS_NODE_SKIP_IGNORE: config.skipIgnore
    }
  };
};

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 * @param {Service[]} services the services to bootstrap
 */
export const getBootstrapProvision = (
  config: ResolvedConfig,
  services: Array<Service>,
  type: Service,
  declaration: WorkerDeclaration
) => {
  const keys: Array<string> = [];
  declaration.forEach((decl: any) => {
    keys.push(...Object.keys(decl));
  });

  const itemsWorkers = keys.map((worker: string) => ({
    name: worker,
    item: {
      itemId: type.DEPLOYMENT_TYPE,
      businessId: config.appName,
      deploymentId: worker,
      description: worker,
      options: type.DEPLOYMENT_OPTIONS || {},
      forbiddenVerbs: [],
      enabled: true
    }
  }));

  return {
    businessId: config.appName,
    items: [
      ...services.map((Service: Service) => ({
        name: Service.DEPLOYMENT_TYPE,
        item: {
          itemId: Service.DEPLOYMENT_TYPE,
          businessId: config.appName,
          deploymentId: Service.DEFAULT_DEPLOYMENT_ID || Service.DEPLOYMENT_TYPE,
          description: `${Service.DEPLOYMENT_TYPE}`,
          options: Service.DEPLOYMENT_OPTIONS || {},
          forbiddenVerbs: [],
          enabled: true
        }
      })),
      ...itemsWorkers
    ],
    calls: [],
    envVariables: {
      NPM_REGISTRY: config.npmRegistry,
      TS_NODE_SKIP_IGNORE: config.skipIgnore
    }
  };
};

/**
 * Get provisioning from injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {DependencyInjectionAnalysis} analysis
 * @param {Service[]} ignoredServices the list of services to ignore
 */
export const getRuntimeProvision = (
  config: ResolvedConfig,
  analysis: Array<DependencyInjectionAnalysis>,
  ignoredServices: Array<Service>
): {
  businessId: string;
  items: Array<{ name: string; item: Object }>;
  calls: any[];
} => {
  const services = getDeploymentServiceList(analysis, ignoredServices);

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
        forbiddenVerbs: ['__all'],
        enabled: true
      }
    })),
    calls: []
  };
};

/**
 * Generate a normalized file used by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 * @param {Service[]} services the services to bootstrap
 * @returns {Promise<{object, string}>} The provisioning object and the file content
 */
export const generateProvisioningContent = (
  config: ResolvedConfig,
  services: Array<Service>,
  declaration: WorkerDeclaration,
  type: Service
): Promise<{ provision: Object; json: string }> =>
  new Promise((resolve, reject) => {
    const provision = getBootstrapProvision(config, services, type, declaration);
    const json = JSON.stringify(provision);
    resolve({ provision, json });
  });

/**
 * Generate a normalized file used by ZBO to provision ZetaPush Services
 * Only for the push context
 * @param {String} filepath
 * @param {Object} config
 * @param {Service[]} services the services to bootstrap
 * @returns {Promise<{object, string}>} The provisioning object and the file content
 */
export const generateProvisioningContentForPushContext = (
  config: ResolvedConfig,
  declaration: WorkerDeclaration,
  type: Service
): Promise<{ provision: Object; json: string }> =>
  new Promise((resolve, reject) => {
    const provision = getBootstrapProvisionForPushContext(config, declaration, type);
    const json = JSON.stringify(provision);
    resolve({ provision, json });
  });

/**
 * Generate a normalized file used by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 * @param {Service[]} services the services to bootstrap
 * @returns {Promise<{object, string}>} The provisioning object and the file content
 */
export const generateProvisioningFile = (
  filepath: string,
  config: ResolvedConfig,
  declaration: WorkerDeclaration,
  type: Service
) =>
  new Promise((resolve, reject) => {
    generateProvisioningContentForPushContext(config, declaration, type).then(({ json, provision }) => {
      writeFile(filepath, json, (failure) => {
        if (failure) {
          reject({ failure, config });
          return error('provisioning', failure);
        }
        resolve(provision);
      });
    });
  });

export const createProvisioningArchive = (appJson: string) => {
  const zip = new JSZip();
  zip.file('app', appJson);
  if (isNode()) {
    return zip.generateNodeStream({ type: 'nodebuffer' });
  } else {
    return zip.generateAsync({ type: 'blob' });
  }
};
