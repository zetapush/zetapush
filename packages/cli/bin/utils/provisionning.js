const { analyze } = require('./di');
const { log } = require('./log');
/**
 * Map injected service to provisioning items
 * @param {ZetaPushConfig} config
 * @param {WorkerDeclaration} declaration
 */
const mapDeclarationToProvision = (config, declaration) => {
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
        options: {},
        forbiddenVerbs: [],
        enabled: true,
      },
    })),
    calls: [],
  };
};

module.exports = { mapDeclarationToProvision };
