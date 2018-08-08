import { Class } from './Types';

let i = 0;

export type Environement = string | string[] | null;
/*
export const CONFIGURATION_KEY = 'ZetaPush:CloudServiceConfiguration';

export const hasConfigurationMetadata = (CloudServiceClass: any) => Reflect.hasMetadata(CONFIGURATION_KEY, CloudServiceClass);

export const getConfigurationMetadata = (CloudServiceClass: any) => hasConfigurationMetadata(CloudServiceClass) ? Reflect.getMetadata(CONFIGURATION_KEY, CloudServiceClass) : []

export const addConfigurationMetadata = (CloudServiceClass: any, ConfigClass: any, environement: Environement) => {
  const metadata = getConfigurationMetadata(CloudServiceClass);
  metadata.push({
    ConfigClass, environement
  });
  Reflect.defineMetadata(CONFIGURATION_KEY, metadata, CloudServiceClass);
}
*/

const setConfigurationMetadataByEnv = (CloudServiceClass: any, env: string, ConfigClass: any) => {
  const metadata =
    typeof CloudServiceClass[CONFIGURATION_KEY] !== 'undefined' ? CloudServiceClass[CONFIGURATION_KEY] : {};
  if (typeof metadata[env] === Function.name.toLowerCase()) {
    // throw new Error(`${CloudServiceClass.name}: Duplicate configuration for environment: ${env}`);
  }
  metadata[env] = ConfigClass;
  CloudServiceClass[CONFIGURATION_KEY] = metadata;
};

export const CONFIGURATION_KEY = Symbol('ZetaPush:CloudServiceConfiguration');

export const hasConfigurationMetadata = (CloudServiceClass: any, env: string) =>
  typeof CloudServiceClass[CONFIGURATION_KEY] !== 'undefined' &&
  typeof CloudServiceClass[CONFIGURATION_KEY][env] === Function.name.toLowerCase();

export const getConfigurationMetadata = (CloudServiceClass: any, env: string) =>
  hasConfigurationMetadata(CloudServiceClass, env) ? CloudServiceClass[CONFIGURATION_KEY][env] : {};

export const addConfigurationMetadata = (CloudServiceClass: any, ConfigClass: any, environement: Environement) => {
  if (Array.isArray(environement)) {
    environement.forEach((env) => {
      setConfigurationMetadataByEnv(CloudServiceClass, env, ConfigClass);
    });
  } else {
    setConfigurationMetadataByEnv(CloudServiceClass, environement || 'default', ConfigClass);
  }
};

export function Configure(CloudServiceClass: any, environement: Environement) {
  return function ConfiguredDecorator<T extends Class>(ConfigClass: T) {
    addConfigurationMetadata(CloudServiceClass, ConfigClass, environement);
    return ConfigClass;
  };
}
