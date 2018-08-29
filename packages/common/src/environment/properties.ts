import { BaseError } from '../error';
import { Json5ConfigurationProperties } from './json5-properties';
import { EnvironmentVariablesConfigurationProperties } from './env-variables-properties';
import { PriorizedConfigurationProperties } from './priorized-properties';
import { ConfigurationProperties, Loadable } from '@zetapush/core';
import { existsSync } from 'fs';
import { missingKeyError } from './utils';
import { loadavg } from 'os';

export class ConfigurationError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationStateError extends ConfigurationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationFileLoadError extends ConfigurationError {
  constructor(message: string, public file: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationReloadError extends ConfigurationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}
export class MissingConfigurationProperty extends ConfigurationError {
  constructor(message: string, public key: string, cause?: Error) {
    super(message, cause);
  }
}

// TODO: value can be variables ${other-key} => resolve recursively
// TODO: reloadable
// TODO: proxy all values for auto-reload
// TODO: allow different key formats (camel case, pascal case, kebab) for same value ?

const availableOnly = async (all: Array<ConfigurationProperties | null>) => {
  const available = [];
  for (let delegate of all) {
    if (!delegate) {
      continue;
    }
    const loadable = <any>delegate;
    if (loadable.canLoad) {
      // if loadable => keep only those that can load
      if (await loadable.canLoad()) {
        available.push(delegate);
      }
    } else {
      // not loadable => keep it
      available.push(delegate);
    }
  }
  return available;
};

const load = async (delegates: ConfigurationProperties[]) => {
  for (let delegate of delegates) {
    const loadable = <any>delegate;
    if (loadable.load) {
      await loadable.load();
    }
  }
};

export const defaultConfigurationPropertiesFactory = async (
  envName: string,
  basePath: string,
  externalBasePath?: string
) => {
  const all = [
    // new CommandLineArgumentConfigurationProperties(),
    new EnvironmentVariablesConfigurationProperties(),
    // remote configuration for environment
    // new HttpConfigurationProperties(`${console.url}/${envName}`), // console for example
    // new GitConfigurationProperties(`${git - url}`, `${branch}`),
    // configuration file for environment outside code
    // new YamlConfigurationProperties(`${process.env.CONFIG_PATH}/application-${envName}.yml`),
    externalBasePath ? new Json5ConfigurationProperties(`${externalBasePath}/application-${envName}.json`) : null,
    // new PropertiesFileConfigurationProperties(`${process.env.CONFIG_PATH}/application-${envName}.properties`),
    // configuration file for environment inside code
    // new YamlConfigurationProperties(`application-${envName}.yml`),
    new Json5ConfigurationProperties(`${basePath}/application-${envName}.json`),
    // new PropertiesFileConfigurationProperties(`application-${envName}.properties`),
    // remote configuration default
    // new HttpConfigurationProperties(`${console.url}`), // console for example
    // new GitConfigurationProperties(`${git - url}`, `${branch}`),
    // configuration default file outside code
    // new YamlConfigurationProperties(`${process.env.CONFIG_PATH}/application.yml`),
    externalBasePath ? new Json5ConfigurationProperties(`${externalBasePath}/application.json`) : null,
    // new PropertiesFileConfigurationProperties(`${process.env.CONFIG_PATH}/application.properties`),
    // configuration default file inside code
    // new YamlConfigurationProperties(`application.yml`),
    new Json5ConfigurationProperties(`${basePath}/application.json`)
    // new PropertiesFileConfigurationProperties(`application.properties`)
  ];
  const available = await availableOnly(all);
  await load(available);
  return new PriorizedConfigurationProperties(...available);
};
