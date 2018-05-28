const { ReflectiveInjector } = require('@zetapush/platform');

const DEFAULTS = require('./defaults');
const { error, warn } = require('./log');

class ScanOutput {
  constructor() {
    this.custom = [];
    this.platform = [];
  }
}

const scan = (CustomCloudService, output = new ScanOutput()) => {
  if (isFunction(CustomCloudService)) {
    const { parameters } = CustomCloudService;
    if (Array.isArray(parameters)) {
      parameters.forEach((injected) => {
        if (isFunction(injected.token)) {
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
const analyze = (declaration) => {
  const cleaned = clean(declaration);
  const output = new ScanOutput();
  Object.values(cleaned).map((CustomCloudService) =>
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
 * Test if the value parameter in a function
 * @param {Object} value
 * @returns {Boolean}
 */
const isFunction = (value) => typeof value === Function.name.toLowerCase();

/**
 * Return a cleaned WorkerDecleration
 * @param {WorkerDeclaration} declaration
 */
const clean = (declaration) =>
  Object.entries(normalize(declaration))
    .filter(([namespace, CustomCloudService]) => isFunction(CustomCloudService))
    .reduce(
      (cleaned, [namespace, CustomCloudService]) => ({
        ...cleaned,
        [namespace]: CustomCloudService,
      }),
      {},
    );

/**
 * Normalize worker declaration
 * @param {Object} declaration
 * @return {WorkerDeclaration}
 */
const normalize = (declaration) => {
  if (isFunction(declaration)) {
    return {
      [DEFAULTS.DEFAULT_NAMESPACE]: declaration,
    };
  } else if (typeof declaration === Object.name.toLowerCase()) {
    if (declaration.__esModule === true) {
      warn(`ES Modules are not yet fully supported`);
      // Support ES Module
      if (isFunction(declaration.default)) {
        return {
          [DEFAULTS.DEFAULT_NAMESPACE]: declaration,
        };
      } else if (typeof declaration.default === Object.name.toLowerCase()) {
        return declaration.default;
      }
    } else {
      return declaration;
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
  const cleaned = clean(declaration);
  const output = analyze(cleaned);
  const providers = resolve(client, output);
  const injector = ReflectiveInjector.resolveAndCreate(providers);
  return Object.entries(cleaned).reduce(
    (instance, [namespace, CustomCloudService]) => {
      instance[namespace] = injector.get(CustomCloudService);
      return instance;
    },
    {},
  );
};

module.exports = {
  analyze,
  clean,
  instanciate,
  normalize,
  resolve,
};
