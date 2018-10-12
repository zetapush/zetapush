import { ResolvedConfig, ServerClient } from '../common-types';
import { LocalServerRegistry } from '../utils/server-registry';
import { PriorizedConfigurationProperties } from './priorized-properties';
import { Json5ConfigurationProperties } from './json5-properties';
import { EnvironmentVariablesConfigurationProperties } from './env-variables-properties';
import { ConfigurationProperties, Environment } from '@zetapush/core';
import { PlatformEventContext } from './platform-event-context';
import { trace } from '../utils/log';
import { LocalServerRegistryZetaPushContext } from './local-server-registry-context';
import { EnvironmentProvider } from './environment-provider';
import { availableOnly, load } from './utils';

export const defaultEnvironmentProvider = (
  config: ResolvedConfig,
  envName: string,
  baseDir: string,
  registry: LocalServerRegistry,
  externalConfPath = process.env.CONFIG_PATH
) => {
  // TODO: also handle application.json for the right worker (based on worker name and worker dir) see #ZPV3-139
  return new LocalOrPushedEnvironmentProvider(
    new LocalDevEnvironmentProvider(config, envName, baseDir, registry, externalConfPath),
    new PushedEnvironmentProvider(config, envName, baseDir, registry, externalConfPath)
  );
};

export const defaultIsPushed = (): boolean => {
  return process.env.ZETAPUSH_RUN_IN_CLOUD === 'true';
};

export class LocalOrPushedEnvironmentProvider implements EnvironmentProvider {
  constructor(
    private local: EnvironmentProvider,
    private pushed: EnvironmentProvider,
    private isPushed = defaultIsPushed
  ) {}

  async get(client: ServerClient, queueApi: any): Promise<Environment> {
    if (this.isPushed()) {
      return await this.pushed.get(client, queueApi);
    } else {
      return await this.local.get(client, queueApi);
    }
  }
}

export class LocalDevEnvironmentProvider implements EnvironmentProvider {
  constructor(
    private config: ResolvedConfig,
    private envName: string,
    private confPath: string,
    private registry: LocalServerRegistry,
    private externalConfPath = process.env.CONFIG_PATH
  ) {}

  async get(): Promise<Environment> {
    trace('confPath', process.cwd() + '/' + this.confPath);
    trace('externalConfPath', this.externalConfPath);
    return {
      name: this.envName,
      context: await defaultLocalZetaPushContextFactory(this.config, this.registry),
      properties: await defaultConfigurationPropertiesFactory(this.envName, this.confPath, this.externalConfPath),
      variables: process.env
    };
  }
}

export class PushedEnvironmentProvider implements EnvironmentProvider {
  constructor(
    private config: ResolvedConfig,
    private envName: string,
    private confPath: string,
    private registry: LocalServerRegistry,
    private externalConfPath = process.env.CONFIG_PATH
  ) {}

  async get(client: ServerClient, queueApi: any): Promise<Environment> {
    trace('confPath', process.cwd() + '/' + this.confPath);
    trace('externalConfPath', this.externalConfPath);
    return {
      name: this.envName,
      context: await defaultPushedZetaPushContextFactory(this.config, client, queueApi, this.registry),
      properties: await defaultConfigurationPropertiesFactory(this.envName, this.confPath, this.externalConfPath),
      variables: process.env
    };
  }
}

export const defaultLocalZetaPushContextFactory = async (config: ResolvedConfig, registry: LocalServerRegistry) => {
  const context = new LocalServerRegistryZetaPushContext(config, registry); // TODO: ZPV3-425
  await load([context]);
  return context;
};

export const defaultPushedZetaPushContextFactory = async (
  config: ResolvedConfig,
  client: ServerClient,
  queueApi: any,
  serverRegistry: LocalServerRegistry
) => {
  const context = new PlatformEventContext(config, client, queueApi, serverRegistry);
  await load([context]);
  return context;
};

// TODO: value can be variables ${other-key} => resolve recursively
// TODO: reloadable
// TODO: proxy all values for auto-reload
// TODO: allow different key formats (camel case, pascal case, kebab) for same value ?

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
