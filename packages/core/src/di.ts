import 'reflect-metadata';

import { DEFAULTS } from './defaults';
import { log, error } from './utils/log';

import {
  CustomCloudService,
  Injector,
  WorkerDeclaration,
  Service,
  ServerClient,
} from './common-types';

class ScanOutput {
  public custom: Array<CustomCloudService>;
  public platform: Array<Service>;

  constructor() {
    this.custom = [];
    this.platform = [];
    this.bootLayer = [];
  }
}

const getInjectionMetadata = (target: any) =>
  Reflect.hasMetadata('design:paramtypes', target)
    ? Reflect.getMetadata('design:paramtypes', target)
    : target.parameters;

const isToken = (provider: any) =>
  Boolean(provider) && provider.toString() === '@Inject';

const scan = (
  CustomCloudService: CustomCloudService,
  output = new ScanOutput(),
  layer = 0,
) => {
  if (isFunction(CustomCloudService)) {
    const metadata = getInjectionMetadata(CustomCloudService);
    if (Array.isArray(metadata)) {
      const toScan = [];
      const addToScan = [];
      metadata.forEach((injected) => {
        const provider = isToken(injected) ? injected.token : injected;
        if (isFunction(provider)) {
          if (Array.isArray(getInjectionMetadata(provider))) {
            // CustomCloudService with DI
            toScan.push({ provider, output });
            output.custom.push(provider);
            addToScan.push(provider);
          } else if (provider.DEFAULT_DEPLOYMENT_ID) {
            // Platform CloudService
            output.platform.push(provider);
          } else {
            // CustomCloudService without DI
            output.custom.push(provider);
            addToScan.push(provider);
          }
        }
      });
      if (output.bootLayer[layer] === undefined) {
        output.bootLayer.push(addToScan);
      } else {
        output.bootLayer[layer] = output.bootLayer[layer].concat(addToScan);
      }
      for (let sc of toScan) {
        scan(sc.provider, sc.output, layer + 1);
      }
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
export const analyze = (declaration: WorkerDeclaration) => {
  const cleaned = clean(declaration);
  const output = new ScanOutput();
  const baseApi = [];
  Object.values(cleaned).map((CustomCloudService) => {
    scan(CustomCloudService, output);
    baseApi.push(CustomCloudService);
  });
  output.bootLayer.reverse();
  output.bootLayer.push(baseApi);
  // Removing duplicate of bootlayer
  let matchs = -1;
  while (matchs !== 0) {
    let seens = [];
    matchs = 0;
    for (let layer in output.bootLayer) {
      for (let api in output.bootLayer[layer]) {
        for (let seen of seens) {
          if (seen == output.bootLayer[layer][api]) {
            output.bootLayer[layer].splice(api, 1);
            matchs += 1;
          }
        }
        seens.push(output.bootLayer[layer][api]);
      }
    }
  }
  // Unicity
  output.custom = Array.from(new Set(output.custom));
  output.platform = Array.from(new Set(output.platform));
  // Normalized output
  return output;
};

/**
 * Creare platform service instance
 * @param {Object} client
 * @param {Object} Type
 */
const createAsyncService = (client, Type) => {
  const instance = client.createAsyncService({
    Type,
  });
  const $publish = instance.$publish;
  // Override $publish method with scopable `function`
  instance.$publish = function $$publish(name, parameters) {
    // Inject contextId in parameters
    return $publish(
      name,
      Object.assign(parameters, {
        contextId: this.contextId,
      }),
    );
  };
  return instance;
};

/**
 * Resolve providers with dynamicly injected values
 * @param {ServerClient} client
 * @param {ScanOutput} output
 */
export const resolve = (client: ServerClient, output: ScanOutput) => [
  ...output.platform.map((PlatformService: Service) => ({
    provide: PlatformService,
    useValue: createAsyncService(client, PlatformService),
  })),
  ...output.custom.map((CustomCloudService: CustomCloudService) => ({
    provide: CustomCloudService,
    useClass: CustomCloudService,
  })),
];

/**
 * Test if the value parameter in a function
 * @param {Object} value
 * @returns {Boolean}
 */
const isFunction = (value: any) => typeof value === Function.name.toLowerCase();

/**
 * Return a cleaned WorkerDecleration
 * @param {WorkerDeclaration} declaration
 */
export const clean = (declaration: WorkerDeclaration) =>
  Object.entries(normalize(declaration))
    .filter(([namespace, CustomCloudService]: any[]) =>
      isFunction(CustomCloudService),
    )
    .reduce(
      (cleaned: any, [namespace, CustomCloudService]: any[]) => ({
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
export const normalize = (declaration: WorkerDeclaration) => {
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
export const instantiate = (
  client: ServerClient,
  declaration: WorkerDeclaration,
  ReflectiveInjector: Injector,
) => {
  let singleton;
  let output;
  try {
    const cleaned = clean(declaration);
    output = analyze(cleaned);
    const providers = resolve(client, output);
    const injector = ReflectiveInjector.resolveAndCreate(providers);
    // Flag all instance as CloudServiceInstance
    providers.forEach((provider) => {
      const instance = injector.get(provider.provide);
      CloudServiceInstance.flag(instance);
    });
    // Convert bootlayer declaration to instances
    output.bootLayer.forEach((layer) => {
      layer.forEach((CloudService, key) => {
        const instance = injector.get(CloudService);
        layer[key] = instance;
      });
    });
    // Reduce singleton from namespaced
    singleton = Object.entries(cleaned).reduce(
      (instance: any, [namespace, CustomCloudService]: any[]) => {
        instance[namespace] = injector.get(CustomCloudService);
        return instance;
      },
      {},
    );
  } catch (ex) {
    error('instantiate', ex);
  }
  log('instanciate', singleton);
  singleton.bootLayers = output.bootLayer;
  return singleton;
};
