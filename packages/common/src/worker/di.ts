import { isDecoratedModule, getDecoratedModule, Module, Provider, ReflectiveInjector } from '@zetapush/core';
import { DEFAULTS } from '../defaults';
import { trace, error } from '../utils/log';
import {
  CustomCloudService,
  NormalizedWorkerDeclaration,
  WorkerDeclaration,
  Service,
  ServerClient
} from '../common-types';
import { CloudServiceInstance } from './CloudServiceInstance';

/**
 * Test if the value parameter in a function
 * @param {Object} value
 * @returns {Boolean}
 */
const isFunction = (value: any) => typeof value === Function.name.toLowerCase();

/**
 * Get providers by configurers
 */
const getProvidersByConfigurers = (configurers: any[]) => {
  return Promise.all(
    configurers
      .map((Configurer) => new Configurer())
      .map(
        (configurer) => (
          configurer.configure({
            // TODO: Inject environement
          }),
          configurer
        )
      )
      .map((configurer) => configurer.getProviders() as Promise<Provider[]>)
  ).then((configured) => configured.reduce((providers, next) => [...providers, ...next], []));
};

/**
 * Return a cleaned & normalized WorkerDecleration
 */
export const clean = (exposed: WorkerDeclaration): NormalizedWorkerDeclaration => {
  exposed = isFunction(exposed)
    ? {
        [DEFAULTS.DEFAULT_NAMESPACE]: exposed
      }
    : exposed;
  const cleaned = Object.entries(exposed)
    .filter(([namespace, CustomCloudService]: any[]) => isFunction(CustomCloudService))
    .reduce(
      (cleaned: any, [namespace, CustomCloudService]: any[]) => ({
        ...cleaned,
        [namespace]: CustomCloudService
      }),
      {}
    );
  return cleaned;
};

/**
 * Normalize worker declaration
 * @param {Object} declaration
 * @return {WorkerDeclaration}
 */
export const normalize = (declaration: WorkerDeclaration): Module => {
  if (typeof declaration === Object.name.toLowerCase()) {
    if (declaration.__esModule === true) {
      if (isFunction(declaration.default)) {
        if (isDecoratedModule(declaration.default)) {
          return getDecoratedModule(declaration.default);
        } else {
          return {
            expose: {
              [DEFAULTS.DEFAULT_NAMESPACE]: declaration.default
            },
            providers: [],
            imports: [],
            configurers: []
          };
        }
      } else {
        error(`Unsupported Worker declaration`);
        throw new Error(`Unsupported Worker declaration`);
      }
    } else {
      error(`Unsupported Worker declaration`);
      throw new Error(`Unsupported Worker declaration`);
    }
  } else {
    error(`Unsupported Worker declaration`);
    throw new Error(`Unsupported Worker declaration`);
  }
};

class ScanOutput {
  public custom: Array<CustomCloudService> = [];
  public platform: Array<Service> = [];
  public bootLayer: Array<Service> = [];
}

const getInjectionMetadata = (target: any) => {
  return Reflect.hasMetadata('design:paramtypes', target) ? Reflect.getMetadata('design:paramtypes', target) : [];
};

export const scan = (CustomCloudService: CustomCloudService, output = new ScanOutput(), layer = 0) => {
  if (isFunction(CustomCloudService)) {
    const metadata = getInjectionMetadata(CustomCloudService);
    if (Array.isArray(metadata)) {
      const toScan: Array<{ provider: CustomCloudService; output: ScanOutput }> = [];
      const addToScan: CustomCloudService[] = [];
      metadata.forEach((provider) => {
        if (isFunction(provider)) {
          if (getInjectionMetadata(provider).length) {
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
      toScan.forEach((sc) => scan(sc.provider, sc.output, layer + 1));
    }
    if (CustomCloudService.DEFAULT_DEPLOYMENT_ID) {
      output.platform.push(CustomCloudService);
    } else {
      // Add CustomCloudService
      output.custom.push(CustomCloudService);
    }
  }
  return output;
};

/**
 * Resolve injected services
 * @param {ExposedCloudService} declaration
 * @return {ScanOutput}
 */
export const analyze = (exposed: NormalizedWorkerDeclaration) => {
  const output = new ScanOutput();
  const services: CustomCloudService[] = [];
  Object.values(exposed).map((CustomCloudService: CustomCloudService) => {
    scan(CustomCloudService, output);
    services.push(CustomCloudService);
  });
  output.bootLayer.reverse();
  output.bootLayer.push(services);
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
 * Create platform service instance
 */
const createAsyncService = (client: ServerClient, Type: Service) => {
  const instance = client.createAsyncService({
    Type
  });
  const $publish = instance.$publish;
  // Override $publish method with scopable `function`
  instance.$publish = function $$publish(name: string, parameters: any) {
    // Inject contextId in parameters
    return $publish(
      name,
      Object.assign(parameters, {
        contextId: this.contextId
      })
    );
  };
  return instance;
};

/**
 * Resolve providers with dynamicly injected values
 */
export const resolve = (client: ServerClient, output: ScanOutput): Provider[] => [
  ...output.platform.map((PlatformService: Service) => ({
    provide: PlatformService,
    useValue: createAsyncService(client, PlatformService)
  })),
  ...output.custom.map((CustomCloudService: CustomCloudService) => ({
    provide: CustomCloudService,
    useClass: CustomCloudService
  }))
];

/**
 * Resolve and inject dependencies
 */
export const instantiate = async (client: ServerClient, declaration: WorkerDeclaration) => {
  let singleton;
  try {
    // Normalize worker declaration
    const normalized = normalize(declaration);
    // Get exposed CloudService
    const exposed = clean(normalized.expose);
    // Analyze exposed CloudService to get an order providers list
    const analyzed = analyze(exposed);
    // Get a resolved list of providers used in exposed DI graph
    const resolved = resolve(client, analyzed);
    // Configured providers
    const configured = await getProvidersByConfigurers(normalized.configurers || []);
    // Explicit providers
    const providers = normalized.providers || [];
    // Priorize providers
    const priorized = [
      ...resolved, // Providers via scan of xposed  DI Graph
      ...configured, // Providers via configurer
      ...providers // Providers via module provider
    ];
    // Create a root injector
    const injector = ReflectiveInjector.resolveAndCreate(priorized);
    // Flag all instance as CloudServiceInstance
    providers.forEach((provider) => {
      const token = isFunction(provider) ? provider : (provider as any).provide;
      const instance = injector.get(token);
      CloudServiceInstance.flag(instance);
    });
    // Convert bootlayer declaration to instance
    analyzed.bootLayer.forEach((layer) => {
      layer.forEach((CloudService: CustomCloudService, key: any) => {
        const instance = injector.get(CloudService);
        layer[key] = instance;
      });
    });
    // Create a singleton mapped to exposed namespace
    singleton = Object.entries(exposed).reduce((instance: any, [namespace, CustomCloudService]: any[]) => {
      instance[namespace] = injector.get(CustomCloudService);
      return instance;
    }, Object.create(null));
    // Add bootlayers reference in singleton instance
    singleton.bootLayers = analyzed.bootLayer;
  } catch (ex) {
    error('instantiate', ex);
  }
  trace('instantiate', singleton);
  return singleton;
};
