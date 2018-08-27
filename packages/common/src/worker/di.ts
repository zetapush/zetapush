import {
  isDecoratedModule,
  getDecoratedModule,
  Module,
  Provider,
  ReflectiveInjector,
  Environment,
  Class,
  FactoryProvider,
  ClassProvider,
  ValueProvider
} from '@zetapush/core';
import { DEFAULTS } from '../defaults';
import { trace, error } from '../utils/log';
import {
  CustomCloudService,
  NormalizedWorkerDeclaration,
  WorkerDeclaration,
  Service,
  ServerClient,
  WorkerDeclarationNormalizer
} from '../common-types';
import { CloudServiceInstance } from './CloudServiceInstance';

/**
 * Test if the value parameter in a function
 */
const isFunction = (value: any) => typeof value === Function.name.toLowerCase();

/**
 * Test if the value parameter in a function
 */
const isObject = (value: any) => typeof value === Object.name.toLowerCase();

/**
 * Get providers by configurers
 */
const getProvidersByConfigurers = (configurers: any[], environment?: Environment) => {
  return Promise.all(
    configurers
      .map((Configurer) => new Configurer())
      .map((configurer) => (configurer.configure(environment), configurer))
      .map((configurer) => configurer.getProviders() as Promise<Provider[]>)
  ).then((configured) => configured.reduce((providers, next) => [...providers, ...next], []));
};

/**
 * Recursivly get providers from imported modules
 */
const getProvidersByImports = async (imports: Class[], imported: Provider[] = []): Promise<Provider[]> => {
  return (
    Promise.all(
      imports
        // Ignore non decorated module
        .filter((module) => isDecoratedModule(module))
        // Get decorated module information
        .map((decorated) => getDecoratedModule(decorated))
        // Merge imported providers
        .map(async (m) => [
          // Recursivly get imported providers
          ...(await getProvidersByImports(m.imports || [], imported)),
          // Add configured providers from configures
          ...(await getProvidersByConfigurers(m.configurers || [])),
          // Add static providers
          ...(m.providers || [])
        ])
    )
      // Flatten providers list
      .then((configured) => configured.reduce((providers, next) => [...providers, ...next], imported))
  );
};

/**
 * Get injectation metadata via Reflection Api
 */
const getInjectionMetadata = (target: any) => {
  return Reflect.hasMetadata('design:paramtypes', target) ? Reflect.getMetadata('design:paramtypes', target) : [];
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
 * Data structure to contains scan ouput of exposed Cloud Service
 */
class ScanOutput {
  custom: Array<CustomCloudService> = [];
  platform: Array<Service> = [];
  bootLayer: Array<Service> = [];
}

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
 * A worker declaration is the object return by worker project entry point
 */
export const normalize = async (declaration: WorkerDeclaration): Promise<Module> => {
  // Entry point must return an object
  if (typeof declaration === Object.name.toLowerCase()) {
    // Entry point must be an EcmaScript Module
    if (declaration.__esModule === true) {
      if (isFunction(declaration.default)) {
        if (isDecoratedModule(declaration.default)) {
          // [Advanced Mode]: Developer can export a Module class
          return getDecoratedModule(declaration.default);
        } else {
          // [Compatibility Mode]: Developer can export a single Api class
          return {
            expose: {
              [DEFAULTS.DEFAULT_NAMESPACE]: declaration.default
            },
            providers: [],
            imports: [],
            configurers: []
          };
        }
      } else if (isObject(declaration.default)) {
        // [Compatibility Mode]: Developer can export a namespaced dictionnary
        return {
          expose: declaration.default,
          providers: [],
          imports: [],
          configurers: []
        };
      } else {
        error(`Unsupported Worker declaration`);
        throw new Error(`Unsupported Worker declaration, only Api, Module and Namespace are supported`);
      }
    } else {
      error(`Unsupported Worker declaration, only EcmaScript module are supported`);
      throw new Error(`Unsupported Worker declaration`);
    }
  } else {
    error(`Unsupported Worker declaration, invalid worker content`);
    throw new Error(`Unsupported Worker declaration`);
  }
};

/**
 * Recursivly scan CloudService DI Graph
 */
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
      registerInBootLayers(addToScan, output, layer);
      toScan.forEach((sc) => scan(sc.provider, sc.output, layer + 1));
    }
    registerCloudService(CustomCloudService, output);
    registerInBootLayers([CustomCloudService], output, layer);
  }
  return output;
};

const registerCloudService = (type: CustomCloudService, output: ScanOutput) => {
  if (type.DEFAULT_DEPLOYMENT_ID) {
    output.platform.push(type);
  } else {
    // Add CustomCloudService
    output.custom.push(type);
  }
};

const registerInBootLayers = (types: CustomCloudService[], output: ScanOutput, layer: number) => {
  if (output.bootLayer[layer] === undefined) {
    output.bootLayer.push(types);
  } else {
    output.bootLayer[layer] = output.bootLayer[layer].concat(types);
  }
};

export const scanProvider = (provider: Provider, output = new ScanOutput()) => {
  const deps = (<FactoryProvider>provider).deps;
  const useClass = (<ClassProvider>provider).useClass;
  const useValue = (<ValueProvider>provider).useValue;
  if (deps) {
    deps.map((dep: Service) => {
      scan(dep, output);
    });
  } else if (useClass) {
    scan(useClass, output);
  } else if (useValue) {
    const type = (<ValueProvider>provider).provide;
    registerCloudService(type, output);
    registerInBootLayers([type], output, 0);
  }
};

export const scanProviders = (providers: Provider[], output = new ScanOutput()) => {
  // providers can have dependencies => need to be scanned
  providers.map((provider: Provider) => scanProvider(provider, output));
  return output;
};

export const resolveProviders = (client: ServerClient, providers: Provider[]) => {
  const analyzedProviders = scanProviders(providers || []);
  const resolved = resolve(client, analyzedProviders);
  return [...resolved, ...providers];
};

export const filterProviders = (providers: Provider[]) => {
  const filtered: Provider[] = [];
  for (let i = providers.length - 1; i > 0; i--) {
    const provider = providers[i];
    let provide = (<any>provider).provide;
    if (!filtered.some((p: any) => p.provide === provide)) {
      filtered.push(provider);
    }
  }
  return filtered.reverse();
};

/**
 * Resolve injected services
 */
export const analyze = (exposed: NormalizedWorkerDeclaration) => {
  const output = new ScanOutput();
  const services: CustomCloudService[] = [];
  Object.values(exposed).map((CustomCloudService: CustomCloudService) => {
    scan(CustomCloudService, output);
    services.push(CustomCloudService);
  });
  output.bootLayer.reverse();
  // output.bootLayer.push(baseApi);
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
export const instantiate = async (
  client: ServerClient,
  declaration: WorkerDeclaration,
  customNormalizer: WorkerDeclarationNormalizer = normalize
) => {
  let singleton;
  try {
    // Normalize worker declaration
    const normalized = await customNormalizer(declaration);
    // Get providers from imports module list
    const imported = resolveProviders(client, await getProvidersByImports(normalized.imports || []));
    // Get exposed CloudService
    const exposed = clean(normalized.expose);
    // Analyze exposed CloudService to get an order providers list
    const analyzed = analyze(exposed);
    // Get a resolved list of providers used in exposed DI graph
    const resolved = resolve(client, analyzed);
    // Configured providers
    const configured = resolveProviders(client, await getProvidersByConfigurers(normalized.configurers || []));
    // Explicit providers
    const providers = resolveProviders(client, normalized.providers || []);
    // Priorize providers
    const priorized = [
      ...resolved, // Providers via scan of exposed DI Graph
      ...imported, // Providers via imports module list
      ...configured, // Providers via configurer
      ...providers // Providers via module provider
    ];

    // Create a root injector
    const injector = ReflectiveInjector.resolveAndCreate(priorized);
    // Flag all instance as CloudServiceInstance
    priorized.forEach((provider: any) => {
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
    throw ex;
  }
  trace('instantiate', singleton);
  return singleton;
};
