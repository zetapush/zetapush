import 'reflect-metadata';

import { DEFAULTS } from '../defaults';
import { log, error } from '../utils/log';

import { CustomCloudService, WorkerDeclaration, Service, ServerClient } from '../common-types';
import { ReflectiveInjector, Provider } from 'injection-js';
import { constructDependencies, ReflectiveDependency } from 'injection-js/reflective_provider';

class ScanOutput {
  public custom: Array<CustomCloudService>;
  public platform: Array<Service>;
  public reflectiveDependencies: Array<ReflectiveDependency>;

  constructor() {
    this.custom = [];
    this.platform = [];
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
  const deps = constructDependencies(target, params);
  return params.map((v: any, i: number) => ({ injected: v, reflectiveDependency: deps[i] }));
};

const isToken = (reflectiveDependency: any) => Boolean(reflectiveDependency) && reflectiveDependency.key.token;

export const scan = (CustomCloudService: CustomCloudService, output = new ScanOutput()) => {
  if (isFunction(CustomCloudService)) {
    const metadata = getInjectionMetadata(CustomCloudService);
    if (Array.isArray(metadata)) {
      // const merged = metadata.map((v, i) => {injected: v, de});
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
  Object.values(cleaned).map((CustomCloudService: CustomCloudService) => scan(CustomCloudService, output));
  customProviders.map((provider: Provider) => scanProvider(provider, output));
  // Unicity
  output.custom = Array.from(new Set(output.custom));
  output.platform = Array.from(new Set(output.platform));
  output.reflectiveDependencies = Array.from(new Set(output.reflectiveDependencies));
  // Normalized output
  return output;
};

/**
 * Resolve providers with dynamicly injected values
 * @param {ServerClient} client
 * @param {ScanOutput} output
 */
export const resolve = (client: ServerClient, output: ScanOutput) => [
  ...output.platform.map((PlatformService: Service) => ({
    provide: PlatformService,
    useValue: client.createAsyncService({
      Type: PlatformService
    })
  })),
  ...output.reflectiveDependencies.map((reflective: ReflectiveDependency) => ({
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
    singleton = Object.entries(cleaned).reduce((instance: any, [namespace, CustomCloudService]: any[]) => {
      instance[namespace] = injector.get(CustomCloudService);
      return instance;
    }, {});
    singleton[DEFAULT_INJECTOR_INSTANCE] = injector;
  } catch (ex) {
    error('instantiate', ex);
  }
  log('instantiate', singleton);
  return singleton;
};
