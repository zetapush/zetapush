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
  ValueProvider,
  ConfigurationProperties,
  ZetaPushContext
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
const getProvidersByConfigurers = (environment: Environment, configurers: any[]) => {
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
const getProvidersByImports = async (
  environment: Environment,
  imports: Class[],
  imported: Provider[] = []
): Promise<Provider[]> => {
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
          ...(await getProvidersByImports(environment, m.imports || [], imported)),
          // Add configured providers from configures
          ...(await getProvidersByConfigurers(environment, m.configurers || [])),
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
        contextId: this.requestContextId
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
  console.log('==> declaration : ', declaration);
  console.log('=== Object.name.toLowerCase() : ', Object.name.toLowerCase());

  // Entry point must return an object
  if (typeof declaration === Object.name.toLowerCase()) {
    // Entry point must be an EcmaScript Module
    console.log('==> a');
    if (declaration.__esModule === true) {
      console.log('==> b');
      if (isFunction(declaration[Object.keys(declaration)[0]])) {
        console.log('==> c');
        if (isDecoratedModule(declaration[Object.keys(declaration)[0]])) {
          console.log('==> d');
          // [Advanced Mode]: Developer can export a Module class
          return getDecoratedModule(declaration[Object.keys(declaration)[0]]);
        } else {
          // [Compatibility Mode]: Developer can export a single Api class
          console.log('==> e');
          return {
            expose: {
              [DEFAULTS.DEFAULT_NAMESPACE]: declaration[Object.keys(declaration)[0]]
            },
            providers: [],
            imports: [],
            configurers: []
          };
        }
      } else if (isObject(declaration[Object.keys(declaration)[0]])) {
        // [Compatibility Mode]: Developer can export a namespaced dictionnary
        console.log('==> f');
        return {
          expose: declaration[Object.keys(declaration)[0]],
          providers: [],
          imports: [],
          configurers: []
        };
      } else {
        console.log('==> g');
        error(`Unsupported Worker declaration`);
        throw new Error(`Unsupported Worker declaration, only Api, Module and Namespace are supported`);
      }
    } else {
      console.log('==> h');
      error(`Unsupported Worker declaration, only EcmaScript module are supported`);
      throw new Error(`Unsupported Worker declaration`);
    }
  } else {
    console.log('==> i');
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
  return {
    ...analyzedProviders,
    providers: [...resolved, ...providers]
  };
};

export const filterProviders = (providers: Provider[]) => {
  const filtered: Provider[] = [];
  for (let i = providers.length - 1; i >= 0; i--) {
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
export const analyzeService = (exposed: NormalizedWorkerDeclaration) => {
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

export interface DependencyInjectionAnalysis {
  /**
   * Original worker declaration
   */
  declaration: WorkerDeclaration;
  /**
   * The list of resolved providers after analysis
   */
  providers: Provider[];
  /**
   * The list of platform services
   */
  platformServices: Service[];
  /**
   * The exposed class or namespace/class pairs
   */
  exposed: NormalizedWorkerDeclaration;
  /**
   * Automatic scan result
   */
  analyzed: ScanOutput;
  /**
   * Merge boot layers
   */
  bootLayers: Service[];
}

export const analyze = async (
  client: ServerClient,
  declaration: WorkerDeclaration,
  env: Environment,
  customNormalizer: WorkerDeclarationNormalizer = normalize
): Promise<DependencyInjectionAnalysis> => {
  console.log('==> ANALYZE');
  const envProviders = makeEnvironmentInjectable(env);
  console.log('==> ANALYZE');
  // Normalize worker declaration
  const normalized = await customNormalizer(declaration);
  console.log('==> ANALYZE');
  // Get providers from imports module list
  const resolvedImports = resolveProviders(client, await getProvidersByImports(env, normalized.imports || []));
  console.log('==> ANALYZE');
  const imported = resolvedImports.providers;
  // Get exposed CloudService
  const exposed = clean(normalized.expose);
  console.log('==> ANALYZE');
  // Analyze exposed CloudService to get an ordered providers list
  const analyzed = analyzeService(exposed);
  console.log('==> ANALYZE');
  // Get a resolved list of providers used in exposed DI graph
  const resolved = resolve(client, analyzed);
  console.log('==> ANALYZE');
  // Configured providers
  const resolvedConfigured = resolveProviders(
    client,
    await getProvidersByConfigurers(env, normalized.configurers || [])
  );
  console.log('==> ANALYZE');
  const configured = resolvedConfigured.providers;
  // Explicit providers
  const resolvedProviders = resolveProviders(client, normalized.providers || []);
  console.log('==> ANALYZE');
  const providers = resolvedProviders.providers;
  // Priorize providers
  const priorized = filterProviders([
    ...resolved, // Providers via scan of exposed DI Graph
    ...imported, // Providers via imports module list
    ...configured, // Providers via configurer
    ...envProviders, // Providers for the environment
    ...providers // Providers via module provider
  ]);
  console.log('==> ANALYZE');
  const platformServices = getPlatformServices(priorized);
  const bootLayers = analyzed.bootLayer
    .concat(resolvedImports.bootLayer)
    .concat(resolvedConfigured.bootLayer)
    .concat(resolvedProviders.bootLayer);
  trace('analyzed providers', priorized);
  trace('analyzed platformServices', platformServices);
  trace('bootstrap layers', bootLayers);
  console.log('==> ANALYZE');
  return {
    declaration,
    providers: priorized,
    platformServices,
    exposed,
    analyzed,
    bootLayers
  };
};

/**
 * Resolve and inject dependencies
 */
export const instantiate = async (analysis: Array<DependencyInjectionAnalysis>) => {
  const workers: Array<any> = [];
  try {
    analysis.forEach((analyze) => {
      const { providers, bootLayers, exposed } = analyze;

      // Create a root injector
      const injector = ReflectiveInjector.resolveAndCreate(providers);

      // Flag all instance as CloudServiceInstance
      providers.forEach((provider: any) => {
        const token = isFunction(provider) ? provider : (provider as any).provide;
        const instance = injector.get(token);
        CloudServiceInstance.flag(instance);
      });

      // Convert bootlayer declaration to instance
      bootLayers.forEach((layer) => {
        layer.forEach((CloudService: CustomCloudService, key: any) => {
          const instance = injector.get(CloudService);
          layer[key] = instance;
        });
      });

      // Create a singleton mapped to exposed namespace
      const worker = Object.entries(exposed).reduce((instance: any, [namespace, CustomCloudService]: any[]) => {
        instance[namespace] = injector.get(CustomCloudService);
        return instance;
      }, Object.create(null));
      // Add bootlayers reference in singleton instance
      worker.bootLayers = bootLayers;
      const workerResult = {
        instance: worker,
        deploymentId: Object.keys(analyze.declaration)[0]
      };

      workers.push(workerResult);
    });
  } catch (ex) {
    error('instantiate', ex);
    throw ex;
  }
  trace('instantiate', workers);

  return workers;
};

export const getPlatformServices = (providers: Provider[]): Service[] => {
  return providers
    .map((provider: Provider) => (isFunction(provider) ? provider : (provider as any).provide))
    .filter((token: any) => !!token.DEFAULT_DEPLOYMENT_ID);
};

export const makeEnvironmentInjectable = (env: Environment): Provider[] => {
  trace('env', env.context);
  return [
    {
      provide: Environment,
      useValue: env
    },
    {
      provide: ConfigurationProperties,
      useValue: env.properties
    },
    {
      provide: ZetaPushContext,
      useValue: env.context
    }
  ];
};
