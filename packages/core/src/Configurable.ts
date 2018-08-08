import { Class } from './Types';

let i = 0;

/*
export const CONFIGURATION_PROVIDER_KEY = 'ZetaPush:CloudServiceConfigurationProvider';

export const hasConfigurationProviderMetadata = (CloudServiceClass: any) => Reflect.hasMetadata(CONFIGURATION_PROVIDER_KEY, CloudServiceClass);

export const getConfigurationProviderMetadata = (CloudServiceClass: any) => hasConfigurationProviderMetadata(CloudServiceClass) ? Reflect.getMetadata(CONFIGURATION_PROVIDER_KEY, CloudServiceClass) : null

export const setConfigurationProviderMetadata = (CloudServiceClass: any, ConfigClass: any) => {
  Reflect.deleteMetadata(CONFIGURATION_PROVIDER_KEY, CloudServiceClass)
  Reflect.defineMetadata(CONFIGURATION_PROVIDER_KEY, {
    provide: ConfigClass
  }, CloudServiceClass);
}
*/
export const CONFIGURATION_PROVIDER_KEY = Symbol('ZetaPush:CloudServiceConfigurationProvider');

export const hasConfigurationProviderMetadata = (CloudServiceClass: any) =>
  typeof CloudServiceClass[CONFIGURATION_PROVIDER_KEY] !== 'undefined';

export const getConfigurationProviderMetadata = (CloudServiceClass: any) =>
  hasConfigurationProviderMetadata(CloudServiceClass) ? CloudServiceClass[CONFIGURATION_PROVIDER_KEY] : undefined;

export const setConfigurationProviderMetadata = (CloudServiceClass: any, ConfigClass: any) => {
  CloudServiceClass[CONFIGURATION_PROVIDER_KEY] = {
    provide: ConfigClass
  };
};

export function Configurable(ConfigClass: any) {
  return function ConfigurableDecorator<T extends Class>(CloudServiceClass: T) {
    setConfigurationProviderMetadata(CloudServiceClass, ConfigClass);
    return CloudServiceClass;
  };
}
