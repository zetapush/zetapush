const { ReflectiveInjector } = require('@zetapush/platform');

const DEFAULTS = require('./defaults');
const { error } = require('./log');

class ScanOutput {
  constructor() {
    this.custom = [];
    this.platform = [];
  }
}

const scan = (CustomCloudService, output = new ScanOutput()) => {
  if (typeof CustomCloudService === Function.name.toLowerCase()) {
    const { parameters } = CustomCloudService;
    if (Array.isArray(parameters)) {
      parameters.forEach((injected) => {
        if (typeof injected.token === Function.name.toLowerCase()) {
          if (Array.isArray(injected.token.parameters)) {
            // CustomCloudService with DI
            scan(injected.token, services);
            output.custom.push(injected.token);
          } else if (injected.token.DEFAULT_DEPLOYMENT_ID) {
            // Platform CloudService
            output.platform.push(injected.token);
          } else {
            // CustomCloudService without DI
            output.custom.push(injected.token);
          }
        }
      });
    }
    // Add CustomCloudService
    output.custom.push(CustomCloudService);
  }
  return output;
};

/**
 * Resolve injected services
 * @param {WorkerDeclaration} declaration
 * @return {ScanOutput}
 */
const analyse = (declaration) => {
  const { exposed = {}, internal = {} } = declaration;
  const output = new ScanOutput();
  Object.values(exposed).map((CustomCloudService) =>
    scan(CustomCloudService, output),
  );
  Object.values(internal).map((CustomCloudService) =>
    scan(CustomCloudService, output),
  );
  // Unicity
  output.custom = Array.from(new Set(output.custom));
  output.platform = Array.from(new Set(output.platform));
  // Normalized output
  return output;
};

/**
 * Resolve providers with dynamicly injected values
 * @param {ServerClient} client
 * @param {ScanOutput} output
 */
const resolve = (client, output) => [
  ...output.platform.map((PlatformService) => ({
    provide: PlatformService,
    useValue: client.createAsyncService({
      Type: PlatformService,
    }),
  })),
  ...output.custom.map((CustomCloudService) => ({
    provide: CustomCloudService,
    useClass: CustomCloudService,
  })),
];

/**
 * Normalize worker declaration
 * @param {Object} declaration
 * @return {WorkerDeclaration}
 */
const normalize = (declaration) => {
  if (typeof declaration === Function.name.toLowerCase()) {
    return {
      exposed: {
        [DEFAULTS.DEFAULT_NAMESPACE]: declaration,
      },
      internal: {},
    };
  } else if (typeof declaration === Object.name.toLowerCase()) {
    if (declaration.__esModule === true) {
      error(`ES Modules are not yet supported`);
      // Support ES Module
      if (typeof declaration.default === Function.name.toLowerCase()) {
        return {
          exposed: {
            [DEFAULTS.DEFAULT_NAMESPACE]: declaration,
          },
          internal: {},
        };
      } else if (typeof declaration.default === Object.name.toLowerCase()) {
        if (!declaration.default.exposed) {
          error(`Missing 'exposed' property in your Worker declaration`);
          throw new Error(
            `Missing 'exposed' property in your Worker declaration`,
          );
        }
      }
    } else {
      if (!declaration.exposed) {
        error(`Missing 'exposed' property in your Worker declaration`);
        throw new Error(
          `Missing 'exposed' property in your Worker declaration`,
        );
      }
      if (!declaration.internal) {
        return {
          exposed: declaration.exposed,
          internal: {},
        };
      }
    }
  } else {
    error(`Unsupported Worker declaration`);
    throw new Error(`Unsupported Worker declaration`);
  }
};

/**
 * Resolve and inject dependencies
 * @param {ServerClient} client
 * @param {WorkerDeclaration} declaration
 */
const instanciate = (client, declaration) => {
  const normalized = normalize(declaration);
  const output = analyse(normalized);
  const providers = resolve(client, output);
  console.log(providers);
  const injector = ReflectiveInjector.resolveAndCreate(providers);
  return Object.entries(normalized.exposed).reduce(
    (instance, [namespace, CustomCloudService]) => {
      instance[namespace] = injector.get(CustomCloudService);
      return instance;
    },
    {},
  );
};

module.exports = instanciate;
