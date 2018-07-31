import { ReflectiveInjector, Provider } from '@zetapush/core';

// import { constructDependencies, ReflectiveDependency } from 'injection-js/reflective_provider';
// const { constructDependencies, ReflectiveDependency } = require('esm')(module)('injection-js/reflective_provider');
// require = require('esm')(module)
// const { constructDependencies } = require('esm')(module)('injection-js/reflective_provider');
// type InjectionJsReflectiveDependency = ReflectiveDependency;

import { DEFAULTS } from '../defaults';
import { log, error } from '../utils/log';

import { CloudServiceInstance } from './CloudServiceInstance';

import { CustomCloudService, WorkerDeclaration, Service, ServerClient } from '../common-types';

type InjectionJsReflectiveDependency = any;

class ScanOutput {
  public custom: Array<CustomCloudService>;
  public platform: Array<Service>;
  public bootLayer: Array<Service>;
  public reflectiveDependencies: Array<InjectionJsReflectiveDependency>;

  constructor() {
    this.custom = [];
    this.platform = [];
    this.bootLayer = [];
    this.reflectiveDependencies = [];
  }
}

const getInjectionMetadata = (target: any) => {
  const params = Reflect.hasMetadata('design:paramtypes', target)
    ? Reflect.getMetadata('design:paramtypes', target)
    : target.parameters;
  if (!params) {
    return params;
  }
  // FIXME: handle @Inject
  // const deps = constructDependencies(target, params);
  return params.map((v: any, i: number) => ({ injected: v, reflectiveDependency: /*deps[i]*/ null }));
};

const isToken = (reflectiveDependency: any) => Boolean(reflectiveDependency) && reflectiveDependency.key.token;

export const scan = (CustomCloudService: CustomCloudService, output = new ScanOutput(), layer = 0) => {
  if (isFunction(CustomCloudService)) {
    const metadata = getInjectionMetadata(CustomCloudService);
    if (Array.isArray(metadata)) {
      const toScan: Array<{ provider: CustomCloudService; output: ScanOutput }> = [];
      const addToScan: CustomCloudService[] = [];
      metadata.forEach(({ injected, reflectiveDependency }) => {
        // metadata.forEach((injected) => {
        const provider = injected;
        if (isFunction(provider)) {
          if (isToken(reflectiveDependency)) {
            // If the dependency is decorated with @Inject, the dependency MUST be
            // created using an explicit Provider
            output.reflectiveDependencies.push(reflectiveDependency);
          } else if (Array.isArray(getInjectionMetadata(provider))) {
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
    if (CustomCloudService.DEFAULT_DEPLOYMENT_ID) {
      output.platform.push(CustomCloudService);
    } else {
      // Add CustomCloudService
      output.custom.push(CustomCloudService);
    }
  }
  return output;
};

export const scanProvider = (provider: Provider, output = new ScanOutput()) => {
  if ((<any>provider).deps) {
    (<any>provider).deps.map((dep: Service) => scan(dep, output));
  }
};

export const filterProviders = (providers: Provider[], customProviders: Provider[]) => {
  const filtered: Provider[] = [];
  for (let provider of providers) {
    let provide = (<any>provider).provide;
    if (!customProviders.some((p: any) => p.provide === provide)) {
      filtered.push(provider);
    }
  }
  return filtered.concat(customProviders);
};

/**
 * Resolve injected services
 * @param {WorkerDeclaration} declaration
 * @return {ScanOutput}
 */
export const analyze = (declaration: WorkerDeclaration, customProviders: Provider[]) => {
  const cleaned = clean(declaration);
  const output = new ScanOutput();
  const baseApi: CustomCloudService[] = [];
  Object.values(cleaned).map((CustomCloudService: CustomCloudService) => {
    scan(CustomCloudService, output);
    baseApi.push(CustomCloudService);
  });
  customProviders.map((provider: Provider) => scanProvider(provider, output));
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
  output.reflectiveDependencies = Array.from(new Set(output.reflectiveDependencies));
  // Normalized output
  return output;
};

/**
 * Creare platform service instance
 * @param {Object} client
 * @param {Object} Type
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
 * @param {ServerClient} client
 * @param {ScanOutput} output
 */
export const resolve = (client: ServerClient, output: ScanOutput) => [
  ...output.platform.map((PlatformService: Service) => ({
    provide: PlatformService,
    useValue: createAsyncService(client, PlatformService)
  })),
  ...output.reflectiveDependencies.map((reflective: InjectionJsReflectiveDependency) => ({
    provide: reflective.key.token,
    useFactory: () => {
      // FIXME: handle @Inject
      throw new Error('@Inject and InjectionToken are not working for now');
    },
    deps: []
  })),
  ...output.custom.map((CustomCloudService: CustomCloudService) => ({
    provide: CustomCloudService,
    useClass: CustomCloudService
  }))
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
    .filter(([namespace, CustomCloudService]: any[]) => isFunction(CustomCloudService))
    .reduce(
      (cleaned: any, [namespace, CustomCloudService]: any[]) => ({
        ...cleaned,
        [namespace]: CustomCloudService
      }),
      {}
    );

/**
 * Normalize worker declaration
 * @param {Object} declaration
 * @return {WorkerDeclaration}
 */
export const normalize = (declaration: WorkerDeclaration) => {
  if (isFunction(declaration)) {
    return {
      [DEFAULTS.DEFAULT_NAMESPACE]: declaration
    };
  } else if (typeof declaration === Object.name.toLowerCase()) {
    if (declaration.__esModule === true) {
      // warn(`ES Modules are not yet fully supported`);
      // Support ES Module
      if (isFunction(declaration.default)) {
        return {
          [DEFAULTS.DEFAULT_NAMESPACE]: declaration.default
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

export const DEFAULT_INJECTOR_INSTANCE = 'DEFAULT_INJECTOR_INSTANCE';

/**
 * Resolve and inject dependencies
 * @param {ServerClient} client
 * @param {WorkerDeclaration} declaration
 */
export const instantiate = (client: ServerClient, declaration: WorkerDeclaration, customProviders: Provider[]) => {
  let singleton;
  try {
    const cleaned = clean(declaration);
    const output = analyze(cleaned, customProviders);
    const providers = resolve(client, output);
    const priorizedProviders = filterProviders(providers, customProviders);
    const injector = ReflectiveInjector.resolveAndCreate(priorizedProviders);
    // Flag all instance as CloudServiceInstance
    providers.forEach((provider) => {
      const instance = injector.get(provider.provide);
      CloudServiceInstance.flag(instance);
    });
    // Convert bootlayer declaration to instances
    output.bootLayer.forEach((layer) => {
      layer.forEach((CloudService: CustomCloudService, key: any) => {
        const instance = injector.get(CloudService);
        layer[key] = instance;
      });
    });
    singleton = Object.entries(cleaned).reduce((instance: any, [namespace, CustomCloudService]: any[]) => {
      instance[namespace] = injector.get(CustomCloudService);
      return instance;
    }, {});
    singleton[DEFAULT_INJECTOR_INSTANCE] = injector;
    singleton.bootLayers = output.bootLayer;
  } catch (ex) {
    error('instantiate', ex);
  }
  log('instantiate', singleton);
  return singleton;
};
