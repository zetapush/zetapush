require('reflect-metadata');

const { ReflectiveInjector } = require('@zetapush/platform');

const DEFAULTS = require('./defaults');
const { log, error, info, warn } = require('./log');

class ScanOutput {
  constructor() {
    this.custom = [];
    this.platform = [];
  }
}

const getInjectionMetadata = (target) =>
  Reflect.hasMetadata('design:paramtypes', target)
    ? Reflect.getMetadata('design:paramtypes', target)
    : target.parameters;

const isToken = (provider) =>
  Boolean(provider) && provider.toString() === '@Inject';

const scan = (CustomCloudService, output = new ScanOutput()) => {
  if (isFunction(CustomCloudService)) {
    const metadata = getInjectionMetadata(CustomCloudService);
    if (Array.isArray(metadata)) {
      metadata.forEach((injected) => {
        const provider = isToken(injected) ? injected.token : injected;
        if (isFunction(provider)) {
          if (Array.isArray(getInjectionMetadata(provider))) {
            // CustomCloudService with DI
            scan(provider, output);
            output.custom.push(provider);
          } else if (provider.DEFAULT_DEPLOYMENT_ID) {
            // Platform CloudService
            output.platform.push(provider);
          } else {
            // CustomCloudService without DI
            output.custom.push(provider);
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
      // warn(`ES Modules are not yet fully supported`);
      // Support ES Module
      if (isFunction(declaration.default)) {
        return {
          [DEFAULTS.DEFAULT_NAMESPACE]: declaration.default,
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
  let singleton;
  try {
    const cleaned = clean(declaration);
    const output = analyze(cleaned);
    const providers = resolve(client, output);
    const injector = ReflectiveInjector.resolveAndCreate(providers);
    singleton = Object.entries(cleaned).reduce(
      (instance, [namespace, CustomCloudService]) => {
        instance[namespace] = injector.get(CustomCloudService);
        return instance;
      },
      {},
    );
  } catch (ex) {
    error('instanciate', ex);
  }
  log('instanciate', singleton);
  return singleton;
};

module.exports = {
  analyze,
  clean,
  instanciate,
  normalize,
  resolve,
};
