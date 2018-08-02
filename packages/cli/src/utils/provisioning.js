const { Queue, Weak } = require('@zetapush/platform-legacy');
const { Worker } = require('@zetapush/worker');
const core = require('@zetapush/common');

/**
 * Get deployment id list from injected service to provisioning items
 * @param {WorkerDeclaration} declaration
 * @return {string[]}
 */
const getDeploymentIdList = (declaration) => core.getDeploymentIdList(declaration, [], [Queue]);

/**
 * Get bootstrap provisioning items
 * @param {ZetaPushConfig} config
 * @param {Service[]} services the bootstrap services (mainly Worker and Weak)
 */
const getBootstrapProvision = (config) => core.getBootstrapProvision(config, [Worker, Weak]);

/**
 * Get provisioning from injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {WorkerDeclaration} declaration
 */
const getRuntimeProvision = (config, declaration) => core.getRuntimeProvision(config, declaration, [], [Queue]);

/**
 * Generate a normalized file used by ZBO to provision ZetaPush Services
 * @param {String} filepath
 * @param {Object} config
 */
const generateProvisioningFile = (filepath, config) => core.generateProvisioningFile(filepath, config, [Worker, Weak]);

module.exports = {
  generateProvisioningFile,
  getBootstrapProvision,
  getDeploymentIdList,
  getRuntimeProvision
};
