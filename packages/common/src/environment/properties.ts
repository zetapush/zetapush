export interface ReloadableConfigurationProperties {
  reload(): Promise<void>;
}

// TODO: value can be variables ${other-key} => resolve recursively
// TODO: reloadable
// TODO: proxy all values for auto-reload
// TODO: use proxies to values recursively
// TODO: allow different key formats (camel case, pascal case, kebab) for same value ?

export const DEFAULT_CONFIGURATION_PROPERTIES = new PriorizedConfigurationProperties(
  new CommandLineArgumentConfigurationProperties(),
  new EnvironmentVariablesConfigurationProperties(),
  // remote configuration for environment
  new HttpConfigurationProperties(`${console.url}/${envName}`), // console for example
  new GitConfigurationProperties(`${git - url}`, `${branch}`),
  // configuration file for environment outside code
  new YamlConfigurationProperties(`${process.env.CONFIG_PATH}/application-${envName}.yml`),
  new JsonConfigurationProperties(`${process.env.CONFIG_PATH}/application-${envName}.json`),
  new PropertiesFileConfigurationProperties(`${process.env.CONFIG_PATH}/application-${envName}.properties`),
  // configuration file for environment inside code
  new YamlConfigurationProperties(`application-${envName}.yml`),
  new JsonConfigurationProperties(`application-${envName}.json`),
  new PropertiesFileConfigurationProperties(`application-${envName}.properties`),
  // remote configuration default
  new HttpConfigurationProperties(`${console.url}`), // console for example
  new GitConfigurationProperties(`${git - url}`, `${branch}`),
  // configuration default file outside code
  new YamlConfigurationProperties(`${process.env.CONFIG_PATH}/application.yml`),
  new JsonConfigurationProperties(`${process.env.CONFIG_PATH}/application.json`),
  new PropertiesFileConfigurationProperties(`${process.env.CONFIG_PATH}/application.properties`),
  // configuration default file inside code
  new YamlConfigurationProperties(`application.yml`),
  new JsonConfigurationProperties(`application.json`),
  new PropertiesFileConfigurationProperties(`application.properties`)
);

export class YamlConfigurationProperties {
  constructor(private file: PathLike) {}
}
export class PropertiesFileConfigurationProperties {
  constructor(private file: PathLike) {}
}

export class JsonConfigurationProperties {
  constructor(private file: PathLike) {}
}

export class PriorizedConfigurationProperties {
  private delegates: ConfigurationProperties[];
  constructor(...delegates: ConfigurationProperties[]) {
    this.delegates = delegates;
  }
}
export class EnvironmentVariablesConfigurationProperties {
  constructor(private keyConverter) {}
}
export class CommandLineArgumentConfigurationProperties {}
export class GitConfigurationProperties {}
export class HttpConfigurationProperties {}

export class CachedConfigurationProperties {
  constructor(private validity: number) {}
}
